import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { executarAvaliacaoConquistas } from '@/features/metas/api';
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

async function sincronizarAposMutacaoLancamento(
  queryClient: ReturnType<typeof useQueryClient>,
  userId?: string
) {
  queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
  queryClient.invalidateQueries({ queryKey: ['caixas', 'saldos'] });
  queryClient.invalidateQueries({ queryKey: ['dia'] });

  try {
    await supabase.rpc('rpc_atualizar_metas');
  } catch (err) {
    console.warn('[DriveCash] Aviso ao rodar rpc_atualizar_metas:', err);
  }

  queryClient.invalidateQueries({ queryKey: ['metas'] });
  queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
  queryClient.invalidateQueries({ queryKey: ['conquistas'] });
  queryClient.invalidateQueries({ queryKey: ['fases'] });

  if (userId) {
    void executarAvaliacaoConquistas(userId);
  }
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
      km,
      dataReferencia,
      ocorridoEm,
      localId,
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
      km?: number | null;
      dataReferencia?: string | null;
      ocorridoEm?: string | null;
      localId?: string | null;
    }) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const id = crypto.randomUUID();

      // Trata meio_pagamento para compatibilidade de constraint
      let meioPg = meioPagamento;

      const payload: Record<string, unknown> = {
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
        meio_pagamento: meioPg,
        km: km ?? null,
        origem: 'manual',
      };

      if (dataReferencia) payload.data_referencia = dataReferencia;
      if (ocorridoEm) payload.ocorrido_em = ocorridoEm;
      if (localId) payload.local_id = localId;

      let { data, error } = await supabase
        .from('lancamentos')
        .insert(payload as unknown as Database['public']['Tables']['lancamentos']['Insert'])
        .select()
        .single();

      // Fallback seguro se o banco ainda não tiver a coluna local_id
      if (error && error.message.includes('local_id')) {
        delete payload.local_id;
        const retry = await supabase
          .from('lancamentos')
          .insert(payload as unknown as Database['public']['Tables']['lancamentos']['Insert'])
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      // Fallback seguro se o banco ainda não tiver constraint de 'cartao'
      if (error && error.message.includes('meio_pagamento') && meioPg === 'cartao') {
        payload.meio_pagamento = 'outro';
        payload.descricao = payload.descricao ? `[Cartão] ${payload.descricao}` : '[Cartão Maquininha]';
        const retry = await supabase
          .from('lancamentos')
          .insert(payload as unknown as Database['public']['Tables']['lancamentos']['Insert'])
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await sincronizarAposMutacaoLancamento(queryClient, user?.id);
    },
  });
}

export type ItemCriarLancamento = {
  caixaId: string;
  diaId?: string | null;
  tipo: TipoLancamento;
  valorCentavos: number;
  categoriaId?: string | null;
  plataformaId?: string | null;
  descricao?: string | null;
  qtdCorridas?: number;
  meioPagamento?: string | null;
  km?: number | null;
  dataReferencia?: string | null;
  ocorridoEm?: string | null;
};

/** Hook para criar múltiplos lançamentos (ex: corrida com divisão de valores) */
export function useCriarLancamentosEmLote() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (itens: ItemCriarLancamento[]) => {
      if (!user) throw new Error('NAO_AUTENTICADO');
      if (!itens.length) return [];

      const payloads = itens.map((item) => {
        const id = crypto.randomUUID();
        const payload: Record<string, unknown> = {
          id,
          user_id: user.id,
          caixa_id: item.caixaId,
          dia_id: item.diaId,
          tipo: item.tipo,
          valor_centavos: item.valorCentavos,
          categoria_id: item.categoriaId,
          plataforma_id: item.plataformaId,
          descricao: item.descricao,
          qtd_corridas: item.qtdCorridas ?? 0,
          meio_pagamento: item.meioPagamento,
          km: item.km ?? null,
          origem: 'manual',
        };
        if (item.dataReferencia) payload.data_referencia = item.dataReferencia;
        if (item.ocorridoEm) payload.ocorrido_em = item.ocorridoEm;
        return payload;
      });

      let { data, error } = await supabase
        .from('lancamentos')
        .insert(payloads as unknown as Database['public']['Tables']['lancamentos']['Insert'][])
        .select();

      // Fallback seguro se 'cartao' violar constraint
      if (error && error.message.includes('meio_pagamento')) {
        const payloadsFallback = payloads.map((p) => {
          if (p.meio_pagamento === 'cartao') {
            return {
              ...p,
              meio_pagamento: 'outro',
              descricao: p.descricao ? `[Cartão] ${p.descricao}` : '[Cartão Maquininha]',
            };
          }
          return p;
        });

        const retry = await supabase
          .from('lancamentos')
          .insert(payloadsFallback as unknown as Database['public']['Tables']['lancamentos']['Insert'][])
          .select();
        data = retry.data;
        error = retry.error;
      }

      if (error) throw error;
      return data || [];
    },
    onSuccess: async () => {
      await sincronizarAposMutacaoLancamento(queryClient, user?.id);
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
    onSuccess: async () => {
      await sincronizarAposMutacaoLancamento(queryClient, user?.id);
    },
  });
}

