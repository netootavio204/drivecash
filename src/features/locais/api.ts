import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type {
  LocalDinheiro,
  LocalComSaldo,
  BancoCatalogo,
  LocalTransferencia,
  ConciliacaoLocais,
  CriarTransferenciaInput,
} from './types';

/** Busca o catálogo de bancos cadastrados */
export function useBancosCatalogo() {
  return useQuery({
    queryKey: ['bancos_catalogo'],
    queryFn: async (): Promise<BancoCatalogo[]> => {
      const { data, error } = await (supabase as any)
        .from('bancos_catalogo')
        .select('*')
        .order('ordem', { ascending: true });

      if (error) {
        console.warn('[DriveCash] Erro ao buscar catálogo de bancos:', error.message);
        return [
          { codigo: 'inter', nome: 'Inter', cor: '#FF7A00', ordem: 1 },
          { codigo: 'mercado_pago', nome: 'Mercado Pago', cor: '#00B1EA', ordem: 2 },
          { codigo: 'santander', nome: 'Santander', cor: '#EC0000', ordem: 3 },
          { codigo: 'nubank', nome: 'Nubank', cor: '#820AD1', ordem: 4 },
        ];
      }
      return data || [];
    },
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/** Busca os locais de dinheiro do motorista com saldos integrados */
export function useLocaisDinheiro() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['locais', 'lista', user?.id],
    queryFn: async (): Promise<LocalComSaldo[]> => {
      if (!user) return [];

      // 1. Busca os locais cadastrados
      let { data: locais, error: erroLocais } = await (supabase as any)
        .from('locais_dinheiro')
        .select('*')
        .eq('user_id', user.id)
        .eq('ativo', true)
        .order('ordem', { ascending: true });

      // Se a tabela existe mas o usuário não tem locais criados, inicializa idempotentemente
      if (!erroLocais && (!locais || locais.length === 0)) {
        try {
          await (supabase.rpc as any)('rpc_inicializar_locais');
          const refetch = await (supabase as any)
            .from('locais_dinheiro')
            .select('*')
            .eq('user_id', user.id)
            .eq('ativo', true)
            .order('ordem', { ascending: true });
          locais = refetch.data || [];
        } catch (e) {
          console.warn('[DriveCash] Inicialização de locais via RPC falhou ou pendente:', e);
        }
      }

      // Fallback gracioso se a migração ainda não estiver no banco
      if (erroLocais || !locais || locais.length === 0) {
        return [
          {
            id: 'fallback-bolso',
            user_id: user.id,
            tipo: 'bolso',
            nome: 'Bolso',
            cor: '#10B981',
            saldo_inicial_centavos: 0,
            taxa_debito_pct: 0,
            taxa_credito_pct: 0,
            taxa_pix_pct: 0,
            prazo_credito_dias: 0,
            ativo: true,
            ordem: 1,
            criado_em: new Date().toISOString(),
            saldo_centavos: 0,
          },
          {
            id: 'fallback-app',
            user_id: user.id,
            tipo: 'app',
            nome: 'App 99',
            cor: '#F59E0B',
            saldo_inicial_centavos: 0,
            taxa_debito_pct: 0,
            taxa_credito_pct: 0,
            taxa_pix_pct: 0,
            prazo_credito_dias: 0,
            ativo: true,
            ordem: 2,
            criado_em: new Date().toISOString(),
            saldo_centavos: 0,
          },
          {
            id: 'fallback-inter',
            user_id: user.id,
            tipo: 'banco',
            nome: 'Banco Inter',
            banco_codigo: 'inter',
            cor: '#FF7A00',
            saldo_inicial_centavos: 0,
            taxa_debito_pct: 0,
            taxa_credito_pct: 0,
            taxa_pix_pct: 0,
            prazo_credito_dias: 0,
            ativo: true,
            ordem: 3,
            criado_em: new Date().toISOString(),
            saldo_centavos: 0,
          },
          {
            id: 'fallback-mp',
            user_id: user.id,
            tipo: 'banco',
            nome: 'Mercado Pago',
            banco_codigo: 'mercado_pago',
            cor: '#00B1EA',
            saldo_inicial_centavos: 0,
            taxa_debito_pct: 0,
            taxa_credito_pct: 0,
            taxa_pix_pct: 0,
            prazo_credito_dias: 0,
            ativo: true,
            ordem: 4,
            criado_em: new Date().toISOString(),
            saldo_centavos: 0,
          },
        ];
      }

      // 2. Busca saldos calculados na view
      const { data: saldosView } = await (supabase as any)
        .from('vw_saldo_locais')
        .select('*')
        .eq('user_id', user.id);

      const mapaSaldos = new Map<string, number>();
      if (saldosView && Array.isArray(saldosView)) {
        for (const s of saldosView) {
          mapaSaldos.set(s.local_id, Number(s.saldo_centavos || 0));
        }
      }

      return locais.map((loc: LocalDinheiro) => ({
        ...loc,
        saldo_centavos: mapaSaldos.get(loc.id) ?? Number(loc.saldo_inicial_centavos || 0),
      }));
    },
    enabled: !!user,
  });
}

