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
  RotateCcw,
  CheckSquare,
  ShieldAlert,
  Coffee,
  Play,
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Estados';
import { useAuth } from '@/features/auth/AuthContext';
import {
  useDiaAtual,
  useResumoDia,
  useUltimoDiaFechado,
  useReabrirDia,
  usePausarDia,
  useRetomarDia,
  estaEmPausa,
  calcularMinutosPausa,
} from '@/features/dia/api';
import { useSaldoPrincipal, useSaldoManutencao } from '@/features/caixa/api';
import { useLancamentosDia } from '@/features/lancamentos/api';
import { usePrioridades } from '@/features/prioridades/api';
import {
  useGamificacaoUsuario,
  useMetas,
  useCiclosMetas,
} from '@/features/metas/api';
import { Medalha } from '@/components/gamificacao/Medalha';
import { Star, Target } from 'lucide-react';
import { AbrirDiaSheet } from '@/features/dia/AbrirDiaSheet';
import { FecharDiaSheet } from '@/features/dia/FecharDiaSheet';
import { EntradaRapidaSheet } from '@/features/lancamentos/EntradaRapidaSheet';
import { SaidaRapidaSheet } from '@/features/lancamentos/SaidaRapidaSheet';
import { ListaLancamentosDia } from '@/features/lancamentos/ListaLancamentosDia';
import { formatarMoeda } from '@/lib/money';
import { formatarDataCurta } from '@/lib/datas';
import { traduzirErro } from '@/lib/erros';
import { toast } from '@/components/ui/Toast';
import { textos } from '@/lib/textos';

