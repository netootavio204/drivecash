import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Clock,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  ChevronRight,
  AlertTriangle,
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Estados';
import { useAuth } from '@/features/auth/AuthContext';
import { useDiaAtual, useResumoDia } from '@/features/dia/api';
import { useSaldoPrincipal, useSaldoManutencao } from '@/features/caixa/api';
import { useLancamentosDia } from '@/features/lancamentos/api';
import { AbrirDiaSheet } from '@/features/dia/AbrirDiaSheet';
import { EntradaRapidaSheet } from '@/features/lancamentos/EntradaRapidaSheet';
import { SaidaRapidaSheet } from '@/features/lancamentos/SaidaRapidaSheet';
import { ListaLancamentosDia } from '@/features/lancamentos/ListaLancamentosDia';
import { formatarMoeda } from '@/lib/money';
import { textos } from '@/lib/textos';

export function InicioPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: diaAtual, isLoading: carregandoDia } = useDiaAtual();
  const { data: resumoDia } = useResumoDia(diaAtual?.id);
  const { saldoCentavos: caixaAtual, isLoading: carregandoSaldo } = useSaldoPrincipal();
  const { saldoCentavos: saldoReserva } = useSaldoManutencao();
  const { data: lancamentos = [], isLoading: carregandoLancamentos } = useLancamentosDia(diaAtual?.id);

  // Sheets de controle
  const [sheetAbrirDia, setSheetAbrirDia] = useState<boolean>(false);
  const [sheetEntrada, setSheetEntrada] = useState<boolean>(false);
  const [sheetSaida, setSheetSaida] = useState<boolean>(false);

  const temDiaAberto = !!diaAtual;
  const caixaNegativo = caixaAtual < 0;

  // Horário de abertura
  const horarioAbertura = diaAtual
    ? new Date(diaAtual.aberto_em).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  // Cálculos de resumo
  const receita = resumoDia ? Number(resumoDia.receita_centavos) : 0;
  const despesas = resumoDia ? Number(resumoDia.despesas_centavos) : 0;
  const lucro = receita - despesas;

  if (carregandoDia && carregandoSaldo) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-14 w-full rounded-md" />
        <Skeleton className="h-48 w-full rounded-md" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
          <Skeleton className="h-24 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Barra superior de status do motorista */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-bg-2 border border-line">
        <div className="flex items-center gap-2">
          <Badge tom="marca" className="gap-1.5 py-1">
            <Flame className="size-3.5 fill-laranja-500 text-laranja-500" />
            <span>Ritmo diário</span>
          </Badge>
          <span className="text-sm font-semibold text-texto-2 hidden sm:inline">
            Olá, {profile?.nome || 'Motorista'}!
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-texto-2">
          <span className="text-laranja-400">
            {temDiaAberto ? '🟢 Dia Aberto' : '⚪ Dia Fechado'}
          </span>
        </div>
      </div>

      {temDiaAberto ? (
        <>
          {/* Alerta Discreto de Caixa Negativo (se houver) */}
          {caixaNegativo && (
            <div className="p-3 rounded-md bg-negativo/15 border border-negativo/40 text-negativo text-xs flex items-center justify-between gap-2 shadow-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="size-4 shrink-0" />
                <span>
                  Seu caixa ficou negativo em <strong>{formatarMoeda(caixaAtual)}</strong>. Falta lançar alguma entrada?
                </span>
              </div>
              <Button
                variante="primario"
                className="text-[11px] h-7 px-2.5 shrink-0"
                onClick={() => setSheetEntrada(true)}
              >
                + Entrada
              </Button>
            </div>
          )}

          {/* Card Principal: CAIXA ATUAL */}
          <Card variante="destaque" className="relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-texto-3">CAIXA ATUAL</p>
                <div
                  aria-live="polite"
                  className={`numero text-3xl sm:text-4xl lg:text-5xl font-extrabold mt-1 tracking-tight ${
                    caixaNegativo ? 'text-negativo' : 'text-texto-1'
                  }`}
                >
                  {formatarMoeda(caixaAtual)}
                </div>
                <p className="text-xs text-texto-2 mt-2 flex items-center gap-1.5 font-medium">
                  <Clock className="size-3.5 text-laranja-400" />
                  Aberto às {horarioAbertura} • Data: {diaAtual.data_referencia}
                  {diaAtual.km_inicial && ` • Km inicial: ${diaAtual.km_inicial}`}
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span
                  className={`numero text-sm font-bold flex items-center gap-1 px-3 py-1.5 rounded-full border ${
                    lucro >= 0
                      ? 'text-positivo bg-positivo/10 border-positivo/20'
                      : 'text-negativo bg-negativo/10 border-negativo/20'
                  }`}
                >
                  <TrendingUp className="size-4" /> {lucro >= 0 ? '+' : '−'}
                  {formatarMoeda(Math.abs(lucro))} hoje
                </span>
              </div>
            </div>

            {/* Ações Rápidas: + ENTRADA e − SAÍDA */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-line/60">
              <Button
                variante="primario"
                tamanho="lg"
                icone={<ArrowUpRight className="text-white" />}
                onClick={() => setSheetEntrada(true)}
              >
                + ENTRADA
              </Button>
              <Button
                variante="secundario"
                tamanho="lg"
                icone={<ArrowDownLeft className="text-negativo" />}
                onClick={() => setSheetSaida(true)}
              >
                − SAÍDA
              </Button>
            </div>
          </Card>

          {/* Indicadores do dia em grade */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard rotulo="Receita Bruta" centavos={receita} tom="positivo" />
            <StatCard rotulo="Despesas" centavos={despesas} tom="negativo" />
            <StatCard rotulo="Lucro Líquido" centavos={lucro} tom="marca" />
            <StatCard rotulo="Reserva Manut." centavos={saldoReserva} tom="neutro" />
          </div>

          {/* Lançamentos do dia */}
          <Card className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-texto-1">Lançamentos de hoje</h3>
              <button
                type="button"
                onClick={() => navigate('/caixa')}
                className="text-xs font-bold text-laranja-400 hover:underline flex items-center gap-1"
              >
                Ver extrato completo <ChevronRight className="size-3.5" />
              </button>
            </div>

            <ListaLancamentosDia
              lancamentos={lancamentos}
              carregando={carregandoLancamentos}
            />
          </Card>

          {/* Atalho para Fechar o Dia */}
          <div className="pt-2">
            <Button
              variante="secundario"
              tamanho="lg"
              bloco
              onClick={() => navigate('/dia/fechar')}
            >
              FECHAR O DIA
            </Button>
          </div>
        </>
      ) : (
        /* Estado com dia fechado / Pronto para Bater Ponto */
        <Card variante="destaque" className="text-center py-10 space-y-4 shadow-neon">
          <div className="size-16 rounded-2xl bg-gradient-to-tr from-vermelho-500/20 to-laranja-500/20 border border-laranja-500/40 grid place-items-center text-laranja-400 mx-auto">
            <Clock className="size-8" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-texto-1">{textos.dia.abrirTitulo}</h2>
            <p className="text-sm text-texto-2">
              Seu caixa acumulado atual: <strong className="text-texto-1 numero">{formatarMoeda(caixaAtual)}</strong>
            </p>
          </div>
          <div className="pt-2 max-w-sm mx-auto">
            <Button
              variante="primario"
              tamanho="lg"
              bloco
              className="shadow-neon"
              onClick={() => setSheetAbrirDia(true)}
            >
              {textos.dia.abrirBotao}
            </Button>
          </div>
        </Card>
      )}

      {/* Sheets Funcionais da Fase 3 */}
      <AbrirDiaSheet
        aberto={sheetAbrirDia}
        aoFechar={() => setSheetAbrirDia(false)}
      />

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
}
