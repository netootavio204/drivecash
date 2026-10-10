import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database } from '@/lib/database.types';

export type Veiculo = Database['public']['Tables']['veiculos']['Row'];

/** Busca o veículo principal do motorista */
export function useVeiculoPrincipal() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['veiculos', 'principal', user?.id],
    queryFn: async (): Promise<Veiculo | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('criado_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar veículo:', error.message);
        return null;
      }
      return data;
    },
    enabled: !!user,
  });
}

/** Salva ou atualiza os dados do veículo */
export function useSalvarVeiculo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      modelo,
      placa,
      ano,
      combustivel = 'flex',
      kmAtual = 0,
    }: {
      id?: string;
      modelo: string;
      placa?: string | null;
      ano?: number | null;
      combustivel?: string;
      kmAtual?: number;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      if (id) {
        const { data, error } = await supabase
          .from('veiculos')
          .update({
            modelo,
            placa,
            ano,
            combustivel,
            km_atual: kmAtual,
          })
          .eq('id', id)
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return data;
      } else {
        const { data, error } = await supabase
          .from('veiculos')
          .insert({
            user_id: user.id,
            apelido: modelo,
            modelo,
            placa,
            ano,
            combustivel,
            km_atual: kmAtual,
            ativo: true,
          })
          .select()
          .single();

        if (error) throw error;
        return data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
    },
  });
}
