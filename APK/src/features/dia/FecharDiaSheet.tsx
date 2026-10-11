import React, { useState, useMemo } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Card } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { useFecharDia, useLotePlataformas, useResumoDia, type DiaTrabalho } from './api';
import { useSaldoPrincipal, useSaldoManutencao, useConfiguracaoManutencao } from '@/features/caixa/api';
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
  Check,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FecharDiaSheetProps {
  aberto: boolean;
  aoFechar: () => void;
  diaAtual: DiaTrabalho;
}

export const FecharDiaSheet: React.FC<FecharDiaSheetProps> = ({ aberto, aoFechar, diaAtual }) => {
  const [passo, setPasso] = useState<1 | 2 | 3 | 4>(1);

  // APIs
  const { data: resumo } = useResumoDia(diaAtual.id);
  const { saldoCentavos: saldoPrincipal, caixaId: caixaPrincipalId } = useSaldoPrincipal();
  const { saldoCentavos: saldoManutencao } = useSaldoManutencao();
  const { data: configManutencao } = useConfiguracaoManutencao();
  const { data: plataformas } = usePlataformas();
  const { data: categoriasEntrada } = useCategorias('entrada');

  const { mutateAsync: fecharDia, isPending: fechandoDia } = useFecharDia();
  const { mutateAsync: salvarLote, isPending: salvandoLote } = useLotePlataformas();

  // Passo 1: Lote por plataforma
  const [valoresPlataforma, setValoresPlataforma] = useState<Record<string, { valor: number; corridas: number }>>({});
  const [modalLoteAberto, setModalLoteAberto] = useState(false);
  const [modoLote, setModoLote] = useState<'somar' | 'substituir'>('somar');

  // Passo 2: Odômetro e Conferência
  const [kmFinal, setKmFinal] = useState<string>('');
  const [horasTrabalhadas, setHorasTrabalhadas] = useState<string>('');
  const [saldoInformadoCentavos, setSaldoInformadoCentavos] = useState<number | null>(null);
  const [conferenciaPulada, setConferenciaPulada] = useState<boolean>(false);

  // Passo 3: Depósito na Reserva de Manutenção
  const valorPadraoManutencao = configManutencao?.deposito_manutencao_centavos ?? 2000;
  const [depositoManutencaoCentavos, setDepositoManutencaoCentavos] = useState<number>(valorPadraoManutencao);
  const [manutencaoPulada, setManutencaoPulada] = useState<boolean>(false);

  // Passo 4: Observações e Erros
  const [observacoes, setObservacoes] = useState<string>('');
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Cálculos dinâmicos
  const receita = Number(resumo?.receita_centavos ?? 0);
  const despesas = Number(resumo?.despesas_centavos ?? 0);
  const lucroCalculado = receita - despesas;

  const kmPercorrido = useMemo(() => {
    if (!kmFinal.trim() || diaAtual.km_inicial === null) return null;
    const final = parseInt(kmFinal, 10);
    if (isNaN(final) || final < diaAtual.km_inicial) return null;
    return final - diaAtual.km_inicial;
  }, [kmFinal, diaAtual.km_inicial]);

  const saldoCalculadoAtual = saldoPrincipal;

  const diferencaConferencia = useMemo(() => {
    if (conferenciaPulada || saldoInformadoCentavos === null) return 0;
    return saldoInformadoCentavos - saldoCalculadoAtual;
  }, [conferenciaPulada, saldoInformadoCentavos, saldoCalculadoAtual]);

  const saldoFinalPrevisto = useMemo(() => {
    const base = conferenciaPulada || saldoInformadoCentavos === null
      ? saldoCalculadoAtual
      : saldoInformadoCentavos;
    const deposito = manutencaoPulada ? 0 : depositoManutencaoCentavos;
    return base - deposito;
  }, [conferenciaPulada, saldoInformadoCentavos, saldoCalculadoAtual, manutencaoPulada, depositoManutencaoCentavos]);

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

  // Submeter Fechamento Definitivo
  const handleConfirmarFechamento = async () => {
    setErroMsg(null);
    try {
      const kmNum = kmFinal.trim() ? parseInt(kmFinal, 10) : null;
      const minutosNum = horasTrabalhadas.trim() ? Math.round(parseFloat(horasTrabalhadas) * 60) : null;
      const saldoInf = conferenciaPulada ? null : saldoInformadoCentavos;
      const depositoInf = manutencaoPulada ? 0 : depositoManutencaoCentavos;

      await fecharDia({
        diaId: diaAtual.id,
        saldoInformadoCentavos: saldoInf,
        depositoManutencaoCentavos: depositoInf,
        kmFinal: kmNum,
        minutosOnline: minutosNum,
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
      console.error('[Meta Driver] Erro ao fechar dia:', err);
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
          ? 'Resumo e Lote'
          : passo === 2
          ? 'Odômetro e Conferência'
          : passo === 3
          ? 'Reserva de Manutenção'
          : 'Confirmação e Caixa'
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

        {/* PASSO 1: Resumo do Dia e Lote por Plataforma */}
        {passo === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-3.5 bg-bg-2 border-line/60">
                <span className="text-xs text-texto-3">Total Bruto</span>
                <p className="text-lg font-black text-positivo font-mono">
                  {formatarMoeda(receita)}
                </p>
                <span className="text-[11px] text-texto-3">
                  {resumo?.corridas ?? 0} corridas
                </span>
              </Card>

              <Card className="p-3.5 bg-bg-2 border-line/60">
                <span className="text-xs text-texto-3">Total Despesas</span>
                <p className="text-lg font-black text-negativo font-mono">
                  {formatarMoeda(despesas)}
                </p>
                <span className="text-[11px] text-texto-3">Combustível, lanche, etc.</span>
              </Card>
            </div>

            <Card className="p-4 bg-laranja-500/10 border-laranja-500/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-laranja-400">Lucro Líquido do Dia</span>
                <p className="text-2xl font-black text-texto-1 font-mono">
                  {formatarMoeda(lucroCalculado)}
                </p>
              </div>
              <TrendingUp className="size-8 text-laranja-500/60" />
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

        {/* PASSO 2: Odômetro Final e Conferência de Dinheiro em Mãos */}
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
                dica="Opcional (horas online)"
              />
            </div>

            {/* Conferência Física de Caixa */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold uppercase tracking-wide text-texto-2">
                  Conferência do dinheiro em mãos
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setConferenciaPulada(!conferenciaPulada);
                    if (!conferenciaPulada) setSaldoInformadoCentavos(null);
                  }}
                  className="text-xs text-laranja-400 hover:underline"
                >
                  {conferenciaPulada ? 'Conferir valor real' : 'Pular conferência'}
                </button>
              </div>

              {!conferenciaPulada ? (
                <>
                  <MoneyInput
                    rotulo="Dinheiro total em mãos e conta agora"
                    valor={saldoInformadoCentavos ?? saldoCalculadoAtual}
                    onValorChange={(v) => setSaldoInformadoCentavos(v)}
                    grande
                  />

                  {/* Feedback acolhedor da conferência (Anexo B) */}
                  {diferencaConferencia === 0 ? (
                    <div className="p-3 bg-positivo/10 border border-positivo/30 rounded-md text-xs text-positivo flex items-center gap-2">
                      <CheckCircle2 className="size-4 shrink-0" />
                      <span>Tudo certo! Seu caixa bateu certinho com o que você tem em mãos.</span>
                    </div>
                  ) : diferencaConferencia > 0 ? (
                    <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md text-xs text-blue-400 flex items-center gap-2">
                      <Sparkles className="size-4 shrink-0" />
                      <span>
                        Sobrou {formatarMoeda(diferencaConferencia)}! O app ajustará seu saldo para
                        ficar igual ao seu bolso.
                      </span>
                    </div>
                  ) : (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-md text-xs text-amber-400 flex items-center gap-2">
                      <AlertCircle className="size-4 shrink-0" />
                      <span>
                        Faltam {formatarMoeda(Math.abs(diferencaConferencia))}. O app registrará o
                        ajuste para refletir a realidade.
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-3 bg-bg-2 border border-line/60 rounded-md text-xs text-texto-3">
                  Conferência pulada. O app usará o saldo calculado de{' '}
                  <strong className="text-texto-1">{formatarMoeda(saldoCalculadoAtual)}</strong>.
                </div>
              )}
            </div>

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

        {/* PASSO 3: Reserva de Manutenção */}
        {passo === 3 && (
          <div className="space-y-4">
            <Card className="p-4 bg-bg-2 border-line/60 space-y-2">
              <div className="flex items-center gap-2 text-texto-2">
                <ShieldCheck className="size-5 text-laranja-400" />
                <span className="font-bold text-sm text-texto-1">Reserva para Manutenção</span>
              </div>
              <p className="text-xs text-texto-3">
                Guardar um valor diário garante que você tenha dinheiro reservado para troca de óleo,
                pneus e mecânico sem surpresas.
              </p>
              <p className="text-xs text-texto-2 pt-1">
                Saldo atual guardado:{' '}
                <strong className="text-positivo font-mono">
                  {formatarMoeda(saldoManutencao)}
                </strong>
              </p>
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

        {/* PASSO 4: Confirmação e Tela Final */}
        {passo === 4 && (
          <div className="space-y-4">
            <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
              <h4 className="font-bold text-sm text-texto-1 flex items-center gap-2">
                <Check className="size-4 text-laranja-400" />
                Resumo Consolidado do Dia
              </h4>

              <div className="space-y-2 text-xs divide-y divide-line/40">
                <div className="flex justify-between pt-1">
                  <span className="text-texto-3">Receita Bruta:</span>
                  <span className="font-semibold text-positivo font-mono">
                    {formatarMoeda(receita)}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-texto-3">Despesas do Dia:</span>
                  <span className="font-semibold text-negativo font-mono">
                    {formatarMoeda(despesas)}
                  </span>
                </div>
                <div className="flex justify-between pt-2">
                  <span className="text-texto-3">Lucro Líquido:</span>
                  <span className="font-bold text-texto-1 font-mono">
                    {formatarMoeda(lucroCalculado)}
                  </span>
                </div>
                {!manutencaoPulada && depositoManutencaoCentavos > 0 && (
                  <div className="flex justify-between pt-2">
                    <span className="text-texto-3">Guardado para Manutenção:</span>
                    <span className="font-semibold text-positivo font-mono">
                      {formatarMoeda(depositoManutencaoCentavos)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between pt-2">
                  <span className="text-texto-3">Caixa Final no Bolso:</span>
                  <span className="font-black text-laranja-400 font-mono text-sm">
                    {formatarMoeda(saldoFinalPrevisto)}
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-laranja-500/10 border border-laranja-500/30 rounded-md text-[11px] text-laranja-400 text-center font-medium">
                🌅 Amanhã você começará com {formatarMoeda(saldoFinalPrevisto)} em mãos.
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
                icone={<CheckCircle2 className="size-4" />}
              >
                Fechar o Dia
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Lançamento em Lote por Plataforma */}
      <Modal
        aberto={modalLoteAberto}
        aoFechar={() => setModalLoteAberto(false)}
        titulo="Lançamento em Lote por Plataforma"
        descricao="Informe os ganhos de cada aplicativo para lançamento conjunto."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalLoteAberto(false)}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={handleAplicarLote}
              carregando={salvandoLote}
            >
              Confirmar Lote
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {/* Seletor Somar ou Substituir */}
          <div className="flex items-center gap-2 p-2 bg-bg-2 rounded-md border border-line/60">
            <span className="text-xs text-texto-2 font-medium">Regra:</span>
            <button
              type="button"
              onClick={() => setModoLote('somar')}
              className={`flex-1 py-1 text-xs font-bold rounded transition-all ${
                modoLote === 'somar'
                  ? 'bg-laranja-500/20 text-laranja-400 border border-laranja-500/50'
                  : 'text-texto-3 hover:text-texto-1'
              }`}
            >
              Somar com anteriores
            </button>
            <button
              type="button"
              onClick={() => setModoLote('substituir')}
              className={`flex-1 py-1 text-xs font-bold rounded transition-all ${
                modoLote === 'substituir'
                  ? 'bg-negativo/20 text-negativo border border-negativo/50'
                  : 'text-texto-3 hover:text-texto-1'
              }`}
            >
              Substituir anteriores
            </button>
          </div>

          <div className="space-y-3">
            {plataformas?.map((plat) => {
              const info = valoresPlataforma[plat.id] || { valor: 0, corridas: 1 };
              return (
                <div key={plat.id} className="p-3 bg-bg-2 rounded-md border border-line/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-texto-1 flex items-center gap-1.5">
                      <span className="size-2 rounded-full" style={{ backgroundColor: plat.cor }} />
                      {plat.nome}
                    </span>
                    <div className="flex items-center gap-1 text-xs text-texto-3">
                      <span>Corridas:</span>
                      <input
                        type="number"
                        min={1}
                        value={info.corridas}
                        onChange={(e) => {
                          const c = parseInt(e.target.value, 10) || 1;
                          setValoresPlataforma((prev) => ({
                            ...prev,
                            [plat.id]: { ...info, corridas: c },
                          }));
                        }}
                        className="w-12 h-6 text-center bg-bg-3 border border-line/60 rounded text-texto-1 text-xs"
                      />
                    </div>
                  </div>

                  <MoneyInput
                    rotulo=""
                    valor={info.valor}
                    onValorChange={(v) => {
                      setValoresPlataforma((prev) => ({
                        ...prev,
                        [plat.id]: { ...info, valor: v },
                      }));
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </Modal>
    </Sheet>
  );
};
