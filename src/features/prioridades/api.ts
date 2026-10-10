import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database } from '@/lib/database.types';

export type Prioridade = Database['public']['Tables']['prioridades']['Row'];
export type NivelPrioridade = 'alta' | 'media' | 'baixa';
export type RecorrenciaPrioridade = 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';

/** Busca a lista de prioridades do usuário ordenadas por urgência/vencimento */
export function usePrioridades() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['prioridades', 'lista', user?.id],
    queryFn: async (): Promise<Prioridade[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('prioridades')
        .select('*')
        .eq('user_id', user.id)
        .order('vencimento', { ascending: true });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar prioridades:', error.message);
        return [];
      }

      // Ordenação: Pendentes primeiro (vencidas no topo, depois data), depois pagas
      const hoje = new Date().toISOString().slice(0, 10);
      return (data || []).sort((a, b) => {
        if (a.status === 'pendente' && b.status !== 'pendente') return -1;
        if (a.status !== 'pendente' && b.status === 'pendente') return 1;

        const aVencida = a.status === 'pendente' && a.vencimento < hoje;
        const bVencida = b.status === 'pendente' && b.vencimento < hoje;
        if (aVencida && !bVencida) return -1;
        if (!aVencida && bVencida) return 1;

        return a.vencimento.localeCompare(b.vencimento);
      });
    },
    enabled: !!user,
  });
}

/** Cria uma nova prioridade financeira */
export function useCriarPrioridade() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      titulo,
      valorCentavos,
      vencimento,
      nivel = 'media',
      recorrencia = 'mensal',
      observacao,
    }: {
      titulo: string;
      valorCentavos: number;
      vencimento: string;
      nivel?: NivelPrioridade;
      recorrencia?: RecorrenciaPrioridade;
      observacao?: string;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase
        .from('prioridades')
        .insert({
          user_id: user.id,
          titulo,
          valor_centavos: valorCentavos,
          vencimento,
          nivel,
          recorrencia,
          observacao: observacao?.trim() || null,
          status: 'pendente',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prioridades'] });
    },
  });
}

/** Edita uma prioridade existente */
export function useEditarPrioridade() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      titulo,
      valorCentavos,
      vencimento,
      nivel,
      recorrencia,
      observacao,
    }: {
      id: string;
      titulo: string;
      valorCentavos: number;
      vencimento: string;
      nivel: NivelPrioridade;
      recorrencia: RecorrenciaPrioridade;
      observacao?: string;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase
        .from('prioridades')
        .update({
          titulo,
          valor_centavos: valorCentavos,
          vencimento,
          nivel,
          recorrencia,
          observacao: observacao?.trim() || null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prioridades'] });
    },
  });
}

/** Exclui uma prioridade */
export function useExcluirPrioridade() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { error } = await supabase
        .from('prioridades')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prioridades'] });
    },
  });
}

/** Pagar prioridade via RPC: debita do caixa do dia e agenda próxima recorrência */
export function usePagarPrioridade() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      prioridadeId,
      caixaId,
      categoriaId,
    }: {
      prioridadeId: string;
      caixaId: string;
      categoriaId: string;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase.rpc('rpc_pagar_prioridade', {
        p_prioridade_id: prioridadeId,
        p_caixa_id: caixaId,
        p_categoria_id: categoriaId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prioridades'] });
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['dia'] });
    },
  });
}
