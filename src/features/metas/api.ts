import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database } from '@/lib/database.types';
import { celebrar } from '@/lib/confete';

export type Meta = Database['public']['Tables']['metas']['Row'];
export type MetaCiclo = Database['public']['Tables']['meta_ciclos']['Row'];
export type Fase = Database['public']['Tables']['fases']['Row'];
export type ConquistaCatalogo = Database['public']['Tables']['conquistas_catalogo']['Row'];
export type ConquistaUsuario = Database['public']['Tables']['conquistas_usuario']['Row'];
export type GamificacaoUsuario = Database['public']['Tables']['gamificacao_usuario']['Row'];

export type PeriodoMeta = 'diaria' | 'semanal' | 'mensal' | 'anual';
export type MetricaMeta = 'receita_bruta' | 'lucro_liquido' | 'corridas' | 'dias_trabalhados' | 'reserva_manutencao';

/** Busca todas as metas ativas do usuário */
export function useMetas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['metas', 'ativas', user?.id],
    queryFn: async (): Promise<Meta[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('metas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .order('criado_em', { ascending: true });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar metas:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
}

/** Busca os ciclos em andamento das metas do usuário */
export function useCiclosMetas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['metas', 'ciclos', user?.id],
    queryFn: async (): Promise<MetaCiclo[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('meta_ciclos')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'em_andamento')
        .order('periodo_inicio', { ascending: false });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar ciclos de metas:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
}

/** Cria uma nova meta */
export function useCriarMeta() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      titulo,
      periodo,
      metrica = 'receita_bruta',
      valorAlvo,
      pctBronze = 70,
      pctPrata = 100,
      pctOuro = 130,
    }: {
      titulo: string;
      periodo: PeriodoMeta;
      metrica?: MetricaMeta;
      valorAlvo: number;
      pctBronze?: number;
      pctPrata?: number;
      pctOuro?: number;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase
        .from('metas')
        .insert({
          user_id: user.id,
          titulo,
          periodo,
          metrica,
          valor_alvo: valorAlvo,
          pct_bronze: pctBronze,
          pct_prata: pctPrata,
          pct_ouro: pctOuro,
          ativa: true,
          recorrente: true,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
    },
  });
}

/** Edita uma meta existente */
export function useEditarMeta() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      titulo,
      valorAlvo,
      pctBronze,
      pctPrata,
      pctOuro,
    }: {
      id: string;
      titulo: string;
      valorAlvo: number;
      pctBronze?: number;
      pctPrata?: number;
      pctOuro?: number;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase
        .from('metas')
        .update({
          titulo,
          valor_alvo: valorAlvo,
          pct_bronze: pctBronze,
          pct_prata: pctPrata,
          pct_ouro: pctOuro,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
    },
  });
}

/** Arquiva uma meta */
export function useArquivarMeta() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { error } = await supabase
        .from('metas')
        .update({ ativa: false })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas'] });
    },
  });
}

/** Busca dados de gamificação do usuário (estrelas, fase atual, sequência) */
export function useGamificacaoUsuario() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['gamificacao', 'usuario', user?.id],
    queryFn: async (): Promise<GamificacaoUsuario | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('gamificacao_usuario')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar gamificação:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });
}

/** Busca todas as fases do jogo */
export function useFases() {
  return useQuery({
    queryKey: ['fases', 'catalogo'],
    queryFn: async (): Promise<Fase[]> => {
      const { data, error } = await supabase
        .from('fases')
        .select('*')
        .order('numero', { ascending: true });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar fases:', error.message);
        return [];
      }
      return data || [];
    },
  });
}

/** Busca catálogo de conquistas */
export function useConquistasCatalogo() {
  return useQuery({
    queryKey: ['conquistas', 'catalogo'],
    queryFn: async (): Promise<ConquistaCatalogo[]> => {
      const { data, error } = await supabase
        .from('conquistas_catalogo')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar conquistas:', error.message);
        return [];
      }
      return data || [];
    },
  });
}

/** Busca conquistas desbloqueadas pelo usuário */
export function useConquistasUsuario() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['conquistas', 'usuario', user?.id],
    queryFn: async (): Promise<ConquistaUsuario[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conquistas_usuario')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar conquistas do usuário:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
}

/** RPC para atualizar progresso das metas e disparar celebrações */
export function useAtualizarMetas() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('rpc_atualizar_metas');
      if (error) {
        console.warn('[Meta Driver] Erro em rpc_atualizar_metas:', error.message);
        return [];
      }

      // Celebrar medalhas ganhas
      if (data && Array.isArray(data)) {
        for (const evento of data) {
          const nivelNovo = evento.o_nivel_novo?.toLowerCase();
          if (nivelNovo === 'bronze' || nivelNovo === 'prata' || nivelNovo === 'ouro') {
            celebrar(nivelNovo as 'bronze' | 'prata' | 'ouro', `Medalha de ${nivelNovo}!`);
          }
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas', 'ciclos'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
    },
  });
}

