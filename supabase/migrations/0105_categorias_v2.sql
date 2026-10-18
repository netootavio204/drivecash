-- Migração 0105: Categorias V2 (Taxa 99, Maquininha, Gorjeta e Devoluções)
-- 100% aditiva, segura e idempotente

create or replace function public.rpc_garantir_categorias_v2()
returns void
language plpgsql
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'NAO_AUTENTICADO';
  end if;

  insert into public.categorias (user_id, tipo, nome, icone, natureza, sistema, ordem)
  select v_user, x.tipo, x.nome, x.icone, 'operacional', true, x.ordem
  from (values
    ('saida', 'Taxa 99', 'percent', 20),
    ('saida', 'Taxa de maquininha', 'credit-card', 21),
    ('saida', 'Pacote Taxa 99', 'package', 22),
    ('saida', 'Taxa de saque', 'landmark', 23),
    ('entrada', 'Gorjeta', 'coins', 2),
    ('entrada', 'Devolução de taxa 99', 'undo-2', 20),
    ('entrada', 'Taxa de cancelamento recebida', 'ban', 21)
  ) as x(tipo, nome, icone, ordem)
  where not exists (
    select 1 from public.categorias c
    where c.user_id = v_user and c.tipo = x.tipo and c.nome = x.nome
  );
end $$;

-- Atualizar o trigger de novos usuários para incluir as categorias V2
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  -- 1. Perfil
  insert into public.profiles (id, nome, fuso_horario, onboarding_concluido)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'nome', ''), split_part(new.email, '@', 1)),
    'America/Sao_Paulo',
    false
  );

  -- 2. Configurações padrão
  insert into public.configuracoes (user_id, manutencao_modo, manutencao_valor_centavos)
  values (new.id, 'fixo', 2000);

  -- 3. Gamificação inicial
  insert into public.gamificacao_usuario (user_id, estrelas_totais, fase_atual)
  values (new.id, 0, 1);

  -- 4. Caixas iniciais
  insert into public.caixas (user_id, tipo, nome, saldo_inicial_centavos, cor) values
    (new.id, 'principal'::public.tipo_caixa, 'Caixa do dia', 0, '#FF7A00'),
    (new.id, 'manutencao'::public.tipo_caixa, 'Caixa Manutenção', 0, '#22C55E');

  -- 5. Plataformas padrão
  insert into public.plataformas (user_id, nome, cor, ordem) values
    (new.id, 'Uber', '#FFFFFF', 1),
    (new.id, '99', '#FFC83D', 2),
    (new.id, 'inDrive', '#22C55E', 3),
    (new.id, 'Particular', '#FF7A00', 4),
    (new.id, 'Outros', '#B4B4BB', 5);

  -- 6. Categorias padrão + Categorias V2
  insert into public.categorias (user_id, tipo, nome, icone, natureza, sistema, ordem) values
    (new.id, 'entrada', 'Corridas', 'car', 'operacional', true, 1),
    (new.id, 'entrada', 'Gorjeta', 'coins', 'operacional', true, 2),
    (new.id, 'entrada', 'Bônus / Promoção', 'gift', 'operacional', true, 3),
    (new.id, 'entrada', 'Outras receitas', 'plus-circle', 'operacional', true, 4),
    (new.id, 'entrada', 'Devolução de taxa 99', 'undo-2', 'operacional', true, 20),
    (new.id, 'entrada', 'Taxa de cancelamento recebida', 'ban', 'operacional', true, 21),
    (new.id, 'saida', 'Combustível', 'fuel', 'operacional', true, 1),
    (new.id, 'saida', 'Alimentação', 'utensils', 'operacional', true, 2),
    (new.id, 'saida', 'Crédito no app', 'smartphone', 'operacional', true, 3),
    (new.id, 'saida', 'Manutenção', 'wrench', 'operacional', true, 4),
    (new.id, 'saida', 'Lavagem', 'droplets', 'operacional', true, 5),
    (new.id, 'saida', 'Pedágio / Estacionamento', 'ticket', 'operacional', true, 6),
    (new.id, 'saida', 'Multa', 'alert-triangle', 'operacional', true, 7),
    (new.id, 'saida', 'Outras despesas', 'more-horizontal', 'operacional', true, 8),
    (new.id, 'saida', 'Retirada pessoal', 'wallet', 'retirada_pessoal', true, 9),
    (new.id, 'saida', 'Taxa 99', 'percent', 'operacional', true, 20),
    (new.id, 'saida', 'Taxa de maquininha', 'credit-card', 'operacional', true, 21),
    (new.id, 'saida', 'Pacote Taxa 99', 'package', 'operacional', true, 22),
    (new.id, 'saida', 'Taxa de saque', 'landmark', 'operacional', true, 23);

  -- 7. Locais iniciais
  insert into public.locais_dinheiro (user_id, tipo, nome, ordem, cor) values
    (new.id, 'bolso', 'Bolso', 1, '#10B981'),
    (new.id, 'app', 'App 99', 2, '#F59E0B'),
    (new.id, 'banco', 'Banco Inter', 3, '#FF7A00'),
    (new.id, 'banco', 'Mercado Pago', 4, '#00B1EA');

  return new;
end $$;
