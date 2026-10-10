import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import type { Database } from '@/lib/database.types';

export type DiaTrabalho = Database['public']['Tables']['dias_trabalho']['Row'];
export type Lancamento = Database['public']['Tables']['lancamentos']['Row'] & {
  plataformas?: { nome: string; cor: string } | null;
  categorias?: { nome: string; icone: string | null; cor: string | null } | null;
};

export interface DiaHistoricoComResumo extends DiaTrabalho {
  receita_centavos: number;
  despesas_centavos: number;
  lucro_centavos: number;
  corridas: number;
}

/** Busca todo o histórico de dias trabalhados */
export function useHistoricoDias() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['historico', 'dias', user?.id],
    queryFn: async (): Promise<DiaHistoricoComResumo[]> => {
      if (!user) return [];

      // 1. Buscar dias de trabalho
      const { data: dias, error: errDias } = await supabase
        .from('dias_trabalho')
        .select('*')
        .eq('user_id', user.id)
        .order('data_referencia', { ascending: false });

      if (errDias) {
        console.warn('[Meta Driver] Erro ao buscar histórico de dias:', errDias.message);
        return [];
      }

      // 2. Buscar resumos dos dias
      const { data: resumos } = await supabase
        .from('vw_resumo_dia')
        .select('*')
        .eq('user_id', user.id);

      const mapResumo = new Map<string, { receita: number; despesas: number; corridas: number }>();
      if (resumos) {
        for (const r of resumos) {
          mapResumo.set(r.dia_id, {
            receita: Number(r.receita_centavos) || 0,
            despesas: Number(r.despesas_centavos) || 0,
            corridas: Number(r.corridas) || 0,
          });
        }
      }

      return (dias || []).map((dia) => {
        const resumo = mapResumo.get(dia.id) || { receita: 0, despesas: 0, corridas: 0 };
        return {
          ...dia,
          receita_centavos: resumo.receita,
          despesas_centavos: resumo.despesas,
          lucro_centavos: resumo.receita - resumo.despesas,
          corridas: resumo.corridas,
        };
      });
    },
    enabled: !!user,
  });
}

/** Busca os detalhes de um dia específico (somente leitura) */
export function useDetalheDia(diaId?: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['historico', 'detalhe', diaId, user?.id],
    queryFn: async () => {
      if (!diaId || !user) return null;

      const { data: dia, error: errDia } = await supabase
        .from('dias_trabalho')
        .select('*')
        .eq('id', diaId)
        .eq('user_id', user.id)
        .single();

      if (errDia) return null;

      const { data: lancamentos } = await supabase
        .from('lancamentos')
        .select('*, plataformas(nome, cor), categorias(nome, icone, cor)')
        .eq('dia_id', diaId)
        .eq('user_id', user.id)
        .is('excluido_em', null)
        .order('ocorrido_em', { ascending: false });

      const { data: resumo } = await supabase
        .from('vw_resumo_dia')
        .select('*')
        .eq('dia_id', diaId)
        .maybeSingle();

      const receita = Number(resumo?.receita_centavos) || 0;
      const despesas = Number(resumo?.despesas_centavos) || 0;

      return {
        dia,
        lancamentos: (lancamentos as unknown as Lancamento[]) || [],
        receita,
        despesas,
        lucro: receita - despesas,
        corridas: Number(resumo?.corridas) || 0,
      };
    },
    enabled: !!diaId && !!user,
  });
}
