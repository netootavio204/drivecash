import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database } from '@/lib/database.types';

type SaldoCaixa = Database['public']['Views']['vw_saldo_caixas']['Row'];
type Caixa = Database['public']['Tables']['caixas']['Row'];

/** Busca o saldo calculado no banco para todos os caixas do usuário */
export function useSaldosCaixas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['caixas', 'saldos', user?.id],
    queryFn: async (): Promise<SaldoCaixa[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('vw_saldo_caixas')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar saldos dos caixas:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
}

/** Busca os registros da tabela de caixas */
export function useCaixas() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['caixas', 'lista', user?.id],
    queryFn: async (): Promise<Caixa[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('caixas')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true);

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar lista de caixas:', error.message);
        return [];
      }
      return data || [];
    },
    enabled: !!user,
  });
}

/** Retorna o saldo do caixa principal */
export function useSaldoPrincipal() {
  const { data: saldos, isLoading } = useSaldosCaixas();
  const principal = saldos?.find((c) => c.tipo === 'principal');
  return {
    saldoCentavos: principal?.saldo_centavos ?? 0,
    caixaId: principal?.caixa_id,
    isLoading,
  };
}

/** Retorna o saldo do caixa de manutenção */
export function useSaldoManutencao() {
  const { data: saldos, isLoading } = useSaldosCaixas();
  const manutencao = saldos?.find((c) => c.tipo === 'manutencao');
  return {
    saldoCentavos: manutencao?.saldo_centavos ?? 0,
    caixaId: manutencao?.caixa_id,
    isLoading,
  };
}