/** Hook para exclusão lógica (soft delete) */
export function useExcluirLancamento() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string | string[]) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const ids = Array.isArray(id) ? id : [id];
      if (ids.length === 0) return null;

      const { data, error } = await supabase
        .from('lancamentos')
        .update({
          excluido_em: new Date().toISOString(),
        })
        .in('id', ids)
        .eq('user_id', user.id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await sincronizarAposMutacaoLancamento(queryClient, user?.id);
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
    onSuccess: async () => {
      await sincronizarAposMutacaoLancamento(queryClient, user?.id);
    },
  });
}

export interface ParteInput {
  local_id: string;
  meio: 'dinheiro' | 'pix' | 'debito' | 'credito' | 'app' | 'cupom';
  valor_centavos: number;
}

export interface LancarCorridaInput {
  diaId?: string | null;
  plataformaId: string;
  categoriaId: string;
  valorCentavos: number;
  partes?: ParteInput[];
  restoTipo?: 'app' | 'cupom';
  taxaPlataformaCentavos?: number;
  taxaOrigem?: 'nenhuma' | 'informada' | 'estimada' | 'zero_pacote';
  qtdCorridas?: number;
  ocorridoEm?: string;
  km?: number | null;
  descricao?: string | null;
  dataReferencia?: string | null;
}

/** Hook da V2.4: Lança 1 corrida com partes atômicas via RPC (ou fallback direto) */
export function useLancarCorridaComPartes() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (input: LancarCorridaInput) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      const id = crypto.randomUUID();

      // 1. Tenta executar via RPC atômica rpc_lancar_corrida
      try {
        const { data, error } = await (supabase.rpc as any)('rpc_lancar_corrida', {
          p_id: id,
          p_dia_id: input.diaId || null,
          p_plataforma_id: input.plataformaId,
          p_categoria_id: input.categoriaId,
          p_valor_centavos: input.valorCentavos,
          p_partes: input.partes || [],
          p_resto_tipo: input.restoTipo || 'app',
          p_taxa_plataforma_centavos: input.taxaPlataformaCentavos || 0,
          p_taxa_origem: input.taxaOrigem || 'nenhuma',
          p_qtd_corridas: input.qtdCorridas ?? 1,
          p_ocorrido_em: input.ocorridoEm || new Date().toISOString(),
          p_km: input.km ?? null,
          p_descricao: input.descricao || null,
          p_data_referencia: input.dataReferencia || null,
        });

        if (!error && data) {
          return data;
        }
      } catch (e) {
        console.warn('[DriveCash V2] RPC rpc_lancar_corrida pendente no banco, usando fallback:', e);
      }

      // 2. Fallback direto se a RPC ainda não tiver sido executada no banco
      const { data: caixa } = await supabase
        .from('caixas')
        .select('id')
        .eq('user_id', user.id)
        .eq('tipo', 'principal')
        .single();

      const { data: lancamento, error: erroLanc } = await (supabase as any)
        .from('lancamentos')
        .insert({
          id,
          user_id: user.id,
          caixa_id: caixa?.id,
          dia_id: input.diaId || null,
          tipo: 'entrada',
          valor_centavos: input.valorCentavos,
          categoria_id: input.categoriaId,
          plataforma_id: input.plataformaId,
          descricao: input.descricao || null,
          qtd_corridas: input.qtdCorridas ?? 1,
          km: input.km ?? null,
          ocorrido_em: input.ocorridoEm || new Date().toISOString(),
          data_referencia: input.dataReferencia || new Date().toISOString().slice(0, 10),
          origem: 'manual',
          modo_partes: true,
          taxa_origem: input.taxaOrigem || 'nenhuma',
        })
        .select()
        .single();

      if (erroLanc) throw erroLanc;

      // Inserção das partes se fornecidas
      if (input.partes && input.partes.length > 0) {
        try {
          const partesPayload = input.partes.map((p) => ({
            user_id: user.id,
            lancamento_id: id,
            local_id: p.local_id,
            meio: p.meio,
            valor_centavos: p.valor_centavos,
          }));

          await (supabase as any).from('lancamento_partes').insert(partesPayload);
        } catch (e) {
          console.warn('[DriveCash V2] Inserção de partes em fallback falhou:', e);
        }
      }

      return lancamento;
    },
    onSuccess: async () => {
      await sincronizarAposMutacaoLancamento(queryClient, user?.id);
      queryClient.invalidateQueries({ queryKey: ['locais'] });
    },
  });
}

/** Hook da V2.4: Exclui corrida e taxas associadas */
export function useExcluirCorridaV2() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('NAO_AUTENTICADO');

      try {
        const { error } = await (supabase.rpc as any)('rpc_excluir_corrida', { p_id: id });
        if (!error) return true;
      } catch (e) {
        console.warn('[DriveCash V2] rpc_excluir_corrida falhou, usando soft delete normal:', e);
      }

      await supabase
        .from('lancamentos')
        .update({ excluido_em: new Date().toISOString() })
        .eq('user_id', user.id)
        .or(`id.eq.${id},lancamento_pai_id.eq.${id}`);

      return true;
    },
    onSuccess: async () => {
      await sincronizarAposMutacaoLancamento(queryClient, user?.id);
      queryClient.invalidateQueries({ queryKey: ['locais'] });
    },
  });
}
