import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Estados';
import { useSaldosCaixas, useCaixas } from './api';
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
  const { data: caixas } = useCaixas();

  const [caixaSelecionado, setCaixaSelecionado] = useState<'principal' | 'manutencao'>('principal');
  const [filtroTipo, setFiltroTipo] = useState<'todos' | 'entrada' | 'saida'>('todos');
  const [sheetEntrada, setSheetEntrada] = useState<boolean>(false);
  const [sheetSaida, setSheetSaida] = useState<boolean>(false);

  const principal = saldos?.find((c) => c.tipo === 'principal');
  const manutencao = saldos?.find((c) => c.tipo === 'manutencao');
  const caixaPrincipalObj = caixas?.find((c) => c.tipo === 'principal');
  const caixaManutencaoObj = caixas?.find((c) => c.tipo === 'manutencao');

  const caixaAtivoId =
    caixaSelecionado === 'principal'
      ? principal?.caixa_id || caixaPrincipalObj?.id
      : manutencao?.caixa_id || caixaManutencaoObj?.id;

  // Busca todos os lançamentos ativos do caixa selecionado (chave padronizada com o restante do app)
  const { data: todosLancamentos = [], isLoading: carregandoExtrato } = useQuery({
    queryKey: ['lancamentos', 'caixa', caixaAtivoId, user?.id],
    queryFn: async (): Promise<Lancamento[]> => {
      if (!caixaAtivoId || !user) return [];

      const { data, error } = await supabase
        .from('lancamentos')
        .select('*, plataformas(nome, cor), categorias(nome, icone)')
        .eq('caixa_id', caixaAtivoId)
        .eq('user_id', user.id)
        .is('excluido_em', null)
        .order('ocorrido_em', { ascending: false });

      if (error) {
        console.warn('[Meta Driver] Erro ao buscar extrato do caixa:', error.message);
        return [];
      }
      return (data as unknown as Lancamento[]) || [];
    },
    enabled: !!caixaAtivoId && !!user,
  });

  // Separação em memória para contagem e resposta instantânea ao clique
  const { entradas, saidas } = useMemo(() => {
    const ent = todosLancamentos.filter(
      (item) =>
        item.tipo === 'entrada' ||
        item.tipo === 'transferencia_entrada' ||
        item.tipo === 'ajuste_entrada'
    );
    const sai = todosLancamentos.filter(
      (item) =>
        item.tipo === 'saida' ||
        item.tipo === 'transferencia_saida' ||
        item.tipo === 'ajuste_saida'
    );
    return { entradas: ent, saidas: sai };
  }, [todosLancamentos]);

  // Lista visível conforme o filtro selecionado
  const extrato = useMemo(() => {
    if (filtroTipo === 'entrada') return entradas;
    if (filtroTipo === 'saida') return saidas;
    return todosLancamentos;
  }, [todosLancamentos, filtroTipo, entradas, saidas]);

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

      {/* Ações Rápidas & Filtros com Contador */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Filtros por tipo com contagem explícita */}
        <div className="flex items-center gap-2">
          <Chip
            selecionado={filtroTipo === 'todos'}
            onClick={() => setFiltroTipo('todos')}
          >
            Todos ({todosLancamentos.length})
          </Chip>
          <Chip
            selecionado={filtroTipo === 'entrada'}
            onClick={() => setFiltroTipo('entrada')}
          >
            Entradas ({entradas.length})
          </Chip>
          <Chip
            selecionado={filtroTipo === 'saida'}
            onClick={() => setFiltroTipo('saida')}
          >
            Saídas ({saidas.length})
          </Chip>
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
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-texto-1">
            Extrato — {caixaSelecionado === 'principal' ? 'Caixa do Dia' : 'Reserva de Manutenção'}
          </h3>
          <span className="text-xs text-texto-3 font-medium">
            {filtroTipo === 'todos'
              ? `${todosLancamentos.length} lançamento(s)`
              : filtroTipo === 'entrada'
              ? `${entradas.length} entrada(s)`
              : `${saidas.length} saída(s)`}
          </span>
        </div>

        {carregandoExtrato ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-14 w-full rounded-md" />
            ))}
          </div>
        ) : extrato.length === 0 ? (
          <div className="text-center py-10 flex flex-col items-center justify-center gap-3 text-texto-3 text-xs bg-bg-2/40 rounded-xl border border-line/40 p-6">
            <div className="size-11 rounded-full bg-bg-3 flex items-center justify-center text-texto-2">
              {filtroTipo === 'saida' ? (
                <TrendingDown className="size-5 text-negativo" />
              ) : filtroTipo === 'entrada' ? (
                <TrendingUp className="size-5 text-positivo" />
              ) : (
                <Wallet className="size-5 text-laranja-400" />
              )}
            </div>
            <p className="font-semibold text-texto-1 text-sm">
              {filtroTipo === 'saida'
                ? 'Nenhuma saída ou despesa registrada neste caixa'
                : filtroTipo === 'entrada'
                ? 'Nenhuma corrida ou entrada registrada neste caixa'
                : 'Nenhum lançamento encontrado neste caixa'}
            </p>
            <p className="text-[11px] text-texto-3 max-w-sm">
              {filtroTipo === 'saida'
                ? 'Você ainda não registrou nenhum gasto (combustível, refeição, lavagem, etc.) para este caixa.'
                : filtroTipo === 'entrada'
                ? 'Você ainda não registrou nenhuma corrida ou receita para este caixa.'
                : 'Inicie adicionando suas corridas ou seus gastos do expediente.'}
            </p>
            {filtroTipo === 'saida' ? (
              <Button
                variante="perigo"
                className="mt-1 !h-9 text-xs"
                onClick={() => setSheetSaida(true)}
                icone={<Minus className="size-4" />}
              >
                Registrar Saída Agora
              </Button>
            ) : filtroTipo === 'entrada' ? (
              <Button
                variante="primario"
                className="mt-1 !h-9 text-xs"
                onClick={() => setSheetEntrada(true)}
                icone={<Plus className="size-4" />}
              >
                Registrar Entrada Agora
              </Button>
            ) : (
              <div className="flex gap-2 mt-1">
                <Button
                  variante="primario"
                  className="!h-9 text-xs"
                  onClick={() => setSheetEntrada(true)}
                  icone={<Plus className="size-4" />}
                >
                  + Entrada
                </Button>
                <Button
                  variante="perigo"
                  className="!h-9 text-xs"
                  onClick={() => setSheetSaida(true)}
                  icone={<Minus className="size-4" />}
                >
                  − Saída
                </Button>
              </div>
            )}
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
