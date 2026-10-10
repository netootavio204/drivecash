-- =====================================================================
-- 0005_avaliar_conquistas.sql — Avaliação Automática de Conquistas (RN-21, Anexo C)
-- =====================================================================

create or replace function public.rpc_avaliar_conquistas()
returns table (
  o_codigo text,
  o_titulo text,
  o_descricao text,
  o_icone text,
  o_estrelas_bonus integer
) language plpgsql security definer set search_path = public as $$
declare
  v_user uuid := auth.uid();
  v_dias_count integer;
  v_dias_fechados integer;
  v_entradas_count integer;
  v_corridas_total integer;
  v_saldo_reserva bigint;
  v_meta_reserva bigint;
  v_tem_bronze boolean;
  v_tem_ouro boolean;
  v_tem_dia_500 boolean;
  v_tem_prioridade_paga boolean;
  v_tem_madrugador boolean;
  v_seq integer;
  c record;
begin
  if v_user is null then return; end if;

  -- 1) Métricas do usuário
  select count(*), count(*) filter (where status = 'fechado')
  into v_dias_count, v_dias_fechados
  from public.dias_trabalho where user_id = v_user;

  select count(*), coalesce(sum(qtd_corridas), 0)
  into v_entradas_count, v_corridas_total
  from public.lancamentos
  where user_id = v_user and tipo = 'entrada' and excluido_em is null;

  select coalesce(saldo_centavos, 0) into v_saldo_reserva
  from public.vw_saldo_caixas
  where user_id = v_user and tipo = 'manutencao';

  select coalesce(meta_saldo_centavos, 150000) into v_meta_reserva
  from public.caixas
  where user_id = v_user and tipo = 'manutencao';

  select exists(select 1 from public.meta_ciclos where user_id = v_user and nivel_maximo in ('bronze', 'prata', 'ouro'))
  into v_tem_bronze;

  select exists(select 1 from public.meta_ciclos where user_id = v_user and nivel_maximo = 'ouro')
  into v_tem_ouro;

  select exists(
    select 1 from public.dias_trabalho
    where user_id = v_user and coalesce((resumo->>'receita_centavos')::bigint, 0) >= 50000
  ) into v_tem_dia_500;

  select exists(select 1 from public.prioridades where user_id = v_user and status = 'pago')
  into v_tem_prioridade_paga;

  select exists(
    select 1 from public.dias_trabalho
    where user_id = v_user and extract(hour from (aberto_em at time zone 'America/Sao_Paulo')) < 5
  ) into v_tem_madrugador;

  -- Sequência de dias consecutivos fechados
  select coalesce(sequencia_atual, 0) into v_seq
  from public.gamificacao_usuario where user_id = v_user;

  -- 2) Checagem de cada conquista no catálogo
  for c in select * from public.conquistas_catalogo order by ordem loop
    -- Pular se já conquistou
    if exists (select 1 from public.conquistas_usuario where user_id = v_user and codigo = c.codigo) then
      continue;
    end if;

    -- Avaliar condições
    if (c.codigo = 'primeiro_dia' and v_dias_count >= 1) or
       (c.codigo = 'primeira_entrada' and v_entradas_count >= 1) or
       (c.codigo = 'primeiro_fechamento' and v_dias_fechados >= 1) or
       (c.codigo = 'primeira_meta' and v_tem_bronze) or
       (c.codigo = 'primeiro_ouro' and v_tem_ouro) or
       (c.codigo = 'sequencia_3' and v_seq >= 3) or
       (c.codigo = 'sequencia_7' and v_seq >= 7) or
       (c.codigo = 'sequencia_14' and v_seq >= 14) or
       (c.codigo = 'sequencia_30' and v_seq >= 30) or
       (c.codigo = 'reserva_100' and v_saldo_reserva >= 10000) or
       (c.codigo = 'reserva_500' and v_saldo_reserva >= 50000) or
       (c.codigo = 'reserva_1000' and v_saldo_reserva >= 100000) or
       (c.codigo = 'reserva_meta' and v_saldo_reserva >= v_meta_reserva) or
       (c.codigo = 'dia_500' and v_tem_dia_500) or
       (c.codigo = 'corridas_100' and v_corridas_total >= 100) or
       (c.codigo = 'corridas_1000' and v_corridas_total >= 1000) or
       (c.codigo = 'primeira_conta_paga' and v_tem_prioridade_paga) or
       (c.codigo = 'madrugador' and v_tem_madrugador)
    then
      -- Desbloqueia
      insert into public.conquistas_usuario (user_id, codigo)
      values (v_user, c.codigo)
      on conflict (user_id, codigo) do nothing;

      -- Adiciona estrelas bônus
      update public.gamificacao_usuario g
      set
        estrelas_totais = g.estrelas_totais + c.estrelas_bonus,
        fase_atual = coalesce(
          (select max(numero) from public.fases where estrelas_minimas <= g.estrelas_totais + c.estrelas_bonus),
          1
        ),
        atualizado_em = now()
      where g.user_id = v_user;

      -- Retorna para efeito visual no frontend
      o_codigo := c.codigo;
      o_titulo := c.titulo;
      o_descricao := c.descricao;
      o_icone := c.icone;
      o_estrelas_bonus := c.estrelas_bonus;
      return next;
    end if;
  end loop;
end $$;