/** Motor completo e resiliente para avaliar e desbloquear conquistas do usuário */
export async function executarAvaliacaoConquistas(userId: string) {
  try {
    // 1. Tentar RPC caso o banco esteja configurado
    try {
      const { data: rpcData, error: rpcError } = await supabase.rpc('rpc_avaliar_conquistas');
      if (!rpcError && rpcData && Array.isArray(rpcData) && rpcData.length > 0) {
        for (const c of rpcData) {
          celebrar('conquista', `Conquista: ${c.o_titulo}`);
        }
      }
    } catch (e) {
      console.warn('[Meta Driver] RPC rpc_avaliar_conquistas falhou, avaliando via SDK:', e);
    }

    // 2. Garantir que a linha de gamificacao_usuario exista
    const { data: gamifExistente } = await supabase
      .from('gamificacao_usuario')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (!gamifExistente) {
      await supabase.from('gamificacao_usuario').insert({
        user_id: userId,
        estrelas_totais: 0,
        fase_atual: 1,
        sequencia_atual: 0,
        maior_sequencia: 0,
      });
    }

    // 3. Buscar dados do usuário para avaliação completa
    const [
      { data: catalogo },
      { data: jaDesbloqueadas },
      { data: dias },
      { data: lancamentos },
      { data: prioridades },
      { data: metasCiclos },
      { data: fasesCatalogo },
      { data: caixas },
    ] = await Promise.all([
      supabase.from('conquistas_catalogo').select('*').order('ordem'),
      supabase.from('conquistas_usuario').select('codigo').eq('user_id', userId),
      supabase.from('dias_trabalho').select('*').eq('user_id', userId).order('data_referencia', { ascending: false }),
      supabase.from('lancamentos').select('tipo, valor_centavos, qtd_corridas, caixa_id').eq('user_id', userId).is('excluido_em', null),
      supabase.from('prioridades').select('status').eq('user_id', userId),
      supabase.from('meta_ciclos').select('periodo, nivel_maximo').eq('user_id', userId),
      supabase.from('fases').select('*').order('numero', { ascending: true }),
      supabase.from('caixas').select('id, tipo, saldo_inicial_centavos, meta_saldo_centavos').eq('user_id', userId),
    ]);

    const codigosDesbloqueados = new Set((jaDesbloqueadas || []).map((c) => c.codigo));
    const listaDias = dias || [];
    const listaLanc = lancamentos || [];
    const listaPrioridades = prioridades || [];
    const listaMetas = metasCiclos || [];
    const listaFases = fasesCatalogo || [];
    const listaCaixas = caixas || [];

    // Métricas
    const totalDias = listaDias.length;
    const diasFechados = listaDias.filter((d) => d.status === 'fechado').length;
    const entradas = listaLanc.filter((l) => l.tipo === 'entrada');
    const totalEntradas = entradas.length;
    const totalCorridas = entradas.reduce((acc, l) => acc + (l.qtd_corridas || 0), 0);

    const caixaManutencao = listaCaixas.find((c) => c.tipo === 'manutencao');
    let saldoManutencao = caixaManutencao?.saldo_inicial_centavos || 0;
    if (caixaManutencao) {
      for (const l of listaLanc) {
        if (l.caixa_id === caixaManutencao.id) {
          if (['entrada', 'transferencia_entrada', 'ajuste_entrada'].includes(l.tipo)) {
            saldoManutencao += l.valor_centavos;
          } else {
            saldoManutencao -= l.valor_centavos;
          }
        }
      }
    }
    const metaReserva = caixaManutencao?.meta_saldo_centavos || 150000;

    const temBronze = listaMetas.some((m) => ['bronze', 'prata', 'ouro'].includes(m.nivel_maximo || ''));
    const temOuro = listaMetas.some((m) => m.nivel_maximo === 'ouro');
    const temMesPerfeito = listaMetas.some((m) => m.periodo === 'mensal' && m.nivel_maximo === 'ouro');
    const prioridadesPagas = listaPrioridades.filter((p) => p.status === 'pago').length;

    const temDia500 = listaDias.some((d) => {
      const res = d.resumo as { receita_centavos?: number } | null;
      return (res?.receita_centavos ?? 0) >= 50000;
    });

    const temMadrugador = listaDias.some((d) => {
      try {
        const hora = new Date(d.aberto_em).getHours();
        return hora < 5;
      } catch {
        return false;
      }
    });

    // Cálculo da sequência (Streak)
    const datasTrabalhadas = Array.from(new Set(listaDias.map((d) => d.data_referencia))).sort().reverse();
    let sequenciaAtual = 0;
    if (datasTrabalhadas.length > 0) {
      const hoje = new Date().toISOString().split('T')[0];
      const ontem = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      if (datasTrabalhadas[0] === hoje || datasTrabalhadas[0] === ontem) {
        sequenciaAtual = 1;
        for (let i = 0; i < datasTrabalhadas.length - 1; i++) {
          const d1 = new Date(datasTrabalhadas[i]);
          const d2 = new Date(datasTrabalhadas[i + 1]);
          const diffDias = Math.round((d1.getTime() - d2.getTime()) / (1000 * 3600 * 24));
          if (diffDias === 1) {
            sequenciaAtual++;
          } else {
            break;
          }
        }
      }
    }
    const maiorSequencia = Math.max(sequenciaAtual, gamifExistente?.maior_sequencia ?? 0);

    // Avaliar cada conquista do catálogo
    const novasDesbloqueadas: { codigo: string; titulo: string; estrelas_bonus: number }[] = [];

    for (const c of catalogo || []) {
      if (codigosDesbloqueados.has(c.codigo)) continue;

      let atendeu = false;
      switch (c.codigo) {
        case 'primeiro_dia':
          atendeu = totalDias >= 1;
          break;
        case 'primeira_entrada':
          atendeu = totalEntradas >= 1;
          break;
        case 'primeiro_fechamento':
          atendeu = diasFechados >= 1;
          break;
        case 'primeira_meta':
          atendeu = temBronze;
          break;
        case 'primeiro_ouro':
          atendeu = temOuro;
          break;
        case 'sequencia_3':
          atendeu = sequenciaAtual >= 3;
          break;
        case 'sequencia_7':
          atendeu = sequenciaAtual >= 7;
          break;
        case 'sequencia_14':
          atendeu = sequenciaAtual >= 14;
          break;
        case 'sequencia_30':
          atendeu = sequenciaAtual >= 30;
          break;
        case 'semana_perfeita':
          atendeu = temBronze && diasFechados >= 5;
          break;
        case 'mes_perfeito':
          atendeu = temMesPerfeito;
          break;
        case 'reserva_100':
          atendeu = saldoManutencao >= 10000;
          break;
        case 'reserva_500':
          atendeu = saldoManutencao >= 50000;
          break;
        case 'reserva_1000':
          atendeu = saldoManutencao >= 100000;
          break;
        case 'reserva_meta':
          atendeu = saldoManutencao >= metaReserva && metaReserva > 0;
          break;
        case 'dia_500':
          atendeu = temDia500;
          break;
        case 'corridas_100':
          atendeu = totalCorridas >= 100;
          break;
        case 'corridas_1000':
          atendeu = totalCorridas >= 1000;
          break;
        case 'contas_certas':
          atendeu = diasFechados >= 7;
          break;
        case 'primeira_conta_paga':
          atendeu = prioridadesPagas >= 1;
          break;
        case 'contas_em_dia':
          atendeu = prioridadesPagas >= 3;
          break;
        case 'madrugador':
          atendeu = temMadrugador;
          break;
      }

      if (atendeu) {
        novasDesbloqueadas.push({
          codigo: c.codigo,
          titulo: c.titulo,
          estrelas_bonus: c.estrelas_bonus,
        });
      }
    }

    // Inserir novas conquistas
    if (novasDesbloqueadas.length > 0) {
      for (const nova of novasDesbloqueadas) {
        await supabase.from('conquistas_usuario').insert({
          user_id: userId,
          codigo: nova.codigo,
          desbloqueada_em: new Date().toISOString(),
        });
        celebrar('conquista', `Conquista: ${nova.titulo}`);
        codigosDesbloqueados.add(nova.codigo);
      }
    }

    // Calcular estrelas totais
    let estrelasConquistas = 0;
    for (const c of catalogo || []) {
      if (codigosDesbloqueados.has(c.codigo)) {
        estrelasConquistas += c.estrelas_bonus;
      }
    }

    let estrelasMetas = 0;
    for (const m of listaMetas) {
      if (m.nivel_maximo === 'ouro') estrelasMetas += 5;
      else if (m.nivel_maximo === 'prata') estrelasMetas += 3;
      else if (m.nivel_maximo === 'bronze') estrelasMetas += 1;
    }

    const estrelasTotais = Math.max(0, estrelasConquistas + estrelasMetas);

    // Determinar fase atual
    let novaFase = 1;
    for (const f of listaFases) {
      if (estrelasTotais >= f.estrelas_minimas) {
        novaFase = Math.max(novaFase, f.numero);
      }
    }

    // Atualizar gamificacao_usuario
    await supabase.from('gamificacao_usuario').upsert({
      user_id: userId,
      estrelas_totais: estrelasTotais,
      fase_atual: novaFase,
      sequencia_atual: sequenciaAtual,
      maior_sequencia: maiorSequencia,
      atualizado_em: new Date().toISOString(),
    });

    return novasDesbloqueadas;
  } catch (err) {
    console.warn('[Meta Driver] Erro ao avaliar conquistas:', err);
    return [];
  }
}

/** Hook para avaliar e desbloquear conquistas */
export function useAvaliarConquistas() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) return [];
      return await executarAvaliacaoConquistas(user.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conquistas'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
      queryClient.invalidateQueries({ queryKey: ['fases'] });
    },
  });
}

