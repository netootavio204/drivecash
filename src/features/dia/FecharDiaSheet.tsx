import React, { useState, useMemo } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import {
  useFecharDiaV2,
  useResumoDiaV2,
  useLotePlataformas,
  calcularMinutosPausa,
  type DiaTrabalho,
} from './api';
import { useLocaisDinheiro } from '@/features/locais/api';
import { useSaldoPrincipal, useConfiguracaoManutencao } from '@/features/caixa/api';
import { usePlataformas, useCategorias } from '@/features/lancamentos/api';
import { formatarMoeda } from '@/lib/money';
import { traduzirErro } from '@/lib/erros';
import { toast } from '@/components/ui/Toast';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Coins,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Check,
  Wallet,
  Smartphone,
  Building2,
  Clock,
  Gauge,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FecharDiaSheetProps {
  aberto: boolean;
  aoFechar: () => void;
  diaAtual: DiaTrabalho;
}

export const FecharDiaSheet: React.FC<FecharDiaSheetProps> = ({ aberto, aoFechar, diaAtual }) => {
  const [passo, setPasso] = useState<1 | 2 | 3 | 4>(1);

  // APIs V2
  const { data: resumoV2 } = useResumoDiaV2(diaAtual.id);
  const { data: locais = [] } = useLocaisDinheiro();
  const { saldoCentavos: saldoPrincipal, caixaId: caixaPrincipalId } = useSaldoPrincipal();
  const { data: configManutencao } = useConfiguracaoManutencao();
  const { data: plataformas } = usePlataformas();
  const { data: categoriasEntrada } = useCategorias('entrada');

  const { mutateAsync: fecharDiaV2, isPending: fechandoDia } = useFecharDiaV2();
  const { mutateAsync: salvarLote, isPending: salvandoLote } = useLotePlataformas();

  // Passo 1: Lote por plataforma
  const [valoresPlataforma, setValoresPlataforma] = useState<Record<string, { valor: number; corridas: number }>>({});
  const [modalLoteAberto, setModalLoteAberto] = useState(false);
  const [modoLote, setModoLote] = useState<'somar' | 'substituir'>('somar');

  // Passo 2: Odômetro, Horas e Conferência por Local (V2)
  const minutosPausa = useMemo(() => calcularMinutosPausa(diaAtual), [diaAtual]);
  const [kmFinal, setKmFinal] = useState<string>('');
  const [horasTrabalhadas, setHorasTrabalhadas] = useState<string>('');
  const [saldosInformados, setSaldosInformados] = useState<Record<string, number | null>>({});
  const [outrosLocaisAbertos, setOutrosLocaisAbertos] = useState(false);
  const [conferenciaBolsoPulada, setConferenciaBolsoPulada] = useState<boolean>(false);

  // Pré-calcula horas trabalhadas descontando as pausas automaticamente
  React.useEffect(() => {
    if (diaAtual?.aberto_em && !horasTrabalhadas) {
      const inicio = new Date(diaAtual.aberto_em).getTime();
      const agora = Date.now();
      const totalBrutoMinutos = Math.max(0, Math.round((agora - inicio) / 60000));
      const totalLiquidoMinutos = Math.max(0, totalBrutoMinutos - minutosPausa);
      const horas = (totalLiquidoMinutos / 60).toFixed(1);
      setHorasTrabalhadas(horas);
    }
  }, [diaAtual, minutosPausa]);

  // Passo 3: Depósito na Reserva de Manutenção
  const valorPadraoManutencao = configManutencao?.deposito_manutencao_centavos ?? 2000;
  const [depositoManutencaoCentavos, setDepositoManutencaoCentavos] = useState<number>(valorPadraoManutencao);
  const [manutencaoPulada, setManutencaoPulada] = useState<boolean>(false);

  // Passo 4: Observações e Erros
  const [observacoes, setObservacoes] = useState<string>('');
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Métricas financeiras V2
  const ganhoBruto = Number(resumoV2?.ganho_bruto_centavos ?? 0);
  const totalTaxas = Number(resumoV2?.taxas_total_centavos ?? 0);
  const taxaPlataforma = Number(resumoV2?.taxa_plataforma_centavos ?? 0);
  const taxaMaquininha = Number(resumoV2?.taxa_maquininha_centavos ?? 0);
  const ganhoLiquido = Number(resumoV2?.ganho_liquido_centavos ?? (ganhoBruto - totalTaxas));
  const taxaEfetivaPct = Number(resumoV2?.taxa_efetiva_pct ?? 0);
  const despesasOperacionais = Number(resumoV2?.despesas_operacionais_centavos ?? 0);
  const lucroCalculado = Number(resumoV2?.lucro_liquido_centavos ?? (ganhoLiquido - despesasOperacionais));
  const totalCorridas = Number(resumoV2?.corridas ?? 0);

  // Métricas de Rendimento
  const kmPercorrido = useMemo(() => {
    if (!kmFinal.trim() || diaAtual.km_inicial === null) return null;
    const final = parseInt(kmFinal, 10);
    if (isNaN(final) || final < diaAtual.km_inicial) return null;
    return final - diaAtual.km_inicial;
  }, [kmFinal, diaAtual.km_inicial]);

  const horasLiquidasNum = useMemo(() => {
    const parsed = parseFloat(horasTrabalhadas);
    return isNaN(parsed) || parsed <= 0 ? null : parsed;
  }, [horasTrabalhadas]);

  const ganhoPorHoraLiquido = useMemo(() => {
    if (!horasLiquidasNum || horasLiquidasNum <= 0) return null;
    return Math.round(ganhoLiquido / horasLiquidasNum);
  }, [ganhoLiquido, horasLiquidasNum]);

  const lucroPorKm = useMemo(() => {
    if (!kmPercorrido || kmPercorrido <= 0) return null;
    return Math.round(lucroCalculado / kmPercorrido);
  }, [lucroCalculado, kmPercorrido]);

  // Local Bolso (dinheiro físico)
  const localBolso = useMemo(() => locais.find((l) => l.tipo === 'bolso'), [locais]);
  const saldoBolsoCalculado = localBolso?.saldo_centavos ?? 0;
  const saldoBolsoInformado = saldosInformados[localBolso?.id ?? ''];

  const difBolso = useMemo(() => {
    if (conferenciaBolsoPulada || saldoBolsoInformado === undefined || saldoBolsoInformado === null) return 0;
    return saldoBolsoInformado - saldoBolsoCalculado;
  }, [conferenciaBolsoPulada, saldoBolsoInformado, saldoBolsoCalculado]);

  // Outros locais
  const outrosLocais = useMemo(() => locais.filter((l) => l.tipo !== 'bolso'), [locais]);

  // Saldo final previsto
  const saldoFinalPrevisto = useMemo(() => {
    const base = saldoPrincipal;
    const deposito = manutencaoPulada ? 0 : depositoManutencaoCentavos;
    return base - deposito;
  }, [saldoPrincipal, manutencaoPulada, depositoManutencaoCentavos]);

  // Aplicar lançamento em lote
  const handleAplicarLote = async () => {
    if (!caixaPrincipalId) return;

    const catCorridas = categoriasEntrada?.find((c) => c.nome.toLowerCase().includes('corrida')) || categoriasEntrada?.[0];
    const itens = Object.entries(valoresPlataforma).map(([platId, info]) => ({
      plataformaId: platId,
      valorCentavos: info.valor,
      qtdCorridas: info.corridas,
    })).filter((i) => i.valorCentavos > 0);

    if (itens.length === 0) {
      setModalLoteAberto(false);
      return;
    }

    try {
      await salvarLote({
        diaId: diaAtual.id,
        caixaId: caixaPrincipalId,
        categoriaId: catCorridas?.id || null,
        modo: modoLote,
        itens,
      });
      toast.sucesso('Valores por plataforma atualizados!');
      setModalLoteAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  // Submeter Fechamento Definitivo V2
  const handleConfirmarFechamento = async () => {
    setErroMsg(null);
    try {
      const kmNum = kmFinal.trim() ? parseInt(kmFinal, 10) : null;
      const minutosNum = horasTrabalhadas.trim() ? Math.round(parseFloat(horasTrabalhadas) * 60) : null;
      const depositoInf = manutencaoPulada ? 0 : depositoManutencaoCentavos;

      // Monta lista de conferências por local
      const conferenciaLocais = Object.entries(saldosInformados)
        .filter(([_, val]) => val !== null && val !== undefined)
        .map(([localId, saldoInf]) => ({
          local_id: localId,
          saldo_informado_centavos: saldoInf,
        }));

      await fecharDiaV2({
        diaId: diaAtual.id,
        kmFinal: kmNum,
        minutosOnline: minutosNum,
        depositoManutencaoCentavos: depositoInf,
        conferenciaLocais,
        observacoes: observacoes.trim() || null,
      });

      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast.sucesso('Dia fechado com sucesso!');
      aoFechar();
    } catch (err) {
      console.error('[DriveCash] Erro ao fechar dia:', err);
      setErroMsg(traduzirErro(err));
    }
  };

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Fechar o Dia de Trabalho"
      descricao={`Passo ${passo} de 4 — ${
        passo === 1
          ? 'Resumo de Faturamento e Taxas'
          : passo === 2
          ? 'Odômetro e Conferência por Local'
          : passo === 3
          ? 'Reserva de Manutenção'
          : 'Confirmação e Fechamento V2'
      }`}
    >
      <div className="space-y-6">
        {/* Barra de Progresso do Fechamento */}
        <div className="grid grid-cols-4 gap-1.5">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i <= passo ? 'bg-laranja-500 shadow-[0_0_8px_rgba(255,122,0,0.5)]' : 'bg-bg-3'
              }`}
            />
          ))}
        </div>

        {erroMsg && (
          <div className="p-3 bg-negativo/15 border border-negativo/30 rounded-md text-negativo text-xs flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* PASSO 1: Resumo do Dia e Taxas (DriveCash V2) */}
        {passo === 1 && (
          <div className="space-y-4">
            {/* Grade com Faturamento Bruto e Taxas */}
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3.5 bg-bg-2 border-line/60">
                <span className="text-xs text-texto-3">Ganho Bruto</span>
                <p className="text-lg font-black text-positivo font-mono">
                  {formatarMoeda(ganhoBruto)}
                </p>
                <span className="text-[11px] text-texto-3">
                  {totalCorridas} {totalCorridas === 1 ? 'corrida' : 'corridas'}
                </span>
              </Card>

              <Card className="p-3.5 bg-bg-2 border-line/60">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-texto-3">Total de Taxas</span>
                  {taxaEfetivaPct > 0 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
                      {taxaEfetivaPct.toFixed(1)}%
                    </span>
                  )}
                </div>
                <p className="text-lg font-black text-amber-400 font-mono">
                  {formatarMoeda(totalTaxas)}
                </p>
                <span className="text-[11px] text-texto-3 truncate block">
                  {totalTaxas > 0
                    ? `99: ${formatarMoeda(taxaPlataforma)}${taxaMaquininha > 0 ? ` • Maq: ${formatarMoeda(taxaMaquininha)}` : ''}`
                    : 'Sem taxas registradas'}
                </span>
              </Card>
            </div>

            {/* Destaque do Ganho Líquido */}
            <Card className="p-4 bg-emerald-500/10 border-emerald-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-400">Ganho Líquido (após taxas)</span>
                <p className="text-2xl font-black text-texto-1 font-mono">
                  {formatarMoeda(ganhoLiquido)}
                </p>
                {despesasOperacionais > 0 && (
                  <span className="text-[11px] text-texto-3 block mt-0.5">
                    Despesas do dia: {formatarMoeda(despesasOperacionais)} • Lucro final: {formatarMoeda(lucroCalculado)}
                  </span>
                )}
              </div>
              <TrendingUp className="size-8 text-emerald-400/80" />
            </Card>

            {/* Atalho de Lançamento em Lote */}
            <div className="pt-2">
              <Button
                variante="secundario"
                className="w-full justify-between px-3.5 py-2.5 text-xs sm:text-sm font-bold min-h-[44px]"
                onClick={() => setModalLoteAberto(true)}
                icone={<Coins className="size-4 shrink-0" />}
                iconeDireita={<ChevronRight className="size-4 shrink-0" />}
              >
                <span className="truncate flex-1 text-center sm:text-left">
                  Conferir / Lançar por plataforma
                </span>
              </Button>
              <p className="text-[11px] text-texto-3 mt-1.5 text-center">
                Deseja lançar os ganhos de Uber, 99 ou Táxi de uma só vez? Toque acima.
              </p>
            </div>

            <div className="pt-6 pb-2 flex gap-3">
              <Button variante="fantasma" className="flex-1" onClick={aoFechar}>
                Cancelar
              </Button>
              <Button
                variante="primario"
                className="flex-1"
                onClick={() => setPasso(2)}
                iconeDireita={<ArrowRight className="size-4" />}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 2: Odômetro e Conferência por Local (DriveCash V2) */}
        {passo === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Input
                rotulo="Km final no odômetro"
                type="number"
                placeholder={diaAtual.km_inicial ? `Ex: ${diaAtual.km_inicial + 120}` : 'Ex: 125430'}
                value={kmFinal}
                onChange={(e) => setKmFinal(e.target.value)}
                dica={
                  kmPercorrido !== null
                    ? `🚗 ${kmPercorrido} km rodados`
                    : diaAtual.km_inicial
                    ? `Inicial: ${diaAtual.km_inicial} km`
                    : 'Opcional (pode pular)'
                }
              />

              <Input
                rotulo="Horas trabalhadas"
                type="number"
                placeholder="Ex: 8.5"
                value={horasTrabalhadas}
                onChange={(e) => setHorasTrabalhadas(e.target.value)}
                dica={minutosPausa > 0 ? `Descontados ${minutosPausa}m em pausas` : 'Opcional (horas online)'}
              />
            </div>

            {/* CONFERÊNCIA OBRIGATÓRIA: BOLSO (Dinheiro em Mãos) */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-texto-2 flex items-center gap-1.5">
                  <Wallet className="size-4 text-emerald-400" />
                  Conferência do Bolso (Dinheiro Físico)
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setConferenciaBolsoPulada(!conferenciaBolsoPulada);
                    if (!conferenciaBolsoPulada && localBolso) {
                      setSaldosInformados((prev) => ({ ...prev, [localBolso.id]: null }));
                    }
                  }}
                  className="text-xs text-laranja-400 hover:underline"
                >
                  {conferenciaBolsoPulada ? 'Conferir valor real' : 'Pular conferência'}
                </button>
              </div>

              {!conferenciaBolsoPulada && localBolso ? (
                <>
                  <MoneyInput
                    rotulo="Quanto você tem no bolso agora em espécie?"
                    valor={saldoBolsoInformado ?? saldoBolsoCalculado}
                    onValorChange={(v) =>
                      setSaldosInformados((prev) => ({ ...prev, [localBolso.id]: v }))
                    }
                    grande
                  />

                  {difBolso === 0 ? (
                    <div className="p-3 bg-positivo/10 border border-positivo/30 rounded-md text-xs text-positivo flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Tudo certo! Seu bolso bate exatamente com as corridas em dinheiro registradas.</span>
                    </div>
                  ) : difBolso > 0 ? (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md text-xs text-blue-400 flex items-center gap-2">
                      <Sparkles className="size-4 shrink-0" />
                      <span>
                        Sobra de {formatarMoeda(difBolso)}! O app registrará o ajuste para bater com seu bolso.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs text-amber-400 flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>
                        Faltam {formatarMoeda(Math.abs(difBolso))}. O app registrará o ajuste para refletir a realidade.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-bg-2 border border-line/60 rounded-md text-xs text-texto-3">
                  Conferência do bolso pulada. O saldo calculado de{' '}
                  <strong className="text-texto-1">{formatarMoeda(saldoBolsoCalculado)}</strong> será mantido.
                </div>
              )}
            </div>

            {/* CONFERÊNCIA OPCIONAL: APP 99 E BANCOS */}
            {outrosLocais.length > 0 && (
              <div className="pt-2 border-t border-line/50">
                <button
                  type="button"
                  onClick={() => setOutrosLocaisAbertos(!outrosLocaisAbertos)}
                  className="flex items-center justify-between w-full p-2.5 rounded-md bg-bg-2 border border-line/60 text-xs font-bold text-texto-2 hover:text-texto-1 transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Building2 className="size-4 text-laranja-400" />
                    Conferir outros locais: App 99 e Bancos (Opcional)
                  </span>
                  {outrosLocaisAbertos ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
                </button>

                {outrosLocaisAbertos && (
                  <div className="space-y-3 mt-3 p-3 bg-bg-1 rounded-lg border border-line/60">
                    <p className="text-[11px] text-texto-3">
                      Se você viu o saldo no app da 99 ou nos seus bancos e quiser conciliar agora, digite o valor abaixo:
                    </p>

                    {outrosLocais.map((loc) => {
                      const valInf = saldosInformados[loc.id];
                      const valCalc = loc.saldo_centavos ?? 0;
                      const dif = valInf !== undefined && valInf !== null ? valInf - valCalc : 0;

                      return (
                        <div key={loc.id} className="p-2.5 rounded bg-bg-2 border border-line/40 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-texto-1 flex items-center gap-1.5">
                              {loc.tipo === 'app' ? (
                                <Smartphone className="size-3.5 text-amber-400" />
                              ) : (
                                <Building2 className="size-3.5 text-blue-400" />
                              )}
                              {loc.nome}
                            </span>
                            <span className="text-[11px] text-texto-3 font-mono">
                              Calculado: {formatarMoeda(valCalc)}
                            </span>
                          </div>

                          <MoneyInput
                            rotulo="Saldo visto no extrato/app"
                            valor={valInf ?? valCalc}
                            onValorChange={(v) =>
                              setSaldosInformados((prev) => ({ ...prev, [loc.id]: v }))
                            }
                          />

                          {dif !== 0 && (
                            <span className={`text-[10px] font-bold block ${dif > 0 ? 'text-blue-400' : 'text-amber-400'}`}>
                              {dif > 0 ? `Sobra de ${formatarMoeda(dif)}` : `Falta de ${formatarMoeda(Math.abs(dif))}`} no fechamento
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 flex gap-2">
              <Button
                variante="fantasma"
                className="flex-1"
                onClick={() => setPasso(1)}
                icone={<ArrowLeft className="size-4" />}
              >
                Voltar
              </Button>
              <Button
                variante="primario"
                className="flex-1"
                onClick={() => setPasso(3)}
                iconeDireita={<ArrowRight className="size-4" />}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 3: Depósito na Reserva de Manutenção */}
        {passo === 3 && (
          <div className="space-y-4">
            <Card className="p-4 bg-bg-2 border-line/60 flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-laranja-500/10 text-laranja-400 shrink-0">
                <ShieldCheck className="size-6" />
              </div>
              <div className="space-y-0.5">
                <h4 className="font-bold text-sm text-texto-1">Proteja seu Carro</h4>
                <p className="text-xs text-texto-3">
                  Guardar um pouco todo dia evita desespero em troca de óleo, pneus ou oficinas.
                </p>
              </div>
            </Card>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-texto-2">
                  Valor para guardar hoje
                </label>
                <button
                  type="button"
                  onClick={() => setManutencaoPulada(!manutencaoPulada)}
                  className="text-xs text-laranja-400 hover:underline"
                >
                  {manutencaoPulada ? 'Guardar valor' : 'Pular hoje'}
                </button>
              </div>

              {!manutencaoPulada ? (
                <>
                  <MoneyInput
                    rotulo="Depósito na manutenção"
                    valor={depositoManutencaoCentavos}
                    onValorChange={setDepositoManutencaoCentavos}
                    grande
                  />

                  {/* Atalhos rápidos de depósito */}
                  <div className="flex gap-2">
                    {[1000, 2000, 3000, 5000].map((cents) => (
                      <button
                        key={cents}
                        type="button"
                        onClick={() => setDepositoManutencaoCentavos(cents)}
                        className={`flex-1 py-1.5 text-xs font-bold rounded border transition-all ${
                          depositoManutencaoCentavos === cents
                            ? 'bg-laranja-500/20 text-laranja-400 border-laranja-500/50'
                            : 'bg-bg-2 text-texto-3 border-line/60 hover:text-texto-1'
                        }`}
                      >
                        {formatarMoeda(cents)}
                      </button>
                    ))}
                  </div>

                  <div className="p-3 bg-bg-2 rounded-md border border-line/60 text-xs text-texto-2 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-texto-3">Vai para a reserva:</span>
                      <span className="font-bold text-positivo">
                        +{formatarMoeda(depositoManutencaoCentavos)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-texto-3">Sobra no seu caixa do dia:</span>
                      <span className="font-bold text-texto-1 font-mono">
                        {formatarMoeda(saldoFinalPrevisto)}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="p-3 bg-bg-2 border border-line/60 rounded-md text-xs text-texto-3">
                  Reserva pulada hoje. Todo o seu lucro permanecerá livre no seu caixa principal.
                </div>
              )}
            </div>

            <div className="pt-4 flex gap-2">
              <Button
                variante="fantasma"
                className="flex-1"
                onClick={() => setPasso(2)}
                icone={<ArrowLeft className="size-4" />}
              >
                Voltar
              </Button>
              <Button
                variante="primario"
                className="flex-1"
                onClick={() => setPasso(4)}
                iconeDireita={<ArrowRight className="size-4" />}
              >
                Próximo
              </Button>
            </div>
          </div>
        )}

        {/* PASSO 4: Confirmação e Tela Final V2 */}
        {passo === 4 && (
          <div className="space-y-4">
            <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
              <h4 className="font-bold text-sm text-texto-1 flex items-center gap-2">
                <Check className="size-4 text-laranja-400" />
                Resumo Consolidado do Fechamento V2
              </h4>

              <div className="space-y-2 text-xs divide-y divide-line/40">
                <div className="flex justify-between pt-1">
                  <span className="text-texto-3">Faturamento Bruto:</span>
                  <span className="font-semibold text-positivo font-mono">
                    {formatarMoeda(ganhoBruto)}
                  </span>
                </div>
                {totalTaxas > 0 && (
                  <div className="flex justify-between pt-2">
                    <span className="text-texto-3">
                      Taxas (Plataforma + Maquininha):
                    </span>
                    <span className="font-semibold text-amber-400 font-mono">
                      −{formatarMoeda(totalTaxas)} ({taxaEfetivaPct.toFixed(1)}%)
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-texto-3 font-bold text-texto-2">Ganho Líquido:</span>
                  <span className="font-bold text-texto-1 font-mono">
                    {formatarMoeda(ganhoLiquido)}
                  </span>
                </div>
                {despesasOperacionais > 0 && (
                  <div className="flex justify-between pt-2">
                    <span className="text-texto-3">Despesas Operacionais:</span>
                    <span className="font-semibold text-negativo font-mono">
                      −{formatarMoeda(despesasOperacionais)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-texto-3 font-bold text-texto-2">Lucro Final do Turno:</span>
                  <span className="font-black text-positivo font-mono text-sm">
                    {formatarMoeda(lucroCalculado)}
                  </span>
                </div>

                {/* Métricas de Rendimento */}
                {(ganhoPorHoraLiquido || lucroPorKm) && (
                  <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                    {ganhoPorHoraLiquido && (
                      <div className="p-2 rounded bg-bg-1 border border-line flex items-center gap-1.5">
                        <Clock className="size-3.5 text-laranja-400" />
                        <div>
                          <span className="text-texto-3 block text-[9px] uppercase font-bold">R$/Hora Líq.</span>
                          <span className="font-bold text-texto-1">{formatarMoeda(ganhoPorHoraLiquido)}/h</span>
                        </div>
                      </div>
                    )}
                    {lucroPorKm && (
                      <div className="p-2 rounded bg-bg-1 border border-line flex items-center gap-1.5">
                        <Gauge className="size-3.5 text-blue-400" />
                        <div>
                          <span className="text-texto-3 block text-[9px] uppercase font-bold">Lucro/KM</span>
                          <span className="font-bold text-texto-1">{formatarMoeda(lucroPorKm)}/km</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!manutencaoPulada && depositoManutencaoCentavos > 0 && (
                  <div className="flex justify-between pt-2">
                    <span className="text-texto-3">Guardado para Manutenção:</span>
                    <span className="font-semibold text-positivo font-mono">
                      {formatarMoeda(depositoManutencaoCentavos)}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            <Input
              rotulo="Observações do dia (opcional)"
              placeholder="Ex: Dia com chuva forte, trânsito pesado na zona sul..."
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />

            <div className="pt-4 flex gap-2">
              <Button
                variante="fantasma"
                className="flex-1"
                onClick={() => setPasso(3)}
                icone={<ArrowLeft className="size-4" />}
                disabled={fechandoDia}
              >
                Voltar
              </Button>
              <Button
                variante="primario"
                className="flex-1"
                onClick={handleConfirmarFechamento}
                carregando={fechandoDia}
                icone={<Check className="size-4" />}
              >
                Confirmar Fechamento
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Lançamento em Lote por Plataforma */}
      <Modal
        aberto={modalLoteAberto}
        aoFechar={() => setModalLoteAberto(false)}
        titulo="Lançar Ganhos por Plataforma"
        descricao="Lance os valores finais mostrados nos aplicativos antes de fechar o dia."
      >
        <div className="space-y-4">
          <div className="flex gap-2 p-1 bg-bg-2 rounded-md border border-line">
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                modoLote === 'somar'
                  ? 'bg-laranja-500 text-white'
                  : 'text-texto-3 hover:text-texto-1'
              }`}
              onClick={() => setModoLote('somar')}
            >
              Somar aos já lançados
            </button>
            <button
              type="button"
              className={`flex-1 py-1.5 text-xs font-bold rounded transition-colors ${
                modoLote === 'substituir'
                  ? 'bg-laranja-500 text-white'
                  : 'text-texto-3 hover:text-texto-1'
              }`}
              onClick={() => setModoLote('substituir')}
            >
              Substituir existentes
            </button>
          </div>

          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {plataformas?.map((plat) => {
              const info = valoresPlataforma[plat.id] || { valor: 0, corridas: 0 };
              return (
                <div key={plat.id} className="p-3 bg-bg-2 rounded-md border border-line space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-texto-1 flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full"
                        style={{ backgroundColor: plat.cor || '#ff7a00' }}
                      />
                      {plat.nome}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <MoneyInput
                      rotulo="Valor total"
                      valor={info.valor}
                      onValorChange={(v) =>
                        setValoresPlataforma((prev) => ({
                          ...prev,
                          [plat.id]: { ...info, valor: v },
                        }))
                      }
                    />
                    <Input
                      rotulo="Nº de Corridas"
                      type="number"
                      placeholder="Ex: 12"
                      value={info.corridas || ''}
                      onChange={(e) =>
                        setValoresPlataforma((prev) => ({
                          ...prev,
                          [plat.id]: { ...info, corridas: parseInt(e.target.value, 10) || 0 },
                        }))
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-line">
            <Button variante="fantasma" onClick={() => setModalLoteAberto(false)} disabled={salvandoLote}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleAplicarLote} carregando={salvandoLote}>
              Salvar Plataformas
            </Button>
          </div>
        </div>
      </Modal>
    </Sheet>
  );
};
