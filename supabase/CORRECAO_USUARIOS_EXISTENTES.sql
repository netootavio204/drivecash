-- =====================================================================
-- CORREÇÃO: INICIALIZAR USUÁRIOS EXISTENTES & TORNAR RPC AUTO-SUFICIENTE
-- Cole este script no SQL Editor do Supabase e clique em RUN
-- =====================================================================

-- 1. Função para garantir que qualquer usuário tenha perfil, configurações e caixas
CREATE OR REPLACE FUNCTION public.fn_garantir_usuario_inicializado(p_user_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_email text;
  v_nome text;
BEGIN
  -- Se o perfil não existe, cria a partir de auth.users
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id) THEN
    SELECT email, COALESCE(raw_user_meta_data->>'nome', split_part(email, '@', 1))
    INTO v_email, v_nome FROM auth.users WHERE id = p_user_id;

    INSERT INTO public.profiles (id, nome)
    VALUES (p_user_id, COALESCE(v_nome, 'Motorista'))
    ON CONFLICT (id) DO NOTHING;
  END IF;

  -- Configurações padrão
  INSERT INTO public.configuracoes (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;

  -- Gamificação padrão
  INSERT INTO public.gamificacao_usuario (user_id) VALUES (p_user_id) ON CONFLICT (user_id) DO NOTHING;

  -- Caixa Principal
  IF NOT EXISTS (SELECT 1 FROM public.caixas WHERE user_id = p_user_id AND tipo = 'principal') THEN
    INSERT INTO public.caixas (user_id, tipo, nome, saldo_inicial_centavos, cor)
    VALUES (p_user_id, 'principal', 'Caixa do dia', 0, '#FF7A00');
  END IF;

  -- Caixa Manutenção
  IF NOT EXISTS (SELECT 1 FROM public.caixas WHERE user_id = p_user_id AND tipo = 'manutencao') THEN
    INSERT INTO public.caixas (user_id, tipo, nome, saldo_inicial_centavos, cor)
    VALUES (p_user_id, 'manutencao', 'Caixa Manutenção', 0, '#22C55E');
  END IF;

  -- Plataformas
  INSERT INTO public.plataformas (user_id, nome, cor, ordem) VALUES
    (p_user_id, 'Uber', '#FFFFFF', 1),
    (p_user_id, '99', '#FFC83D', 2),
    (p_user_id, 'inDrive', '#22C55E', 3),
    (p_user_id, 'Particular', '#FF7A00', 4),
    (p_user_id, 'Outros', '#B4B4BB', 5)
  ON CONFLICT DO NOTHING;

  -- Categorias
  INSERT INTO public.categorias (user_id, tipo, nome, icone, natureza, sistema, ordem) VALUES
    (p_user_id, 'entrada', 'Corridas', 'car', 'operacional', true, 1),
    (p_user_id, 'entrada', 'Gorjeta', 'coins', 'operacional', true, 2),
    (p_user_id, 'entrada', 'Bônus / Promoção', 'gift', 'operacional', true, 3),
    (p_user_id, 'entrada', 'Outras receitas', 'plus-circle', 'operacional', true, 4),
    (p_user_id, 'saida', 'Combustível', 'fuel', 'operacional', true, 1),
    (p_user_id, 'saida', 'Alimentação', 'utensils', 'operacional', true, 2),
    (p_user_id, 'saida', 'Crédito no app', 'smartphone', 'operacional', true, 3),
    (p_user_id, 'saida', 'Manutenção', 'wrench', 'operacional', true, 4),
    (p_user_id, 'saida', 'Lavagem', 'droplets', 'operacional', true, 5),
    (p_user_id, 'saida', 'Pedágio / Estacionamento', 'ticket', 'operacional', true, 6),
    (p_user_id, 'saida', 'Multa', 'alert-triangle', 'operacional', true, 7),
    (p_user_id, 'saida', 'Outras despesas', 'more-horizontal', 'operacional', true, 8),
    (p_user_id, 'saida', 'Retirada pessoal', 'wallet', 'retirada_pessoal', true, 9)
  ON CONFLICT DO NOTHING;
END $$;

-- 2. Atualizar rpc_abrir_dia com auto-inicialização e SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.rpc_abrir_dia(
  p_data_referencia date,
  p_km_inicial integer DEFAULT NULL,
  p_saldo_confirmado_centavos bigint DEFAULT NULL
) RETURNS public.dias_trabalho LANGUAGE plpgsql SECURITY DEFINER SET search_path = public, auth AS $$
DECLARE
  v_user uuid := auth.uid();
  v_caixa uuid;
  v_saldo bigint;
  v_dia public.dias_trabalho;
BEGIN
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'NAO_AUTENTICADO';
  END IF;

  -- Garante que o usuário logado possui perfil e caixas criados
  PERFORM public.fn_garantir_usuario_inicializado(v_user);

  IF EXISTS (SELECT 1 FROM public.dias_trabalho WHERE user_id = v_user AND status = 'aberto') THEN
    RAISE EXCEPTION 'DIA_ABERTO_EXISTENTE';
  END IF;

  IF EXISTS (SELECT 1 FROM public.dias_trabalho WHERE user_id = v_user AND data_referencia = p_data_referencia) THEN
    RAISE EXCEPTION 'DIA_JA_EXISTE_NESTA_DATA';
  END IF;

  SELECT id INTO v_caixa FROM public.caixas WHERE user_id = v_user AND tipo = 'principal';
  SELECT COALESCE(saldo_centavos, 0) INTO v_saldo FROM public.vw_saldo_caixas WHERE caixa_id = v_caixa;
  v_saldo := COALESCE(v_saldo, 0);

  INSERT INTO public.dias_trabalho (user_id, data_referencia, status, saldo_abertura_centavos, km_inicial)
  VALUES (v_user, p_data_referencia, 'aberto', COALESCE(p_saldo_confirmado_centavos, v_saldo), p_km_inicial)
  RETURNING * INTO v_dia;

  IF p_saldo_confirmado_centavos IS NOT NULL AND p_saldo_confirmado_centavos <> v_saldo THEN
    INSERT INTO public.lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem)
    VALUES (
      v_user, v_caixa, v_dia.id,
      (CASE WHEN p_saldo_confirmado_centavos > v_saldo THEN 'ajuste_entrada' ELSE 'ajuste_saida' END)::tipo_lancamento,
      abs(p_saldo_confirmado_centavos - v_saldo),
      'Ajuste na abertura do dia',
      'ajuste_abertura'
    );
  END IF;

  RETURN v_dia;
END $$;

-- 3. Executar imediatamente para todos os usuários cadastrados em auth.users
DO $$
DECLARE
  u record;
BEGIN
  FOR u IN SELECT id FROM auth.users LOOP
    PERFORM public.fn_garantir_usuario_inicializado(u.id);
  END LOOP;
END $$;
