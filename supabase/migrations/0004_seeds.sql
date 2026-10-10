-- =====================================================================
-- 0004_seeds.sql — Catálogos Globais e Trigger de Novo Motorista
-- =====================================================================

-- ===== Fases da Gamificação =====
insert into public.fases (numero, nome, estrelas_minimas, cor) values
  (1, 'Aprendiz', 0, '#B4B4BB'),
  (2, 'Estradeiro', 25, '#CD7F32'),
  (3, 'Profissional', 100, '#C9CED6'),
  (4, 'Veterano', 300, '#FFC83D'),
  (5, 'Mestre do Volante', 700, '#FF7A00'),
  (6, 'Elite', 1500, '#FF2D2D'),
  (7, 'Lenda', 3000, '#FF2D2D')
on conflict (numero) do update set
  nome = excluded.nome,
  estrelas_minimas = excluded.estrelas_minimas,
  cor = excluded.cor;

-- ===== Catálogo de Conquistas (Anexo C) =====
insert into public.conquistas_catalogo (codigo, titulo, descricao, icone, estrelas_bonus, ordem) values
  ('primeiro_dia', 'Ponto batido', 'Abrir o primeiro dia', 'clock', 2, 1),
  ('primeira_entrada', 'Primeira corrida', 'Registrar a primeira entrada', 'car', 1, 2),
  ('primeiro_fechamento', 'Dia encerrado', 'Fechar o primeiro dia', 'check-circle', 2, 3),
  ('primeira_meta', 'Meta batida', 'Atingir qualquer nível em uma meta', 'award', 3, 4),
  ('primeiro_ouro', 'Ouro puro', 'Conquistar a primeira medalha de ouro', 'sparkles', 5, 5),
  ('sequencia_3', 'Pegando ritmo', '3 dias seguidos abertos e fechados', 'flame', 3, 6),
  ('sequencia_7', 'Semana de ferro', '7 dias seguidos', 'flame', 8, 7),
  ('sequencia_14', 'Quinzena firme', '14 dias seguidos', 'flame', 15, 8),
  ('sequencia_30', 'Mês imparável', '30 dias seguidos', 'flame', 40, 9),
  ('semana_perfeita', 'Semana perfeita', 'Prata ou mais na meta diária em todos os dias de trabalho da semana', 'star', 15, 10),
  ('mes_perfeito', 'Mês perfeito', 'Ouro na meta mensal', 'crown', 30, 11),
  ('reserva_100', 'Cofre aberto', 'R$ 100 na Manutenção', 'shield', 2, 12),
  ('reserva_500', 'Cofre recheado', 'R$ 500 na Manutenção', 'shield', 5, 13),
  ('reserva_1000', 'Reserva de ouro', 'R$ 1.000 na Manutenção', 'shield', 10, 14),
  ('reserva_meta', 'Reserva completa', 'Atingir a meta de reserva', 'shield-check', 10, 15),
  ('dia_500', 'Dia de 500', 'Receita ≥ R$ 500 em um dia', 'zap', 5, 16),
  ('corridas_100', 'Centurião', '100 corridas acumuladas', 'target', 5, 17),
  ('corridas_1000', 'Mil corridas', '1.000 corridas acumuladas', 'trophy', 20, 18),
  ('contas_certas', 'Contas certas', '7 conferências seguidas sem diferença', 'check', 8, 19),
  ('primeira_conta_paga', 'Conta paga', 'Pagar a primeira prioridade', 'credit-card', 2, 20),
  ('contas_em_dia', 'Organizado', 'Pagar todas as prioridades do mês em dia', 'calendar-check', 8, 21),
  ('madrugador', 'Madrugador', 'Abrir o dia antes das 05:00', 'sunrise', 2, 22)
on conflict (codigo) do update set
  titulo = excluded.titulo,
  descricao = excluded.descricao,
  icone = excluded.icone,
  estrelas_bonus = excluded.estrelas_bonus,
  ordem = excluded.ordem;

-- ===== Trigger de Novo Usuário (Auto-setup) =====
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

  -- 2. Configurações padrão (R$ 20,00 padrão editável)
  insert into public.configuracoes (user_id, manutencao_modo, manutencao_valor_centavos)
  values (new.id, 'fixo', 2000);

  -- 3. Gamificação inicial
  insert into public.gamificacao_usuario (user_id, estrelas_totais, fase_atual)
  values (new.id, 0, 1);

  -- 4. Caixas iniciais
  insert into public.caixas (user_id, tipo, nome, saldo_inicial_centavos, cor) values
    (new.id, 'principal'::public.tipo_caixa, 'Caixa do dia', 0, '#FF7A00'),
    (new.id, 'manutencao'::public.tipo_caixa, 'Caixa Manutenção', 0, '#22C55E');

  -- 5. Plataformas padrão (com ordem)
  insert into public.plataformas (user_id, nome, cor, ordem) values
    (new.id, 'Uber', '#FFFFFF', 1),
    (new.id, '99', '#FFC83D', 2),
    (new.id, 'inDrive', '#22C55E', 3),
    (new.id, 'Particular', '#FF7A00', 4),
    (new.id, 'Outros', '#B4B4BB', 5);

  -- 6. Categorias padrão (com tipo e natureza)
  insert into public.categorias (user_id, tipo, nome, icone, natureza, sistema, ordem) values
    (new.id, 'entrada', 'Corridas', 'car', 'operacional', true, 1),
    (new.id, 'entrada', 'Gorjeta', 'coins', 'operacional', true, 2),
    (new.id, 'entrada', 'Bônus / Promoção', 'gift', 'operacional', true, 3),
    (new.id, 'entrada', 'Outras receitas', 'plus-circle', 'operacional', true, 4),
    (new.id, 'saida', 'Combustível', 'fuel', 'operacional', true, 1),
    (new.id, 'saida', 'Alimentação', 'utensils', 'operacional', true, 2),
    (new.id, 'saida', 'Crédito no app', 'smartphone', 'operacional', true, 3),
    (new.id, 'saida', 'Manutenção', 'wrench', 'operacional', true, 4),
    (new.id, 'saida', 'Lavagem', 'droplets', 'operacional', true, 5),
    (new.id, 'saida', 'Pedágio / Estacionamento', 'ticket', 'operacional', true, 6),
    (new.id, 'saida', 'Multa', 'alert-triangle', 'operacional', true, 7),
    (new.id, 'saida', 'Outras despesas', 'more-horizontal', 'operacional', true, 8),
    (new.id, 'saida', 'Retirada pessoal', 'wallet', 'retirada_pessoal', true, 9);

  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
