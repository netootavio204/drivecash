import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Estados';
import { useSaldosCaixas } from './api';
import { EntradaRapidaSheet } from '@/features/lancamentos/EntradaRapidaSheet';
import { SaidaRapidaSheet } from '@/features/lancamentos/SaidaRapidaSheet';
import { formatarMoeda } from '@/lib/money';
import { formatarDataCurta } from '@/lib/datas';
import type { Database } from '@/lib/database.types';
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  ArrowRightLeft,
  Plus,
  Minus,
} from 'lucide-react';

type Lancamento = Database['public']['Tables']['lancamentos']['Row'] & {
  plataformas?: { nome: string; cor: string } | null;
  categorias?: { nome: string; icone: string | null } | null;
};

export const CaixaView: React.FC = () => {
  const { user } = useAuth();
  const { data: saldos, isLoading: carregandoSaldos } = useSaldosCaixas();

  const [caixaSelecionado, setCaixaSelecionado] = useState<'principal' | 'manutencao'>('principal');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [sheetEntrada, setSheetEntrada] = useState<boolean>(false);
  const [sheetSaida, setSheetSaida] = useState<boolean>(false);

  const principal = saldos?.find((c) => c.tipo === 'principal');
  const manutencao = saldos?.find((c) => c.tipo === 'manutencao');

  const caixaAtivoId =
    caixaSelecionado === 'principal' ? principal?.caixa_id : manutencao?.caixa_id;

  // Busca o extrato do caixa ativo
  const { data: extrato = [], isLoading: carregandoExtrato } = useQuery({
    queryKey: ['extrato', caixaAtivoId, filtroTipo, user?.id],
    queryFn: async (): Promise<Lancamento[]> => {
      if (!caixaAtivoId || !user) return [];

      let query = supabase
        .from('lancamentos')
        .select('*, plataformas(nome, cor), categorias(nome, icone)')
        .eq('caixa_id', caixaAtivoId)
        .eq('user_id', user.id)
        .is('excluido_em', null)
        .order('ocorrido_em', { ascending: false });

      if (filtroTipo === 'entrada') {
        query = query.in('tipo', ['entrada', 'transferencia_entrada', 'ajuste_entrada']);
      } else if (filtroTipo === 'saida') {
        query = query.in('tipo', ['saida', 'transferencia_saida', 'ajuste_saida']);
      }

      const { data, error } = await query;
      if (error) {
        console.warn('[Meta Driver] Erro ao buscar extrato:', error.message);
        return [];
      }
      return (data as unknown as Lancamento[]) || [];
    },
    enabled: !!caixaAtivoId && !!user,
  });

  return (
    <div className="space-y-6">
      {/* Topo: Seletor de Caixas */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setCaixaSelecionado('principal')}
          className={`p-4 rounded-xl border text-left transition-all ${
            caixaSelecionado === 'principal'
              ? 'border-laranja-500 bg-bg-2 shadow-neon'
              : 'border-line/60 bg-bg-1 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-texto-2 uppercase">
            <Wallet className="size-4 text-laranja-400" />
            <span>Caixa do Dia</span>
          </div>
          <div className="numero text-xl sm:text-2xl font-black text-texto-1 mt-1">
            {carregandoSaldos ? '...' : formatarMoeda(principal?.saldo_centavos ?? 0)}
          </div>
        </button>

        <button
          type="button"
          onClick={() => setCaixaSelecionado('manutencao')}
          className={`p-4 rounded-xl border text-left transition-all ${
            caixaSelecionado === 'manutencao'
              ? 'border-positivo bg-bg-2 shadow-[0_0_15px_rgba(34,197,94,0.2)]'
              : 'border-line/60 bg-bg-1 opacity-70 hover:opacity-100'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-texto-2 uppercase">
            <ShieldCheck className="size-4 text-positivo" />
            <span>Manutenção</span>
          </div>
          <div className="numero text-xl sm:text-2xl font-black text-texto-1 mt-1">
            {carregandoSaldos ? '...' : formatarMoeda(manutencao?.saldo_centavos ?? 0)}
          </div>
        </button>
      </div>

      {/* Ações Rápidas */}
      <div className="flex items-center justify-between gap-3">
        {/* Filtros por tipo */}
        <div className="flex items-center gap-2">
          {(['todos', 'entrada', 'saida'] as const).map((tipo) => (
            <Chip
              key={tipo}
              selecionado={filtroTipo === tipo}
              onClick={() => setFiltroTipo(tipo)}
            >
              {tipo === 'todos' && 'Todos'}
              {tipo === 'entrada' && 'Entradas'}
              {tipo === 'saida' && 'Saídas'}
            </Chip>
          ))}
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          <Button
            variante="primario"
            className="text-xs !h-9 !py-0"
            onClick={() => setSheetEntrada(true)}
            icone={<Plus className="size-4" />}
          >
            Entrada
          </Button>
          <Button
            variante="perigo"
            className="text-xs !h-9 !py-0"
            onClick={() => setSheetSaida(true)}
            icone={<Minus className="size-4" />}
          >
            Saída
          </Button>
        </div>
      </div>

      {/* Extrato Completo */}
      <Card className="space-y-4">
        <h3 className="font-bold text-base text-texto-1">
          Extrato — {caixaSelecionado === 'principal' ? 'Caixa do Dia' : 'Reserva de Manutenção'}
        </h3>

        {carregandoExtrato ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : extrato.length === 0 ? (
          <div className="text-center py-12 text-texto-3 text-xs">
            Nenhum lançamento encontrado neste caixa.
          </div>
        ) : (
          <div className="divide-y divide-line/40 text-sm">
            {extrato.map((item) => {
              const ehEntrada =
                item.tipo === 'entrada' ||
                item.tipo === 'transferencia_entrada' ||
                item.tipo === 'ajuste_entrada';
              const ehTransferencia = item.tipo.startsWith('transferencia');
              const dataFormatada = formatarDataCurta(new Date(item.data_referencia + 'T12:00:00'));
              const hora = new Date(item.ocorrido_em).toLocaleTimeString('pt-BR', {
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                        ehEntrada
                          ? 'bg-positivo/15 text-positivo border border-positivo/30'
                          : ehTransferencia
                          ? 'bg-brand-orange/15 text-laranja-400 border border-brand-orange/30'
                          : 'bg-negativo/15 text-negativo border border-negativo/30'
                      }`}
                    >
                      {ehEntrada ? (
                        <TrendingUp className="size-5" />
                      ) : ehTransferencia ? (
                        <ArrowRightLeft className="size-5" />
                      ) : (
                        <TrendingDown className="size-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-texto-1 text-xs sm:text-sm truncate">
                        {item.plataformas?.nome || item.categorias?.nome || item.descricao || 'Lançamento'}
                      </p>
                      <p className="text-[11px] text-texto-3 truncate">
                        {dataFormatada} às {hora} {item.descricao ? `• ${item.descricao}` : ''}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`numero font-bold text-sm sm:text-base shrink-0 ${
                      ehEntrada ? 'text-positivo' : 'text-negativo'
                    }`}
                  >
                    {ehEntrada ? '+' : '−'}
                    {formatarMoeda(item.valor_centavos)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <EntradaRapidaSheet
        aberto={sheetEntrada}
        aoFechar={() => setSheetEntrada(false)}
      />

      <SaidaRapidaSheet
        aberto={sheetSaida}
        aoFechar={() => setSheetSaida(false)}
      />
    </div>
  );
};