/** Hook de conciliação: Totais de Locais vs Caixas */
export function useConciliacaoLocais() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['locais', 'conciliacao', user?.id],
    queryFn: async (): Promise<ConciliacaoLocais | null> => {
      if (!user) return null;

      const { data, error } = await (supabase as any)
        .from('vw_conciliacao')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error || !data) {
        return null;
      }

      return {
        user_id: data.user_id,
        total_locais_centavos: Number(data.total_locais_centavos || 0),
        total_caixas_centavos: Number(data.total_caixas_centavos || 0),
        diferenca_centavos: Number(data.diferenca_centavos || 0),
      };
    },
    enabled: !!user,
  });
}

/** Hook para realizar transferência entre locais */
export function useTransferirLocal() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: CriarTransferenciaInput): Promise<LocalTransferencia> => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      // Tenta via RPC dedicada
      try {
        const { data, error } = await (supabase.rpc as any)('rpc_transferir_local', {
          p_origem_id: input.local_origem_id,
          p_destino_id: input.local_destino_id,
          p_valor_centavos: input.valor_centavos,
          p_taxa_centavos: input.taxa_centavos || 0,
          p_dia_id: input.dia_id || null,
          p_observacao: input.observacao || null,
        });

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('[DriveCash] RPC rpc_transferir_local indisponível, inserindo na tabela:', e);
      }

      // Fallback: inserção direta na tabela locais_transferencias
      const { data, error } = await (supabase as any)
        .from('locais_transferencias')
        .insert({
          user_id: user.id,
          local_origem_id: input.local_origem_id,
          local_destino_id: input.local_destino_id,
          valor_centavos: input.valor_centavos,
          taxa_centavos: input.taxa_centavos || 0,
          dia_id: input.dia_id || null,
          observacao: input.observacao || null,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message || 'Erro ao realizar transferência');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais'] });
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['transferencias'] });
    },
  });
}

/** Hook para atualizar saldo inicial de um local */
export function useAtualizarSaldoInicial() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      localId,
      saldoInicialCentavos,
    }: {
      localId: string;
      saldoInicialCentavos: number;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const { data, error } = await (supabase as any)
        .from('locais_dinheiro')
        .update({ saldo_inicial_centavos: saldoInicialCentavos })
        .eq('id', localId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locais'] });
    },
  });
}

/** Busca histórico recente de transferências entre locais */
export function useHistoricoTransferencias() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['locais', 'transferencias', user?.id],
    queryFn: async (): Promise<LocalTransferencia[]> => {
      if (!user) return [];

      const { data, error } = await (supabase as any)
        .from('locais_transferencias')
        .select(`
          *,
          local_origem:locais_dinheiro!local_origem_id(*),
          local_destino:locais_dinheiro!local_destino_id(*)
        `)
        .eq('user_id', user.id)
        .is('excluido_em', null)
        .order('criado_em', { ascending: false })
        .limit(20);

      if (error) {
        console.warn('[DriveCash] Erro ao buscar transferências:', error.message);
        return [];
      }

      return data || [];
    },
    enabled: !!user,
  });
}
