import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database, TipoLancamento } from '@/lib/database.types';

export type Lancamento = Database['public']['Tables']['lancamentos']['Row'] & {
  plataformas?: { nome: string; cor: string } | null;
  categorias?: { nome: string; icone: string | null; cor: string | null; natureza: string } | null;
};

export type Plataforma = Database['public']['Tables']['plataformas']['Row'];
export type Categoria = Database['public']['Tables']['categorias']['Row'];

/** Busca plataformas ativas do motorista */
export function usePlataformas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['plataformas', user?.id],
    queryFn: async (): Promise<Plataforma[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('plataformas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .order('ordem', { ascending: true });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar plataformas:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
}

/** Busca categorias ativas do motorista */
export function useCategorias(tipo?: 'entrada' | 'saida') {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['categorias', user?.id, tipo],
    queryFn: async (): Promise<Categoria[]> => {
      if (!user) return [];

      let query = supabase
        .from('categorias')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativa', true)
        .order('ordem', { ascending: true });

      if (tipo) {
        query = query.eq('tipo', tipo);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar categorias:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
}

/** Busca os lançamentos de um dia específico (ordenados do mais recente ao mais antigo) */
export function useLancamentosDia(diaId?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['lancamentos', { diaId }, user?.id],
    queryFn: async (): Promise<Lancamento[]> => {
      if (!diaId || !user) return [];

      const { data, error } = await supabase
        .from('lancamentos')
        .select('*, plataformas(nome, cor), categorias(nome, icone, cor, natureza)')
        .eq('dia_id', diaId)
        .eq('user_id', user.id)
        .is('excluido_em', null)
        .order('ocorrido_em', { ascending: false });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar lançamentos do dia:', error.message);
        return [];
      }
      return (data as unknown as Lancamento[]) || [];
    },
    enabled: !!diaId && !!user,
  });
}

/** Hook para criar um lançamento */
export function useCriarLancamento() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      caixaId,
      diaId,
      tipo,
      valorCentavos,
      categoriaId,
      plataformaId,
      descricao,
      qtdCorridas = 0,
      meioPagamento,
    }: {
      caixaId: string;
      diaId?: string | null;
      tipo: TipoLancamento;
      valorCentavos: number;
      categoriaId?: string | null;
      plataformaId?: string | null;
      descricao?: string | null;
      qtdCorridas?: number;
      meioPagamento?: string | null;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const id = crypto.randomUUID();

      const { data, error } = await supabase
        .from('lancamentos')
        .insert({
          id,
          user_id: user.id,
          caixa_id: caixaId,
          dia_id: diaId,
          tipo,
          valor_centavos: valorCentavos,
          categoria_id: categoriaId,
          plataforma_id: plataformaId,
          descricao,
          qtd_corridas: qtdCorridas,
          meio_pagamento: meioPagamento,
          origem: 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['caixas', 'saldos'] });
      queryClient.invalidateQueries({ queryKey: ['dia'] });
    },
  });
}

/** Hook para editar um lançamento existente */
export function useEditarLancamento() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      valorCentavos,
      categoriaId,
      plataformaId,
      descricao,
      qtdCorridas,
    }: {
      id: string;
      valorCentavos: number;
      categoriaId?: string | null;
      plataformaId?: string | null;
      descricao?: string | null;
      qtdCorridas?: number;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase
        .from('lancamentos')
        .update({
          valor_centavos: valorCentavos,
          categoria_id: categoriaId,
          plataforma_id: plataformaId,
          descricao,
          qtd_corridas: qtdCorridas,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['caixas', 'saldos'] });
      queryClient.invalidateQueries({ queryKey: ['dia'] });
    },
  });
}

/** Hook para exclusão lógica (soft delete) */
export function useExcluirLancamento() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase
        .from('lancamentos')
        .update({
          excluido_em: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['caixas', 'saldos'] });
      queryClient.invalidateQueries({ queryKey: ['dia'] });
    },
  });
}

/** Hook para desfazer exclusão (dentro dos 6s) */
export function useDesfazerExclusao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase
        .from('lancamentos')
        .update({
          excluido_em: null,
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['caixas', 'saldos'] });
      queryClient.invalidateQueries({ queryKey: ['dia'] });
    },
  });
}
