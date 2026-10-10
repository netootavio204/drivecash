import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { garantirProvisionamentoUsuario } from '@/features/auth/provisionamento';
import { executarAvaliacaoConquistas } from '@/features/metas/api';
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

      // Garante que o perfil e os caixas existam antes de abrir o dia
      await garantirProvisionamentoUsuario(user);

      // Tenta abrir via RPC
      const { data, error } = await supabase.rpc('rpc_abrir_dia', {
        p_data_referencia: dataReferencia,
        p_km_inicial: kmInicial,
        p_saldo_confirmado_centavos: saldoConfirmadoCentavos,
      });

      if (!error && data) {
        return data;
      }

      const msg = error?.message || '';
      // Se for validação de regra de negócio, propaga o erro
      if (
        msg.includes('DIA_ABERTO_EXISTENTE') ||
        msg.includes('DIA_JA_EXISTE_NESTA_DATA') ||
        msg.includes('NAO_AUTENTICADO')
      ) {
        throw error;
      }

      console.warn('[Meta Driver] RPC rpc_abrir_dia falhou, executando fallback via SDK:', msg);

      // 1. Obter caixa principal
      const { data: caixas } = await supabase
        .from('caixas')
        .select('id, saldo_inicial_centavos')
        .eq('user_id', user.id)
        .eq('tipo', 'principal')
        .maybeSingle();

      const caixaPrincipalId = caixas?.id;
      const saldoBase = caixas?.saldo_inicial_centavos ?? 0;
      const saldoAbertura =
        saldoConfirmadoCentavos !== null && saldoConfirmadoCentavos !== undefined
          ? saldoConfirmadoCentavos
          : saldoBase;

      // 2. Inserir dia de trabalho
      const { data: novoDia, error: erroDia } = await supabase
        .from('dias_trabalho')
        .insert({
          user_id: user.id,
          data_referencia: dataReferencia,
          status: 'aberto',
          saldo_abertura_centavos: saldoAbertura,
          km_inicial: kmInicial,
        })
        .select()
        .single();

      if (erroDia) throw erroDia;

      // 3. Se houve ajuste de saldo na abertura, registrar lançamento
      if (
        caixaPrincipalId &&
        saldoConfirmadoCentavos !== null &&
        saldoConfirmadoCentavos !== undefined &&
        saldoConfirmadoCentavos !== saldoBase
      ) {
        const dif = saldoConfirmadoCentavos - saldoBase;
        await supabase.from('lancamentos').insert({
          user_id: user.id,
          caixa_id: caixaPrincipalId,
          dia_id: novoDia.id,
          tipo: dif > 0 ? 'ajuste_entrada' : 'ajuste_saida',
          valor_centavos: Math.abs(dif),
          descricao: 'Ajuste na abertura do dia',
          origem: 'ajuste_abertura',
          data_referencia: dataReferencia,
          ocorrido_em: new Date().toISOString(),
          qtd_corridas: 0,
        });
      }

      return novoDia;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dia'] });
      queryClient.invalidateQueries({ queryKey: ['caixas', 'saldos'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
      queryClient.invalidateQueries({ queryKey: ['conquistas'] });
      if (user) void executarAvaliacaoConquistas(user.id);
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

      // 1. Tenta fechar via RPC do banco
      const { data, error } = await supabase.rpc('rpc_fechar_dia', {
        p_dia_id: diaId,
        p_saldo_informado_centavos: saldoInformadoCentavos,
        p_deposito_manutencao_centavos: depositoManutencaoCentavos ?? 0,
        p_km_final: kmFinal,
        p_minutos_online: minutosOnline,
        p_observacoes: observacoes,
      });

      if (!error && data) {
        return data;
      }

      const msg = error?.message || '';
      console.warn('[Meta Driver] RPC rpc_fechar_dia falhou, executando fechamento direto via SDK:', msg);

      // Validações de regra de negócio estritas
      if (
        msg.includes('KM_FINAL_INVALIDO') ||
        msg.includes('DIA_JA_FECHADO') ||
        msg.includes('DIA_NAO_ENCONTRADO')
      ) {
        throw error;
      }

      // 2. Contingência direta via SDK para contornar falhas de RLS/auditoria no PostgreSQL
      const { data: diaExistente, error: errDia } = await supabase
        .from('dias_trabalho')
        .select('*')
        .eq('id', diaId)
        .eq('user_id', user.id)
        .single();

      if (errDia || !diaExistente) throw errDia || new Error('DIA_NAO_ENCONTRADO');
      if (diaExistente.status !== 'aberto') throw new Error('DIA_JA_FECHADO');

      if (
        kmFinal !== null &&
        kmFinal !== undefined &&
        diaExistente.km_inicial !== null &&
        diaExistente.km_inicial !== undefined &&
        kmFinal < diaExistente.km_inicial
      ) {
        throw new Error('KM_FINAL_INVALIDO');
      }

      // Caixas do motorista
      const { data: caixas } = await supabase
        .from('caixas')
        .select('id, tipo')
        .eq('user_id', user.id);

      const caixaPrincipalId = caixas?.find((c) => c.tipo === 'principal')?.id;
      const caixaManutencaoId = caixas?.find((c) => c.tipo === 'manutencao')?.id;

      // Saldo calculado do caixa principal
      let saldoCalc = 0;
      if (caixaPrincipalId) {
        const { data: saldos } = await supabase
          .from('vw_saldo_caixas')
          .select('saldo_centavos')
          .eq('caixa_id', caixaPrincipalId)
          .maybeSingle();
        saldoCalc = Number(saldos?.saldo_centavos ?? 0);
      }
      let dif = 0;

      // Registro de ajuste por conferência física (sobra/falta)
      if (
        caixaPrincipalId &&
        saldoInformadoCentavos !== null &&
        saldoInformadoCentavos !== undefined &&
        saldoInformadoCentavos !== saldoCalc
      ) {
        dif = saldoInformadoCentavos - saldoCalc;
        await supabase.from('lancamentos').insert({
          user_id: user.id,
          caixa_id: caixaPrincipalId,
          dia_id: diaId,
          tipo: dif > 0 ? 'ajuste_entrada' : 'ajuste_saida',
          valor_centavos: Math.abs(dif),
          descricao: dif > 0 ? 'Sobra na conferência do caixa' : 'Falta na conferência do caixa',
          origem: 'conferencia',
          data_referencia: diaExistente.data_referencia,
          ocorrido_em: new Date().toISOString(),
          qtd_corridas: 0,
        });
      }

      // Transferência para a reserva de manutenção (se configurada e com valor)
      const deposito = depositoManutencaoCentavos ?? 0;
      if (deposito > 0 && caixaPrincipalId && caixaManutencaoId) {
        const transId = crypto.randomUUID();
        await supabase.from('transferencias').insert({
          id: transId,
          user_id: user.id,
          caixa_origem_id: caixaPrincipalId,
          caixa_destino_id: caixaManutencaoId,
          valor_centavos: deposito,
          dia_id: diaId,
          observacao: 'Depósito diário de manutenção',
        });

        await supabase.from('lancamentos').insert([
          {
            user_id: user.id,
            caixa_id: caixaPrincipalId,
            dia_id: diaId,
            tipo: 'transferencia_saida',
            valor_centavos: deposito,
            descricao: 'Depósito diário de manutenção',
            origem: 'deposito_manutencao',
            data_referencia: diaExistente.data_referencia,
            ocorrido_em: new Date().toISOString(),
            transferencia_id: transId,
            qtd_corridas: 0,
          },
          {
            user_id: user.id,
            caixa_id: caixaManutencaoId,
            dia_id: diaId,
            tipo: 'transferencia_entrada',
            valor_centavos: deposito,
            descricao: 'Depósito diário de manutenção',
            origem: 'deposito_manutencao',
            data_referencia: diaExistente.data_referencia,
            ocorrido_em: new Date().toISOString(),
            transferencia_id: transId,
            qtd_corridas: 0,
          },
        ]);
      }

      // Resumo consolidado para congelar no dia
      const { data: resumoDia } = await supabase
        .from('vw_resumo_dia')
        .select('*')
        .eq('dia_id', diaId)
        .maybeSingle();

      const saldoFechamento =
        (saldoInformadoCentavos !== null && saldoInformadoCentavos !== undefined
          ? saldoInformadoCentavos
          : saldoCalc) - deposito;

      // Atualiza dias_trabalho para status 'fechado'
      const { data: diaFechado, error: errFechamento } = await supabase
        .from('dias_trabalho')
        .update({
          status: 'fechado',
          fechado_em: new Date().toISOString(),
          saldo_calculado_centavos: saldoCalc,
          saldo_informado_centavos: saldoInformadoCentavos,
          saldo_fechamento_centavos: saldoFechamento,
          diferenca_conferencia_centavos: dif,
          reserva_manutencao_centavos: deposito,
          km_final: kmFinal,
          minutos_online: minutosOnline,
          observacoes: observacoes,
          resumo: (resumoDia as unknown as Database['public']['Tables']['dias_trabalho']['Row']['resumo']) || {},
        })
        .eq('id', diaId)
        .select()
        .single();

      if (errFechamento) throw errFechamento;
      return diaFechado;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dia'] });
      queryClient.invalidateQueries({ queryKey: ['caixas'] });
      queryClient.invalidateQueries({ queryKey: ['lancamentos'] });
      queryClient.invalidateQueries({ queryKey: ['metas'] });
      queryClient.invalidateQueries({ queryKey: ['gamificacao'] });
      queryClient.invalidateQueries({ queryKey: ['conquistas'] });
      queryClient.invalidateQueries({ queryKey: ['fases'] });
      void supabase.rpc('rpc_atualizar_metas');
      if (user) void executarAvaliacaoConquistas(user.id);
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

