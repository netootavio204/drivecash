import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  const { data: caixas } = useCaixas();
  const principal = saldos?.find((c) => c.tipo === 'principal');
  const caixaObj = caixas?.find((c) => c.tipo === 'principal');
  return {
    saldoCentavos: principal?.saldo_centavos ?? 0,
    caixaId: principal?.caixa_id || caixaObj?.id,
    isLoading,
  };
}

/** Retorna o saldo do caixa de manutenção */
export function useSaldoManutencao() {
  const { data: saldos, isLoading } = useSaldosCaixas();
  const { data: caixas } = useCaixas();
  const manutencao = saldos?.find((c) => c.tipo === 'manutencao');
  const caixaObj = caixas?.find((c) => c.tipo === 'manutencao');
  return {
    saldoCentavos: manutencao?.saldo_centavos ?? 0,
    caixaId: manutencao?.caixa_id || caixaObj?.id,
    isLoading,
  };
}

/** Busca as configurações da reserva de manutenção */
export function useConfiguracaoManutencao() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['configuracoes', 'manutencao', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const [resConfig, resCaixa] = await Promise.all([
        supabase
          .from('configuracoes')
          .select('manutencao_valor_centavos, manutencao_modo, manutencao_percentual')
          .eq('user_id', user.id)
          .maybeSingle(),
        supabase
          .from('caixas')
          .select('meta_saldo_centavos')
          .eq('user_id', user.id)
          .eq('tipo', 'manutencao')
          .maybeSingle(),
      ]);

      return {
        deposito_manutencao_centavos: resConfig.data?.manutencao_valor_centavos ?? 2000,
        modo_manutencao: resConfig.data?.manutencao_modo ?? 'fixo',
        pct_lucro_manutencao: resConfig.data?.manutencao_percentual ?? 10,
        meta_reserva_manutencao_centavos: resCaixa.data?.meta_saldo_centavos ?? 150000,
      };
    },
    enabled: !!user,
  });
}

/** Atualiza parâmetros da reserva de manutenção */
export function useAtualizarConfigManutencao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      metaReservaCentavos,
      depositoCentavos,
      modo,
    }: {
      metaReservaCentavos?: number;
      depositoCentavos?: number;
      modo?: 'fixo' | 'percentual' | 'desativado';
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      if (depositoCentavos !== undefined || modo !== undefined) {
        const updatesConfig: Database['public']['Tables']['configuracoes']['Update'] = {};
        if (depositoCentavos !== undefined) updatesConfig.manutencao_valor_centavos = depositoCentavos;
        if (modo !== undefined) updatesConfig.manutencao_modo = modo;

        await supabase
          .from('configuracoes')
          .update(updatesConfig)
          .eq('user_id', user.id);
      }

      if (metaReservaCentavos !== undefined) {
        await supabase
          .from('caixas')
          .update({ meta_saldo_centavos: metaReservaCentavos })
          .eq('user_id', user.id)
          .eq('tipo', 'manutencao');
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracoes', 'manutencao'] });
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
    },
  });
}

/** RPC para transferir entre caixas (ex: aporte avulso na manutenção) */
export function useTransferir() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      origemId,
      destinoId,
      valorCentavos,
      descricao,
    }: {
      origemId: string;
      destinoId: string;
      valorCentavos: number;
      descricao?: string;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await supabase.rpc('rpc_transferir', {
        p_origem: origemId,
        p_destino: destinoId,
        p_valor_centavos: valorCentavos,
        p_observacao: descricao || 'Transferência entre caixas',
      });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
    },
  });
}

/** Gasto com oficina/manutenção com split inteligente entre reserva e caixa principal */
export function useGastarManutencao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      valorCentavos,
      descricao,
      categoriaId,
      saldoReservaCentavos,
      caixaPrincipalId,
      caixaReservaId,
    }: {
      valorCentavos: number;
      descricao?: string;
      categoriaId?: string | null;
      saldoReservaCentavos: number;
      caixaPrincipalId: string;
      caixaReservaId: string;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const valorReserva = Math.min(valorCentavos, Math.max(0, saldoReservaCentavos));
      const valorExcedente = valorCentavos - valorReserva;

      const lancamentosParaInserir = [];

      // 1) Debita da reserva o disponível
      if (valorReserva > 0) {
        lancamentosParaInserir.push({
          user_id: user.id,
          caixa_id: caixaReservaId,
          tipo: 'saida' as const,
          valor_centavos: valorReserva,
          categoria_id: categoriaId || null,
          descricao: descricao ? `${descricao} (da reserva)` : 'Gasto com manutenção (reserva)',
          origem: 'manual',
        });
      }

      // 2) Se faltar, debita o restante do caixa principal
      if (valorExcedente > 0) {
        lancamentosParaInserir.push({
          user_id: user.id,
          caixa_id: caixaPrincipalId,
          tipo: 'saida' as const,
          valor_centavos: valorExcedente,
          categoria_id: categoriaId || null,
          descricao: descricao ? `${descricao} (excedente do dia)` : 'Gasto com manutenção (excedente caixa)',
          origem: 'manual',
        });
      }

      const { data, error } = await supabase
        .from('lancamentos')
        .insert(lancamentosParaInserir)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
    },
  });
}