export function InicioPage() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const { data: diaAtual, isLoading: carregandoDia } = useDiaAtual();
  const { data: resumoDia } = useResumoDia(diaAtual?.id);
  const { data: ultimoFechado } = useUltimoDiaFechado();
  const { data: prioridades = [] } = usePrioridades();
  const { mutateAsync: reabrirDia, isPending: reabrindoDia } = useReabrirDia();
  const { mutateAsync: pausarDia, isPending: pausandoDia } = usePausarDia();
  const { mutateAsync: retomarDia, isPending: retomandoDia } = useRetomarDia();

  const { saldoCentavos: caixaAtual, isLoading: carregandoSaldo } = useSaldoPrincipal();
  const { saldoCentavos: saldoReserva } = useSaldoManutencao();
  const { data: lancamentos = [], isLoading: carregandoLancamentos } = useLancamentosDia(diaAtual?.id);

  const emPausa = estaEmPausa(diaAtual);
  const minutosPausa = calcularMinutosPausa(diaAtual);

  const handlePausar = async () => {
    if (!diaAtual?.id) return;
    try {
      await pausarDia({ diaId: diaAtual.id, motivo: 'intervalo' });
      toast.info('Dia pausado para intervalo. Bom descanso!');
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  const handleRetomar = async () => {
    if (!diaAtual?.id) return;
    try {
      await retomarDia({ diaId: diaAtual.id });
      toast.sucesso('Rodagem retomada! Boas corridas!');
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  // Gamificação e Metas (Fase 5)
  const { data: gamificacao } = useGamificacaoUsuario();
  const { data: metas = [] } = useMetas();
  const { data: ciclos = [] } = useCiclosMetas();

  const metaDiaria = metas.find((m) => m.periodo === 'diaria');
  const cicloDiario = metaDiaria ? ciclos.find((c) => c.meta_id === metaDiaria.id) : null;

  const alvoDiario = metaDiaria?.valor_alvo ?? 30000;
  const alcancadoDiario = cicloDiario?.valor_alcancado ?? 0;
  const pctMetaDiaria = Math.min(150, Math.round((alcancadoDiario / Math.max(1, alvoDiario)) * 100));
  const medalhaDiaria = cicloDiario?.nivel_atual ?? 'nenhum';

  // Sheets de controle
  const [sheetAbrirDia, setSheetAbrirDia] = useState<boolean>(false);
  const [sheetFecharDia, setSheetFecharDia] = useState<boolean>(false);
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
      {/* Barra superior de status do motorista & Gamificação */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-md bg-bg-2 border border-line">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/conquistas')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-laranja-500/15 border border-laranja-500/30 text-laranja-400 hover:bg-laranja-500/25 transition-all text-xs font-black cursor-pointer shadow-sm"
            title="Ver sequência e conquistas"
          >
            <Flame className="size-3.5 fill-laranja-500 text-laranja-500 animate-pulse" />
            <span>{gamificacao?.sequencia_atual ?? 0} dias</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/conquistas')}
            className="flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-all text-xs font-bold cursor-pointer"
            title="Total de estrelas"
          >
            <Star className="size-3.5 fill-amber-400" />
            <span>{gamificacao?.estrelas_totais ?? 0}</span>
          </button>
          <span className="text-xs font-semibold text-texto-2 hidden sm:inline ml-1">
            Olá, {profile?.nome || 'Motorista'}!
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-bold text-texto-2">
          <span className={emPausa ? 'text-amber-400 font-extrabold flex items-center gap-1' : 'text-laranja-400'}>
            {!temDiaAberto ? '⚪ Dia Fechado' : emPausa ? '☕ Em Intervalo' : '🟢 Dia Aberto'}
          </span>
        </div>
      </div>

      {temDiaAberto ? (
        <>
          {/* Card de Dia em Pausa / Intervalo */}
          {emPausa && (
            <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/40 text-texto-1 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-pulse">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
                  <Coffee className="size-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-amber-400">Jornada em Intervalo / Pausa</h4>
                  <p className="text-xs text-texto-2">
                    Aproveite seu descanso ou almoço. Total acumulado em pausas hoje: <strong className="text-texto-1">{minutosPausa} min</strong>.
                  </p>
                </div>
              </div>
              <Button
                variante="primario"
                tamanho="md"
                icone={<Play className="size-4 fill-white" />}
                onClick={handleRetomar}
                carregando={retomandoDia}
                className="w-full sm:w-auto shrink-0 shadow-neon font-bold"
              >
                Retomar Rodagem
              </Button>
            </div>
          )}
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

          {/* Card Compacto de Meta Diária (Fase 5) */}
          <Card
            className="p-4 bg-bg-2 border-line/60 hover:border-laranja-500/40 transition-all cursor-pointer space-y-3"
            onClick={() => navigate('/metas')}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-laranja-400" />
                <h3 className="font-bold text-sm text-texto-1">Meta do Dia</h3>
              </div>
              <div className="flex items-center gap-2">
                <Medalha nivel={medalhaDiaria} tamanho="sm" />
                <span className="text-xs font-bold text-laranja-400 hover:underline flex items-center gap-0.5">
                  Ver detalhes <ChevronRight className="size-3.5" />
                </span>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-texto-3">
                  Progresso: <strong className="text-texto-1 font-mono">{formatarMoeda(alcancadoDiario)}</strong> / {formatarMoeda(alvoDiario)}
                </span>
                <span className="font-mono font-bold text-laranja-400">{pctMetaDiaria}%</span>
              </div>

              <div className="h-2 w-full bg-bg-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-laranja-500 to-amber-400 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pctMetaDiaria)}%` }}
                />
              </div>
            </div>
          </Card>

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

          {/* Card de Próximas Contas / Prioridades */}
          {prioridades.filter((p) => p.status === 'pendente').length > 0 && (
            <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-laranja-400" />
                  <h3 className="font-bold text-sm text-texto-1">Próximas Contas</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/prioridades')}
                  className="text-xs font-bold text-laranja-400 hover:underline flex items-center gap-1"
                >
                  Ver todas <ChevronRight className="size-3.5" />
                </button>
              </div>

              <div className="divide-y divide-line/40 text-xs">
                {prioridades
                  .filter((p) => p.status === 'pendente')
                  .slice(0, 3)
                  .map((conta) => {
                    const hojeISO = new Date().toISOString().slice(0, 10);
                    const vencida = conta.vencimento < hojeISO;
                    return (
                      <div key={conta.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {vencida && <ShieldAlert className="size-3.5 text-negativo" />}
                          <span className={`font-semibold ${vencida ? 'text-negativo' : 'text-texto-1'}`}>
                            {conta.titulo}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-texto-3">
                            {formatarDataCurta(new Date(conta.vencimento + 'T12:00:00'))}
                          </span>
                          <span className="font-mono font-bold text-texto-1">
                            {formatarMoeda(conta.valor_centavos)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          )}

          {/* Ações de Fechamento ou Pausa da Jornada */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {!emPausa ? (
              <Button
                variante="secundario"
                tamanho="lg"
                icone={<Coffee className="size-4 text-amber-400" />}
                onClick={handlePausar}
                carregando={pausandoDia}
                className="font-bold border-line/80 hover:border-amber-500/50"
              >
                PAUSAR DIA (INTERVALO)
              </Button>
            ) : (
              <Button
                variante="primario"
                tamanho="lg"
                icone={<Play className="size-4 fill-white" />}
                onClick={handleRetomar}
                carregando={retomandoDia}
                className="shadow-neon font-bold"
              >
                RETOMAR RODAGEM
              </Button>
            )}

            <Button
              variante="secundario"
              tamanho="lg"
              onClick={() => setSheetFecharDia(true)}
            >
              FECHAR O DIA
            </Button>
          </div>
        </>
      ) : (
        /* Estado com dia fechado / Pronto para Bater Ponto */
        <div className="space-y-4">
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

          {/* Opção de Reabrir Último Dia (se fechou recentemente) */}
          {ultimoFechado && (
            <Card className="p-4 bg-bg-2 border-line/60 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-texto-2 flex items-center gap-1.5">
                  <RotateCcw className="size-3.5 text-laranja-400" />
                  Último dia fechado ({ultimoFechado.data_referencia})
                </span>
                <p className="text-[11px] text-texto-3">
                  Fechou por engano ou esqueceu uma corrida? Você pode reabrir.
                </p>
              </div>
              <Button
                variante="fantasma"
                className="text-xs h-8 px-2.5"
                carregando={reabrindoDia}
                onClick={async () => {
                  if (confirm(`Deseja reabrir o dia de ${ultimoFechado.data_referencia}?`)) {
                    try {
                      await reabrirDia(ultimoFechado.id);
                      toast.sucesso('Dia reaberto com sucesso!');
                    } catch (err) {
                      toast.erro(traduzirErro(err));
                    }
                  }
                }}
              >
                Reabrir Dia
              </Button>
            </Card>
          )}

          {/* Próximas Contas também visíveis com dia fechado */}
          {prioridades.filter((p) => p.status === 'pendente').length > 0 && (
            <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="size-4 text-laranja-400" />
                  <h3 className="font-bold text-sm text-texto-1">Contas Pendentes</h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/prioridades')}
                  className="text-xs font-bold text-laranja-400 hover:underline flex items-center gap-1"
                >
                  Ver todas <ChevronRight className="size-3.5" />
                </button>
              </div>

              <div className="divide-y divide-line/40 text-xs">
                {prioridades
                  .filter((p) => p.status === 'pendente')
                  .slice(0, 3)
                  .map((conta) => {
                    const hojeISO = new Date().toISOString().slice(0, 10);
                    const vencida = conta.vencimento < hojeISO;
                    return (
                      <div key={conta.id} className="py-2 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {vencida && <ShieldAlert className="size-3.5 text-negativo" />}
                          <span className={`font-semibold ${vencida ? 'text-negativo' : 'text-texto-1'}`}>
                            {conta.titulo}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-texto-3">
                            {formatarDataCurta(new Date(conta.vencimento + 'T12:00:00'))}
                          </span>
                          <span className="font-mono font-bold text-texto-1">
                            {formatarMoeda(conta.valor_centavos)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* Sheets Funcionais da Fase 3 e Fase 4 */}
      <AbrirDiaSheet
        aberto={sheetAbrirDia}
        aoFechar={() => setSheetAbrirDia(false)}
      />

      {diaAtual && (
        <FecharDiaSheet
          aberto={sheetFecharDia}
          aoFechar={() => setSheetFecharDia(false)}
          diaAtual={diaAtual}
        />
      )}

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
