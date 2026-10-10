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

/** RPC para avaliar e desbloquear conquistas */
export function useAvaliarConquistas() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase.rpc('rpc_avaliar_conquistas');
      if (error) {
        console.warn('[Meta Driver] Erro em rpc_avaliar_conquistas:', error.message);
        return [];
      }

      if (data && Array.isArray(data)) {
        for (const c of data) {
          celebrar('conquista', `Conquista: ${c.o_titulo}`);
        }
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conquistas'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
    },
  });
}
