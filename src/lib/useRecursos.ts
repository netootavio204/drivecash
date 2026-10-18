import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { RecursosV2 } from './recursos';
import { RECURSOS_PADRAO, normalizarRecursos } from './recursos';

/**
 * Hook para obter o estado das chaves liga/desliga de recursos da V2
 */
export function useRecursos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['recursos', user?.id],
    queryFn: async (): Promise<RecursosV2> => {
      if (!user) return RECURSOS_PADRAO;

      const { data, error } = await (supabase.from('configuracoes') as any)
        .select('recursos')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        // Se a coluna ainda não existir no banco antes da migração, retorna padrão com segurança
        return RECURSOS_PADRAO;
      }

      return normalizarRecursos(data?.recursos);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  const mutation = useMutation({
    mutationFn: async (novosRecursos: Partial<RecursosV2>) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const recursosAtuais = query.data || RECURSOS_PADRAO;
      const recursosAtualizados: RecursosV2 = {
        ...recursosAtuais,
        ...novosRecursos,
      };

      const { error } = await (supabase.from('configuracoes') as any)
        .update({ recursos: recursosAtualizados })
        .eq('user_id', user.id);

      if (error) throw error;
      return recursosAtualizados;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['recursos', user?.id], data);
    },
  });

  return {
    recursos: query.data || RECURSOS_PADRAO,
    carregando: query.isLoading,
    atualizarRecurso: mutation.mutateAsync,
    atualizando: mutation.isPending,
  };
}
