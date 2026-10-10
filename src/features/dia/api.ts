import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database } from '@/lib/database.types';

export type DiaTrabalho = Database['public']['Tables']['dias_trabalho']['Row'];
export type ResumoDia = Database['public']['Views']['vw_resumo_dia']['Row'];

/** Busca o dia de trabalho atualmente aberto */
export function useDiaAtual() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dia', 'atual', user?.id],
    queryFn: async (): Promise<DiaTrabalho | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('dias_trabalho')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'aberto')
        .maybeSingle();

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar dia atual:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });
}

/** Busca o resumo financeiro calculado do dia */
export function useResumoDia(diaId?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dia', diaId, 'resumo'],
    queryFn: async (): Promise<ResumoDia | null> => {
      if (!diaId || !user) return null;

      const { data, error } = await supabase
        .from('vw_resumo_dia')
        .select('*')
        .eq('dia_id', diaId)
        .maybeSingle();

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar resumo do dia:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!diaId && !!user,
  });
}

/** RPC para Bater Ponto / Abrir o dia de trabalho */
export function useAbrirDia() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      dataReferencia,
      kmInicial,
      saldoConfirmadoCentavos,
    }: {
      dataReferencia: string;
      kmInicial?: number | null;
      saldoConfirmadoCentavos?: number | null;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase.rpc('rpc_abrir_dia', {
        p_data_referencia: dataReferencia,
        p_km_inicial: kmInicial,
        p_saldo_confirmado_centavos: saldoConfirmadoCentavos,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dia'] });
      queryClient.invalidateQueries({ queryKey: ['caixas', 'saldos'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
    },
  });
}

/** Busca o último dia fechado para permitir reabertura ou visualização */
export function useUltimoDiaFechado() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['dia', 'ultimo_fechado', user?.id],
    queryFn: async (): Promise<DiaTrabalho | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('dias_trabalho')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'fechado')
        .order('data_referencia', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar último dia fechado:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });
}

export type ParametrosFecharDia = {
  diaId: string;
  saldoInformadoCentavos?: number | null;
  depositoManutencaoCentavos?: number | null;
  kmFinal?: number | null;
  minutosOnline?: number | null;
  observacoes?: string | null;
};

/** RPC para Fechar o Dia com conferência e depósito de manutenção */
export function useFecharDia() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      diaId,
      saldoInformadoCentavos,
      depositoManutencaoCentavos,
      kmFinal,
      minutosOnline,
      observacoes,
    }: ParametrosFecharDia) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase.rpc('rpc_fechar_dia', {
        p_dia_id: diaId,
        p_saldo_informado_centavos: saldoInformadoCentavos,
        p_deposito_manutencao_centavos: depositoManutencaoCentavos ?? undefined,
        p_km_final: kmFinal,
        p_minutos_online: minutosOnline,
        p_observacoes: observacoes,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dia'] });
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
    },
  });
}

/** RPC para Reabrir o Último Dia Fechado */
export function useReabrirDia() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (diaId: string) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase.rpc('rpc_reabrir_dia', {
        p_dia_id: diaId,
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dia'] });
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
    },
  });
}

export type ItemLotePlataforma = {
  plataformaId: string;
  valorCentavos: number;
  qtdCorridas: number;
};

/** Lança totais por plataforma em lote (com opção somar ou substituir) */
export function useLotePlataformas() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      diaId,
      caixaId,
      categoriaId,
      modo,
      itens,
    }: {
      diaId: string;
      caixaId: string;
      categoriaId?: string | null;
      modo: 'somar' | 'substituir';
      itens: ItemLotePlataforma[];
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      // Se for modo substituir, exclui lançamentos anteriores de corridas do dia
      if (modo === 'substituir') {
        const { error: erroExcluir } = await supabase
          .from('lancamentos')
          .update({ excluido_em: new Date().toISOString() })
          .eq('dia_id', diaId)
          .eq('tipo', 'entrada')
          .is('excluido_em', null);

        if (erroExcluir) throw erroExcluir;
      }

      // Insere os novos lançamentos para as plataformas com valor > 0
      const itensComValor = itens.filter((i) => i.valorCentavos > 0);
      if (itensComValor.length === 0) return [];

      const novos = itensComValor.map((item) => ({
        user_id: user.id,
        caixa_id: caixaId,
        dia_id: diaId,
        tipo: 'entrada' as const,
        valor_centavos: item.valorCentavos,
        plataforma_id: item.plataformaId,
        categoria_id: categoriaId || null,
        qtd_corridas: item.qtdCorridas > 0 ? item.qtdCorridas : 1,
        origem: 'resumo_dia',
        descricao: 'Fechamento em lote por plataforma',
      }));

      const { data, error } = await supabase
        .from('lancamentos')
        .insert(novos)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dia'] });
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
    },
  });
}

