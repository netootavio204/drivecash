-- =====================================================================
-- anexo_a_test.sql — Validação Matemática Completa do Anexo A do PRD
-- =====================================================================
-- Cenário de Teste:
-- - Meta diária de receita: R$ 300,00 (Bronze R$ 210, Prata R$ 300, Ouro R$ 390)
-- - Depósito de manutenção: R$ 20,00
-- - Caixa acumulado inicial: R$ 150,00
-- - Entradas: R$ 400,00 (Uber R$ 220 / 8 corridas, 99 R$ 130 / 5 corridas, Particular R$ 50 / 1 corrida) -> 14 corridas
-- - Saídas operacionais: R$ 145,00 (Combustível R$ 90, Alimentação R$ 25, Crédito no app R$ 30)
-- - Lucro Líquido Esperado: R$ 255,00
-- - Saldo Calculado Antes do Fechamento: R$ 405,00
-- - Conferência Informada: R$ 400,00 (Falta de R$ 5,00 registrada como ajuste_saida)
-- - Depósito de Manutenção: R$ 20,00
-- - Saldo Final do Caixa Principal: R$ 380,00
-- - Saldo do Caixa Manutenção: R$ 20,00
-- - Nível da Meta: Ouro (R$ 400 >= R$ 390)
-- =====================================================================

do $$
declare
  v_test_user uuid := gen_random_uuid();
  v_principal uuid;
  v_reserva uuid;
  v_dia public.dias_trabalho;
  v_saldo_principal bigint;
  v_saldo_reserva bigint;
  v_resumo record;
  v_cat_corridas uuid;
  v_cat_combustivel uuid;
  v_cat_alimentacao uuid;
  v_cat_credito uuid;
  v_plat_uber uuid;
  v_plat_99 uuid;
  v_plat_particular uuid;
