import React, { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import {
  usePlataformas,
  useCategorias,
  useCriarLancamento,
  useCriarLancamentosEmLote,
  useExcluirLancamento,
} from './api';
import { useSaldoPrincipal } from '@/features/caixa/api';
import { useDiaAtual } from '@/features/dia/api';
import { formatarMoeda } from '@/lib/money';
import { dataHojeISO } from '@/lib/datas';
import { traduzirErro } from '@/lib/erros';
import { toast } from '@/components/ui/Toast';
import {
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Car,
  Clock,
  Split,
  Wallet,
  Smartphone,
  CreditCard,
  QrCode,
  Percent,
} from 'lucide-react';

interface EntradaRapidaSheetProps {
  aberto: boolean;
  aoFechar: () => void;
}

const VALORES_RAPIDOS = [500, 1000, 2000, 5000, 10000]; // R$ 5, 10, 20, 50, 100 em centavos

type ModoDestino = 'app' | 'direto' | 'dividido';
type MeioDireto = 'dinheiro' | 'pix' | 'cartao';

export const EntradaRapidaSheet: React.FC<EntradaRapidaSheetProps> = ({ aberto, aoFechar }) => {
  const { data: plataformas } = usePlataformas();
  const { data: categorias } = useCategorias('entrada');
  const { caixaId } = useSaldoPrincipal();
  const { data: diaAtual } = useDiaAtual();
  const { mutateAsync: criarLancamento, isPending: salvandoUnico } = useCriarLancamento();
  const { mutateAsync: criarLote, isPending: salvandoLote } = useCriarLancamentosEmLote();
  const { mutateAsync: excluirLancamento } = useExcluirLancamento();

  const isPending = salvandoUnico || salvandoLote;

  // Valores básicos
  const [valorCentavos, setValorCentavos] = useState<number>(0);
  const [plataformaIdSelecionada, setPlataformaIdSelecionada] = useState<string | null>(null);
  const [qtdCorridas, setQtdCorridas] = useState<number>(1);
  const [kmCorrida, setKmCorrida] = useState<string>('');

  // Data e Horário
  const [dataRef, setDataRef] = useState<string>(dataHojeISO());
  const [horarioCorrida, setHorarioCorrida] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [editarDataHora, setEditarDataHora] = useState<boolean>(false);

  // Divisão Inteligente de Ganhos
  const [modoDestino, setModoDestino] = useState<ModoDestino>('app');
  const [meioDireto, setMeioDireto] = useState<MeioDireto>('dinheiro');
  const [valorPassageiroCentavos, setValorPassageiroCentavos] = useState<number>(0);

  // Detalhes extras
  const [maisDetalhes, setMaisDetalhes] = useState<boolean>(false);
  const [observacao, setObservacao] = useState<string>('');
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Selecionar plataforma padrão: 99 ou a primeira disponível ou a última memorizada
  const plataformaId = React.useMemo(() => {
    if (plataformaIdSelecionada) return plataformaIdSelecionada;
    if (!plataformas || plataformas.length === 0) return '';
    const salva = typeof window !== 'undefined' ? localStorage.getItem('meta_driver_ultima_plataforma') : null;
    if (salva && plataformas.some((p) => p.id === salva)) {
      return salva;
    }
    const noventa = plataformas.find((p) => p.nome.toLowerCase().includes('99'));
    return noventa ? noventa.id : plataformas[0].id;
  }, [plataformaIdSelecionada, plataformas]);

  const nomePlataforma = React.useMemo(() => {
    return plataformas?.find((p) => p.id === plataformaId)?.nome || 'App';
  }, [plataformas, plataformaId]);

  // Cálculos da divisão
  const valorAppRetidoCentavos = Math.max(0, valorCentavos - valorPassageiroCentavos);

  // Preenche automaticamente 50% para o passageiro
  const aplicarMetade = () => {
    const metade = Math.round(valorCentavos / 2);
    setValorPassageiroCentavos(metade);
  };

  const rotuloMeio = (m: MeioDireto) => {
    if (m === 'dinheiro') return 'Bolso (Dinheiro)';
    if (m === 'pix') return 'Pix Conta';
    return 'Cartão Maquininha';
  };

  const handleSalvar = async () => {
    if (valorCentavos <= 0) {
      setErroMsg('Informe um valor de corrida maior que zero.');
      return;
    }
    if (!caixaId) {
      setErroMsg('Caixa principal não encontrado.');
      return;
    }

    if (modoDestino === 'dividido' && valorPassageiroCentavos <= 0) {
      setErroMsg('Na opção dividida, informe o valor pago diretamente pelo passageiro.');
      return;
    }

    if (modoDestino === 'dividido' && valorPassageiroCentavos >= valorCentavos) {
      setErroMsg('O valor pago pelo passageiro deve ser menor que o total da corrida (ou selecione "Recebido Direto").');
      return;
    }

    setErroMsg(null);

    // Categoria padrão de corridas
    const catCorridas = categorias?.find((c) => c.nome.toLowerCase().includes('corrida')) || categorias?.[0];

    // Data/hora precisa
    const [hora, min] = (horarioCorrida || '12:00').split(':');
    const ocorridoData = new Date(`${dataRef}T${hora.padStart(2, '0')}:${min ? min.padStart(2, '0') : '00'}:00`);
    const ocorridoEm = !isNaN(ocorridoData.getTime()) ? ocorridoData.toISOString() : new Date().toISOString();

    const kmNumerico = kmCorrida.trim() ? parseFloat(kmCorrida.replace(',', '.')) : null;

    try {
      let idsCriados: string[] = [];

      if (modoDestino === 'dividido') {
        // Lançamento 1: Valor pago direto pelo passageiro
        // Lançamento 2: Valor retido no saldo da plataforma
        const desc1 = observacao.trim()
          ? `${observacao.trim()} (${rotuloMeio(meioDireto)} passageiro)`
          : `Corrida ${nomePlataforma} (${rotuloMeio(meioDireto)})`;

        const desc2 = observacao.trim()
          ? `${observacao.trim()} (Retido ${nomePlataforma})`
          : `Corrida - Saldo retido ${nomePlataforma}`;

        const criados = await criarLote([
          {
            caixaId,
            diaId: diaAtual?.id || null,
            tipo: 'entrada',
            valorCentavos: valorPassageiroCentavos,
            plataformaId: plataformaId || null,
            categoriaId: catCorridas?.id || null,
            qtdCorridas,
            km: kmNumerico,
            descricao: desc1,
            meioPagamento: meioDireto,
            dataReferencia: dataRef,
            ocorridoEm,
          },
          {
            caixaId,
            diaId: diaAtual?.id || null,
            tipo: 'entrada',
            valorCentavos: valorAppRetidoCentavos,
            plataformaId: plataformaId || null,
            categoriaId: catCorridas?.id || null,
            qtdCorridas: 0, // 0 para não duplicar contagem de corridas
            km: null, // null para não duplicar km produtivo
            descricao: desc2,
            meioPagamento: 'saldo_app',
            dataReferencia: dataRef,
            ocorridoEm,
          },
        ]);

        idsCriados = (criados as { id: string }[]).map((c) => c.id);
      } else {
        // Lançamento único (100% App ou 100% Direto)
        const meioFinal = modoDestino === 'app' ? 'saldo_app' : meioDireto;
        const lancamento = await criarLancamento({
          caixaId,
          diaId: diaAtual?.id || null,
          tipo: 'entrada',
          valorCentavos,
          plataformaId: plataformaId || null,
          categoriaId: catCorridas?.id || null,
          qtdCorridas,
          km: kmNumerico,
          descricao: observacao.trim() || null,
          meioPagamento: meioFinal,
          dataReferencia: dataRef,
          ocorridoEm,
        });

        if (lancamento?.id) idsCriados.push(lancamento.id);
      }

      // Memorizar última plataforma usada
      if (plataformaId) {
        localStorage.setItem('meta_driver_ultima_plataforma', plataformaId);
      }

      const valorFormatado = formatarMoeda(valorCentavos);
      const detalheToast =
        modoDestino === 'dividido'
          ? ` (${formatarMoeda(valorPassageiroCentavos)} ${rotuloMeio(meioDireto)} + ${formatarMoeda(valorAppRetidoCentavos)} ${nomePlataforma})`
          : '';

      toast.sucesso(`+${valorFormatado} registrado${detalheToast}`, {
        acao: {
          rotulo: 'Desfazer',
          aoClicar: async () => {
            if (idsCriados.length > 0) {
              await excluirLancamento(idsCriados);
              toast.info('Entrada desfeita.');
            }
          },
        },
      });

      // Reset de estado e fechar
      setValorCentavos(0);
      setValorPassageiroCentavos(0);
      setQtdCorridas(1);
      setKmCorrida('');
      setObservacao('');
      setMaisDetalhes(false);
      setModoDestino('app');
      aoFechar();
    } catch (err) {
      setErroMsg(traduzirErro(err));
    }
  };

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Adicionar Corrida / Entrada"
      descricao="Registre seus ganhos com divisão inteligente por destino."
    >
      <div className="flex flex-col gap-4 pt-1">
        {erroMsg && (
          <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* Barra Compacta de Data e Horário (Automático ou Editável) */}
        <div className="p-2.5 rounded-lg bg-bg-2 border border-line/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-texto-2 flex items-center gap-1.5">
              <Clock className="size-3.5 text-laranja-400" />
              {dataRef === dataHojeISO() ? 'Hoje' : dataRef} às {horarioCorrida}
            </span>
            <button
              type="button"
              onClick={() => setEditarDataHora(!editarDataHora)}
              className="text-laranja-400 hover:text-laranja-300 font-bold transition-colors underline text-xs"
            >
              {editarDataHora ? 'Fechar ajuste' : 'Editar data/horário'}
            </button>
          </div>

          {editarDataHora && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/40">
              <Input
                rotulo="Data da corrida"
                type="date"
                value={dataRef}
                onChange={(e) => setDataRef(e.target.value)}
              />
              <Input
                rotulo="Horário"
                type="time"
                value={horarioCorrida}
                onChange={(e) => setHorarioCorrida(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Campo Grande de Valor com MoneyInput */}
        <MoneyInput
          rotulo="Valor total da corrida"
          valor={valorCentavos}
          onValorChange={(novo) => {
            setValorCentavos(novo);
            if (modoDestino === 'dividido' && valorPassageiroCentavos > novo) {
              setValorPassageiroCentavos(Math.round(novo / 2));
            }
          }}
          grande
        />

        {/* Atalhos de Valores Rápidos */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {VALORES_RAPIDOS.map((cents) => (
            <button
              key={cents}
              type="button"
              onClick={() => setValorCentavos((prev) => prev + cents)}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-bg-2 hover:bg-laranja-500/20 text-texto-2 hover:text-laranja-400 border border-line/60 transition-all shrink-0 active:scale-95"
            >
              +{formatarMoeda(cents)}
            </button>
          ))}
          {valorCentavos > 0 && (
            <button
              type="button"
              onClick={() => {
                setValorCentavos(0);
                setValorPassageiroCentavos(0);
              }}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-negativo hover:bg-negativo/10 transition-colors shrink-0"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Seleção de Plataforma */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-texto-2">
            Plataforma
          </label>
          <div className="flex flex-wrap gap-2">
            {plataformas?.map((plat) => {
              const selecionada = plat.id === plataformaId;
              return (
                <Chip
                  key={plat.id}
                  selecionado={selecionada}
                  onClick={() => setPlataformaIdSelecionada(plat.id)}
                  icone={<span className="size-2 rounded-full" style={{ backgroundColor: plat.cor }} />}
                >
                  {plat.nome}
                </Chip>
              );
            })}
          </div>
        </div>

        {/* Input de KM da Corrida (com passageiro a bordo) */}
        <div className="flex flex-col gap-1.5">
          <Input
            rotulo="Km desta corrida (opcional)"
            type="text"
            inputMode="decimal"
            placeholder="Ex: 8.5"
            value={kmCorrida}
            onChange={(e) => setKmCorrida(e.target.value)}
            ajuda="Quilômetros rodados com passageiro (para calcular seu R$/km real)."
          />
        </div>

        {/* Destino do Ganho & Divisão Inteligente */}
        <div className="p-3.5 rounded-xl bg-bg-2/80 border border-line/70 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wide text-texto-2 flex items-center gap-1.5">
              <Split className="size-3.5 text-laranja-400" />
              Destino do Dinheiro
            </span>
            <span className="text-[11px] text-texto-3">Onde o valor entrou?</span>
          </div>

          {/* 3 Modos: 100% App, 100% Direto ou Dividido */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-lg bg-bg-1 border border-line/50">
            <button
              type="button"
              onClick={() => setModoDestino('app')}
              className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-md transition-all flex flex-col items-center gap-1 ${
                modoDestino === 'app'
                  ? 'bg-laranja-500 text-white shadow-sm'
                  : 'text-texto-3 hover:text-texto-1'
              }`}
            >
              <Smartphone className="size-3.5 shrink-0" />
              <span className="truncate max-w-full">100% {nomePlataforma}</span>
            </button>

            <button
              type="button"
              onClick={() => setModoDestino('direto')}
              className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-md transition-all flex flex-col items-center gap-1 ${
                modoDestino === 'direto'
                  ? 'bg-laranja-500 text-white shadow-sm'
                  : 'text-texto-3 hover:text-texto-1'
              }`}
            >
              <Wallet className="size-3.5 shrink-0" />
              <span className="truncate max-w-full">100% Direto</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setModoDestino('dividido');
                if (valorPassageiroCentavos === 0 && valorCentavos > 0) {
                  setValorPassageiroCentavos(Math.round(valorCentavos / 2));
                }
              }}
              className={`py-2 px-1 text-[11px] sm:text-xs font-bold rounded-md transition-all flex flex-col items-center gap-1 ${
                modoDestino === 'dividido'
                  ? 'bg-laranja-500 text-white shadow-sm'
                  : 'text-texto-3 hover:text-texto-1'
              }`}
            >
              <Split className="size-3.5 shrink-0" />
              <span className="truncate max-w-full">Dividido</span>
            </button>
          </div>

          {/* Seleção do Meio Direto (quando for direto ou dividido) */}
          {(modoDestino === 'direto' || modoDestino === 'dividido') && (
            <div className="flex flex-col gap-2 pt-1 border-t border-line/40">
              <label className="text-xs font-semibold text-texto-2">
                {modoDestino === 'dividido'
                  ? 'Como o passageiro pagou a parte dele?'
                  : 'Forma de recebimento em mãos:'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setMeioDireto('dinheiro')}
                  className={`py-2 px-1 text-xs font-semibold rounded-md border transition-all flex items-center justify-center gap-1.5 ${
                    meioDireto === 'dinheiro'
                      ? 'border-laranja-500 bg-laranja-500/15 text-laranja-400 font-bold'
                      : 'border-line bg-bg-1 text-texto-3 hover:text-texto-1'
                  }`}
                >
                  <Wallet className="size-3.5" />
                  <span>Bolso</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeioDireto('pix')}
                  className={`py-2 px-1 text-xs font-semibold rounded-md border transition-all flex items-center justify-center gap-1.5 ${
                    meioDireto === 'pix'
                      ? 'border-laranja-500 bg-laranja-500/15 text-laranja-400 font-bold'
                      : 'border-line bg-bg-1 text-texto-3 hover:text-texto-1'
                  }`}
                >
                  <QrCode className="size-3.5" />
                  <span>Pix Conta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMeioDireto('cartao')}
                  className={`py-2 px-1 text-xs font-semibold rounded-md border transition-all flex items-center justify-center gap-1.5 ${
                    meioDireto === 'cartao'
                      ? 'border-laranja-500 bg-laranja-500/15 text-laranja-400 font-bold'
                      : 'border-line bg-bg-1 text-texto-3 hover:text-texto-1'
                  }`}
                >
                  <CreditCard className="size-3.5" />
                  <span>Cartão</span>
                </button>
              </div>
            </div>
          )}

          {/* Calculadora Inteligente de Divisão (quando modoDestino === 'dividido') */}
          {modoDestino === 'dividido' && (
            <div className="p-3 rounded-lg bg-bg-1 border border-laranja-500/30 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-texto-1">
                  Valor recebido do passageiro:
                </label>
                {valorCentavos > 0 && (
                  <button
                    type="button"
                    onClick={aplicarMetade}
                    className="flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-laranja-500/15 text-laranja-400 hover:bg-laranja-500/25 transition-all"
                  >
                    <Percent className="size-3" />
                    <span>50% (Metade)</span>
                  </button>
                )}
              </div>

              <MoneyInput
                rotulo="Pago pelo passageiro"
                valor={valorPassageiroCentavos}
                onValorChange={(v) => setValorPassageiroCentavos(Math.min(v, valorCentavos))}
              />

              {/* Demonstrativo da Divisão */}
              <div className="p-2.5 rounded-md bg-bg-2 border border-line text-xs flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-texto-2 flex items-center gap-1">
                    <span className="size-2 rounded-full bg-positivo" />
                    {rotuloMeio(meioDireto)} (direto):
                  </span>
                  <strong className="text-texto-1 numero font-bold">
                    {formatarMoeda(valorPassageiroCentavos)}
                  </strong>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-texto-2 flex items-center gap-1">
                    <span className="size-2 rounded-full bg-laranja-400" />
                    Saldo no App {nomePlataforma} (repasse):
                  </span>
                  <strong className="text-laranja-400 numero font-bold">
                    {formatarMoeda(valorAppRetidoCentavos)}
                  </strong>
                </div>

                <p className="text-[10px] text-texto-3 pt-1 border-t border-line/40">
                  O saldo no app ficará acumulado até o repasse semanal da {nomePlataforma}.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stepper de Quantidade de Corridas */}
        <div className="flex items-center justify-between p-3 rounded-md bg-bg-1 border border-line/50">
          <div className="flex items-center gap-2 text-xs font-semibold text-texto-1">
            <Car className="size-4 text-laranja-400" />
            <span>Quantidade de corridas</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setQtdCorridas((q) => Math.max(1, q - 1))}
              disabled={qtdCorridas <= 1}
              className="size-8 rounded-lg bg-bg-2 border border-line flex items-center justify-center text-texto-2 hover:text-texto-1 disabled:opacity-40 transition-colors"
            >
              <Minus className="size-4" />
            </button>
            <span className="numero font-bold text-base w-6 text-center text-texto-1">
              {qtdCorridas}
            </span>
            <button
              type="button"
              onClick={() => setQtdCorridas((q) => q + 1)}
              className="size-8 rounded-lg bg-bg-2 border border-line flex items-center justify-center text-texto-2 hover:text-texto-1 transition-colors"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        {/* Sanfona "Mais Detalhes" (Observação) */}
        <div className="border-t border-line/40 pt-2">
          <button
            type="button"
            onClick={() => setMaisDetalhes(!maisDetalhes)}
            className="flex items-center justify-between w-full py-1 text-xs text-texto-3 hover:text-texto-1 transition-colors"
          >
            <span>{maisDetalhes ? 'Menos detalhes' : 'Mais detalhes (observação)'}</span>
            {maisDetalhes ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {maisDetalhes && (
            <div className="flex flex-col gap-3 pt-3">
              <Input
                rotulo="Observação (opcional)"
                placeholder="Ex: Corrida dinâmica, passageiro com mala, etc."
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Botão de Salvar em Destaque */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            variante="primario"
            tamanho="lg"
            bloco
            className="shadow-neon font-bold text-sm tracking-wide"
            onClick={handleSalvar}
            carregando={isPending}
          >
            {valorCentavos > 0
              ? `+ Salvar ${formatarMoeda(valorCentavos)}`
              : 'Salvar Entrada'}
          </Button>

          <Button variante="fantasma" bloco onClick={aoFechar}>
            Cancelar
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
