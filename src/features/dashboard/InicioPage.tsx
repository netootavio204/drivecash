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
} from 'lucide-react';
import { Card, StatCard } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Estados';
import { useAuth } from '@/features/auth/AuthContext';
import {
  useDiaAtual,
  useResumoDia,
  useResumoDiaV2,
  useUltimoDiaFechado,
  useReabrirDia,
} from '@/features/dia/api';
import { useSaldoPrincipal } from '@/features/caixa/api';
import { useLancamentosDia } from '@/features/lancamentos/api';
import { usePrioridades } from '@/features/prioridades/api';
import {
  useGamificacaoUsuario,
  useMetas,
  useCiclosMetas,
} from '@/features/metas/api';
import { Star, Target } from 'lucide-react';
import { TopoAcoesRapidas } from '@/components/layout/TopoAcoesRapidas';
import { BarraMetaV2 } from '@/features/metas/BarraMetaV2';
import { CartoesSaldoLocais } from '@/features/locais/CartoesSaldoLocais';
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
  const { data: resumoV2 } = useResumoDiaV2(diaAtual?.id);
  const { data: ultimoFechado } = useUltimoDiaFechado();
  const { data: prioridades = [] } = usePrioridades();
  const { mutateAsync: reabrirDia, isPending: reabrindoDia } = useReabrirDia();

  const { saldoCentavos: caixaAtual, isLoading: carregandoSaldo } = useSaldoPrincipal();
  const { data: lancamentos = [], isLoading: carregandoLancamentos } = useLancamentosDia(diaAtual?.id);

  // Gamificação e Metas (Fase 5)
  const { data: gamificacao } = useGamificacaoUsuario();
  const { data: metas = [] } = useMetas();
  const { data: ciclos = [] } = useCiclosMetas();

  const metaDiaria = metas.find((m) => m.periodo === 'diaria');
  const cicloDiario = metaDiaria ? ciclos.find((c) => c.meta_id === metaDiaria.id) : null;

  const metaSemanal = metas.find((m) => m.periodo === 'semanal');
  const cicloSemanal = metaSemanal ? ciclos.find((c) => c.meta_id === metaSemanal.id) : null;

  const metaMensal = metas.find((m) => m.periodo === 'mensal');
  const cicloMensal = metaMensal ? ciclos.find((c) => c.meta_id === metaMensal.id) : null;

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

  // Cálculos de resumo V2
  const ganhoBruto = resumoV2 ? Number(resumoV2.ganho_bruto_centavos) : resumoDia ? Number(resumoDia.receita_centavos) : 0;
  const totalTaxas = resumoV2 ? Number(resumoV2.taxas_total_centavos) : 0;
  const taxaEfetivaPct = resumoV2 ? Number(resumoV2.taxa_efetiva_pct) : 0;
  const ganhoLiquido = resumoV2 ? Number(resumoV2.ganho_liquido_centavos) : ganhoBruto;
  const despesas = resumoV2 ? Number(resumoV2.despesas_operacionais_centavos) : resumoDia ? Number(resumoDia.despesas_centavos) : 0;
  const lucro = resumoV2 ? Number(resumoV2.lucro_liquido_centavos) : ganhoBruto - despesas;

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
      {/* Barra de Ações Rápidas Fixa no Topo (DriveCash V2) */}
      <TopoAcoesRapidas
        diaAtual={diaAtual ?? null}
        aoAbrirDia={() => setSheetAbrirDia(true)}
        aoFecharDia={() => setSheetFecharDia(true)}
      />

      {/* Barra de status de gamificação do motorista */}
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
        <button
          type="button"
          onClick={() => navigate('/metas')}
          className="text-xs font-bold text-laranja-400 hover:underline flex items-center gap-1"
        >
          <Target className="size-3.5" />
          <span>Ver Metas</span>
        </button>
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

          {/* Cartões de Saldo por Local (Bolso, App 99, Bancos) — DriveCash V2 */}
          <CartoesSaldoLocais />

          {/* Indicadores do dia em grade — DriveCash V2 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard rotulo="Ganho Bruto" centavos={ganhoBruto} tom="positivo" />
            <StatCard
              rotulo={taxaEfetivaPct > 0 ? `Taxas (${taxaEfetivaPct.toFixed(1)}%)` : "Taxas Plataforma"}
              centavos={totalTaxas}
              tom="negativo"
            />
            <StatCard rotulo="Ganho Líquido" centavos={ganhoLiquido} tom="marca" />
            <StatCard rotulo="Lucro Líquido" centavos={lucro} tom="positivo" />
          </div>

          {/* Card das 3 Metas Compactas (Dia, Semana, Mês) — DriveCash V2 */}
          <Card
            className="p-4 bg-bg-2 border-line/60 hover:border-laranja-500/40 transition-all cursor-pointer space-y-3.5 shadow-sm"
            onClick={() => navigate('/metas')}
          >
            <div className="flex items-center justify-between border-b border-line/40 pb-2">
              <div className="flex items-center gap-2">
                <Target className="size-4 text-laranja-400" />
                <h3 className="font-bold text-sm text-texto-1">Seu Progresso de Metas</h3>
              </div>
              <span className="text-xs font-bold text-laranja-400 hover:underline flex items-center gap-0.5">
                Ver detalhes <ChevronRight className="size-3.5" />
              </span>
            </div>

            <div className="space-y-3">
              {/* Meta Diária */}
              <BarraMetaV2
                titulo="Meta do Dia"
                valorAlvo={metaDiaria?.valor_alvo ?? 30000}
                valorAlcancado={cicloDiario?.valor_alcancado ?? 0}
                pctBronze={metaDiaria?.pct_bronze ?? 70}
                pctPrata={metaDiaria?.pct_prata ?? 100}
                pctOuro={metaDiaria?.pct_ouro ?? 130}
                compacto
              />

              {/* Meta Semanal */}
              <BarraMetaV2
                titulo="Meta da Semana"
                valorAlvo={metaSemanal?.valor_alvo ?? 180000}
                valorAlcancado={cicloSemanal?.valor_alcancado ?? 0}
                pctBronze={metaSemanal?.pct_bronze ?? 70}
                pctPrata={metaSemanal?.pct_prata ?? 100}
                pctOuro={metaSemanal?.pct_ouro ?? 130}
                compacto
              />

              {/* Meta Mensal */}
              <BarraMetaV2
                titulo="Meta do Mês"
                valorAlvo={metaMensal?.valor_alvo ?? 750000}
                valorAlcancado={cicloMensal?.valor_alcancado ?? 0}
                pctBronze={metaMensal?.pct_bronze ?? 70}
                pctPrata={metaMensal?.pct_prata ?? 100}
                pctOuro={metaMensal?.pct_ouro ?? 130}
                compacto
              />
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

          {/* Cartões de Saldo por Local (Bolso, App 99, Bancos) — DriveCash V2 */}
          <CartoesSaldoLocais />

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
