import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database } from '@/lib/database.types';

type DiaTrabalho = Database['public']['Tables']['dias_trabalho']['Row'];
type ResumoDia = Database['public']['Views']['vw_resumo_dia']['Row'];

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