begin
  -- 1. Setup do usuário simulado
  insert into public.profiles (id, nome) values (v_test_user, 'Motorista Anexo A');
  insert into public.configuracoes (user_id, manutencao_valor_centavos) values (v_test_user, 2000);
  insert into public.gamificacao_usuario (user_id) values (v_test_user);

  insert into public.caixas (user_id, tipo, nome, saldo_inicial_centavos)
  values (v_test_user, 'principal', 'Caixa do dia', 15000) returning id into v_principal;

  insert into public.caixas (user_id, tipo, nome, saldo_inicial_centavos)
  values (v_test_user, 'manutencao', 'Caixa Manutenção', 0) returning id into v_reserva;

  insert into public.plataformas (user_id, nome) values
    (v_test_user, 'Uber') returning id into v_plat_uber;
  insert into public.plataformas (user_id, nome) values
    (v_test_user, '99') returning id into v_plat_99;
  insert into public.plataformas (user_id, nome) values
    (v_test_user, 'Particular') returning id into v_plat_particular;

  insert into public.categorias (user_id, tipo, nome, natureza) values
    (v_test_user, 'entrada', 'Corridas', 'operacional') returning id into v_cat_corridas;
  insert into public.categorias (user_id, tipo, nome, natureza) values
    (v_test_user, 'saida', 'Combustível', 'operacional') returning id into v_cat_combustivel;
  insert into public.categorias (user_id, tipo, nome, natureza) values
    (v_test_user, 'saida', 'Alimentação', 'operacional') returning id into v_cat_alimentacao;
  insert into public.categorias (user_id, tipo, nome, natureza) values
    (v_test_user, 'saida', 'Crédito no app', 'operacional') returning id into v_cat_credito;

  -- 2. Abrir dia com saldo inicial de R$ 150,00
  insert into public.dias_trabalho (user_id, data_referencia, status, saldo_abertura_centavos)
  values (v_test_user, '2026-10-10', 'aberto', 15000) returning * into v_dia;

  -- 3. Entradas: Uber (R$ 220 / 8), 99 (R$ 130 / 5), Particular (R$ 50 / 1)
  insert into public.lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, categoria_id, plataforma_id, qtd_corridas, data_referencia)
  values
    (v_test_user, v_principal, v_dia.id, 'entrada', 22000, v_cat_corridas, v_plat_uber, 8, '2026-10-10'),
    (v_test_user, v_principal, v_dia.id, 'entrada', 13000, v_cat_corridas, v_plat_99, 5, '2026-10-10'),
    (v_test_user, v_principal, v_dia.id, 'entrada', 5000, v_cat_corridas, v_plat_particular, 1, '2026-10-10');

  -- 4. Saídas: Combustível R$ 90, Alimentação R$ 25, Crédito no app R$ 30
  insert into public.lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, categoria_id, data_referencia)
  values
    (v_test_user, v_principal, v_dia.id, 'saida', 9000, v_cat_combustivel, '2026-10-10'),
    (v_test_user, v_principal, v_dia.id, 'saida', 2500, v_cat_alimentacao, '2026-10-10'),
    (v_test_user, v_principal, v_dia.id, 'saida', 3000, v_cat_credito, '2026-10-10');

  -- 5. Validação das somas do dia
  select * into v_resumo from public.vw_resumo_dia where dia_id = v_dia.id;
  assert v_resumo.receita_centavos = 40000, 'Receita deve ser 40000 (R$ 400,00)';
  assert v_resumo.corridas = 14, 'Total de corridas deve ser 14';
  assert v_resumo.despesas_centavos = 14500, 'Despesas devem ser 14500 (R$ 145,00)';
  assert (v_resumo.receita_centavos - v_resumo.despesas_centavos) = 25500, 'Lucro líquido deve ser 25500 (R$ 255,00)';

  -- 6. Validação do saldo calculado antes do fechamento: 150 + 400 - 145 = 405
  select saldo_centavos into v_saldo_principal from public.vw_saldo_caixas where caixa_id = v_principal;
  assert v_saldo_principal = 40500, 'Saldo antes do fechamento deve ser 40500 (R$ 405,00)';

  -- 7. Simulação de conferência: motorista informa R$ 400,00 em mãos (falta de R$ 5,00)
  insert into public.lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, descricao, origem, data_referencia)
  values (v_test_user, v_principal, v_dia.id, 'ajuste_saida', 500, 'Falta na conferência', 'conferencia', '2026-10-10');

  -- 8. Depósito na Manutenção: R$ 20,00 (transferência)
  declare
    v_transf_id uuid := gen_random_uuid();
  begin
    insert into public.transferencias (id, user_id, caixa_origem_id, caixa_destino_id, valor_centavos, dia_id)
    values (v_transf_id, v_test_user, v_principal, v_reserva, 2000, v_dia.id);

    insert into public.lancamentos (user_id, caixa_id, dia_id, tipo, valor_centavos, origem, transferencia_id, data_referencia)
    values
      (v_test_user, v_principal, v_dia.id, 'transferencia_saida', 2000, 'deposito_manutencao', v_transf_id, '2026-10-10'),
      (v_test_user, v_reserva, v_dia.id, 'transferencia_entrada', 2000, 'deposito_manutencao', v_transf_id, '2026-10-10');
  end;

  -- 9. Fechamento do dia
  update public.dias_trabalho set
    status = 'fechado',
    fechado_em = now(),
    saldo_calculado_centavos = 40500,
    saldo_informado_centavos = 40000,
    saldo_fechamento_centavos = 38000,
    diferenca_conferencia_centavos = -500,
    reserva_manutencao_centavos = 2000
  where id = v_dia.id;

  -- 10. Validação final dos saldos em caixa
  select saldo_centavos into v_saldo_principal from public.vw_saldo_caixas where caixa_id = v_principal;
  select saldo_centavos into v_saldo_reserva from public.vw_saldo_caixas where caixa_id = v_reserva;

  assert v_saldo_principal = 38000, 'Caixa principal final deve ser exatamente 38000 (R$ 380,00)';
  assert v_saldo_reserva = 2000, 'Caixa manutenção final deve ser exatamente 2000 (R$ 20,00)';

  -- Limpar dados de teste
  delete from public.profiles where id = v_test_user;

  raise notice '>>> TESTE DO ANEXO A PASSOU COM 100%% DE SUCESSO! <<<';
end $$;
