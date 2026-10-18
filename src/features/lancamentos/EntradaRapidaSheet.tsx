import React, { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import {
  usePlataformas,
  useCategorias,
  useLancarCorridaComPartes,
  useExcluirCorridaV2,
  type ParteInput,
} from './api';
import { useLocaisDinheiro } from '@/features/locais/api';
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
  Coins,
  Tag,
} from 'lucide-react';

interface EntradaRapidaSheetProps {
  aberto: boolean;
  aoFechar: () => void;
}

const VALORES_RAPIDOS = [500, 1000, 2000, 5000, 10000]; // R$ 5, 10, 20, 50, 100 em centavos

type TipoEntrada = 'corrida' | 'gorjeta';
type ModoDestino = 'app' | 'direto' | 'dividido';
type MeioDireto = 'dinheiro' | 'pix' | 'cartao';

export const EntradaRapidaSheet: React.FC<EntradaRapidaSheetProps> = ({ aberto, aoFechar }) => {
  const { data: plataformas } = usePlataformas();
  const { data: categorias } = useCategorias('entrada');
  const { data: locais = [] } = useLocaisDinheiro();
  const { data: diaAtual } = useDiaAtual();
  const { mutateAsync: lancarCorrida, isPending } = useLancarCorridaComPartes();
  const { mutateAsync: excluirCorrida } = useExcluirCorridaV2();

  // Tipo de entrada (Corrida ou Gorjeta da 99) — Decisão V2.4
  const [tipoEntrada, setTipoEntrada] = useState<TipoEntrada>('corrida');

  // Valores básicos
  const [valorCentavos, setValorCentavos] = useState<number>(0);
  const [taxa99Centavos, setTaxa99Centavos] = useState<number>(0);
  const [plataformaIdSelecionada, setPlataformaIdSelecionada] = useState<string | null>(null);
  const [qtdCorridas, setQtdCorridas] = useState<number>(1);
  const [kmCorrida, setKmCorrida] = useState<string>('');

  // Data e Horário
  const [dataRef, setDataRef] = useState<string>(dataHojeISO());
  const [horarioCorrida, setHorarioCorrida] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [editarDataHora, setEditarDataHora] = useState<boolean>(false);

  // Destino e Divisão Inteligente (Padrão: 'app' - Decisão V2.4)
  const [modoDestino, setModoDestino] = useState<ModoDestino>('app');
  const [meioDireto, setMeioDireto] = useState<MeioDireto>('dinheiro');
  const [valorPassageiroCentavos, setValorPassageiroCentavos] = useState<number>(0);
  const [restoTipo, setRestoTipo] = useState<'app' | 'cupom'>('app');

  // Detalhes extras
  const [maisDetalhes, setMaisDetalhes] = useState<boolean>(false);
  const [observacao, setObservacao] = useState<string>('');
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Identificação dos locais reais
  const localApp = locais.find((l) => l.tipo === 'app') || locais[1];
  const localBolso = locais.find((l) => l.tipo === 'bolso') || locais[0];
  const localInter = locais.find((l) => l.banco_codigo === 'inter') || locais.find((l) => l.tipo === 'banco') || localBolso;
  const localMercadoPago = locais.find((l) => l.banco_codigo === 'mercado_pago') || locais.find((l) => l.tipo === 'banco') || localBolso;

  // Selecionar plataforma padrão: 99 ou a memorizada
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
    return plataformas?.find((p) => p.id === plataformaId)?.nome || '99';
  }, [plataformas, plataformaId]);

  // Cálculos da divisão
  const valorAppRetidoCentavos = Math.max(0, valorCentavos - valorPassageiroCentavos);

  const aplicarMetade = () => {
    const metade = Math.round(valorCentavos / 2);
    setValorPassageiroCentavos(metade);
  };

  const obterLocalDireto = () => {
    if (meioDireto === 'dinheiro') return localBolso;
    if (meioDireto === 'pix') return localInter;
    return localMercadoPago;
  };

  const rotuloMeio = (m: MeioDireto) => {
    if (m === 'dinheiro') return 'Bolso (Dinheiro)';
    if (m === 'pix') return `Pix (${localInter?.nome || 'Banco'})`;
    return `Cartão (${localMercadoPago?.nome || 'Maquininha'})`;
  };

  const handleSalvar = async () => {
    if (valorCentavos <= 0) {
      setErroMsg('Informe um valor maior que zero.');
      return;
    }

    if (modoDestino === 'dividido' && valorPassageiroCentavos <= 0) {
      setErroMsg('Na opção dividida, informe o valor pago diretamente pelo passageiro.');
      return;
    }

    if (modoDestino === 'dividido' && valorPassageiroCentavos >= valorCentavos) {
      setErroMsg('O valor pago pelo passageiro deve ser menor que o total da corrida.');
      return;
    }

    setErroMsg(null);

    // Categoria: Corrida ou Gorjeta
    const catCorridas =
      tipoEntrada === 'gorjeta'
        ? categorias?.find((c) => c.nome.toLowerCase().includes('gorjeta')) || categorias?.[0]
        : categorias?.find((c) => c.nome.toLowerCase().includes('corrida')) || categorias?.[0];

    const [hora, min] = (horarioCorrida || '12:00').split(':');
    const ocorridoData = new Date(`${dataRef}T${hora.padStart(2, '0')}:${min ? min.padStart(2, '0') : '00'}:00`);
    const ocorridoEm = !isNaN(ocorridoData.getTime()) ? ocorridoData.toISOString() : new Date().toISOString();
    const kmNumerico = kmCorrida.trim() ? parseFloat(kmCorrida.replace(',', '.')) : null;

    // Montagem atômica das partes da V2.4
    const partes: ParteInput[] = [];
    const localDireto = obterLocalDireto();

    const meioParte = meioDireto === 'cartao' ? 'debito' : meioDireto;

    if (tipoEntrada === 'gorjeta') {
      // Gorjetas caem no App 99 por padrão
      if (localApp) {
        partes.push({
          local_id: localApp.id,
          meio: 'app',
          valor_centavos: valorCentavos,
        });
      }
    } else if (modoDestino === 'app') {
      // 100% no app
      if (localApp) {
        partes.push({
          local_id: localApp.id,
          meio: restoTipo === 'cupom' ? 'cupom' : 'app',
          valor_centavos: valorCentavos,
        });
      }
    } else if (modoDestino === 'direto') {
      // 100% em mãos / direto
      if (localDireto) {
        partes.push({
          local_id: localDireto.id,
          meio: meioParte,
          valor_centavos: valorCentavos,
        });
      }
    } else if (modoDestino === 'dividido') {
      // Dividido: parte direta + restante no app
      if (localDireto && valorPassageiroCentavos > 0) {
        partes.push({
          local_id: localDireto.id,
          meio: meioParte,
          valor_centavos: valorPassageiroCentavos,
        });
      }
      if (localApp && valorAppRetidoCentavos > 0) {
        partes.push({
          local_id: localApp.id,
          meio: restoTipo === 'cupom' ? 'cupom' : 'app',
          valor_centavos: valorAppRetidoCentavos,
        });
      }
    }

    try {
      // Lança a corrida como 1 ÚNICO LANÇAMENTO no banco com partes atômicas (BUG-02 corrigido)
      const lancamentoCriado = await lancarCorrida({
        diaId: diaAtual?.id || null,
        plataformaId: plataformaId || '',
        categoriaId: catCorridas?.id || '',
        valorCentavos,
        partes,
        restoTipo,
        taxaPlataformaCentavos: taxa99Centavos > 0 ? taxa99Centavos : undefined,
        taxaOrigem: taxa99Centavos > 0 ? 'informada' : 'nenhuma',
        qtdCorridas: tipoEntrada === 'gorjeta' ? 0 : qtdCorridas,
        km: tipoEntrada === 'gorjeta' ? null : kmNumerico,
        descricao:
          observacao.trim() ||
          (tipoEntrada === 'gorjeta' ? `Gorjeta ${nomePlataforma}` : null),
        dataReferencia: dataRef,
        ocorridoEm,
      });

      if (plataformaId) {
        localStorage.setItem('meta_driver_ultima_plataforma', plataformaId);
      }

      const valorFormatado = formatarMoeda(valorCentavos);
      const rotuloToast = tipoEntrada === 'gorjeta' ? `Gorjeta de +${valorFormatado}` : `+${valorFormatado} registrado (1 corrida)`;

      toast.sucesso(rotuloToast, {
        acao: {
          rotulo: 'Desfazer',
          aoClicar: async () => {
            if (lancamentoCriado?.id) {
              await excluirCorrida(lancamentoCriado.id);
              toast.info('Lançamento desfeito.');
            }
          },
        },
      });

      // Reset
      setValorCentavos(0);
      setTaxa99Centavos(0);
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
      titulo={tipoEntrada === 'gorjeta' ? 'Adicionar Gorjeta da 99' : 'Adicionar Corrida'}
      descricao={
        tipoEntrada === 'gorjeta'
          ? 'Recebeu gorjeta extra no aplicativo? Ela entra no saldo sem duplicar suas corridas.'
          : 'Lançamento inteligente com partes de pagamento, cupons e taxa opcional.'
      }
    >
      <div className="flex flex-col gap-4 pt-1">
        {erroMsg && (
          <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* Alternador de Modo: Corrida vs Gorjeta da 99 (Decisão V2.4) */}
        <div className="grid grid-cols-2 gap-2 p-1 rounded-lg bg-bg-1 border border-line/60">
          <button
            type="button"
            onClick={() => setTipoEntrada('corrida')}
            className={`py-2 px-3 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              tipoEntrada === 'corrida'
                ? 'bg-laranja-500 text-white shadow-sm'
                : 'text-texto-3 hover:text-texto-1'
            }`}
          >
            <Car className="size-4" />
            <span>Corrida Normal</span>
          </button>

          <button
            type="button"
            onClick={() => setTipoEntrada('gorjeta')}
            className={`py-2 px-3 text-xs font-bold rounded-md transition-all flex items-center justify-center gap-1.5 ${
              tipoEntrada === 'gorjeta'
                ? 'bg-laranja-500 text-white shadow-sm'
                : 'text-texto-3 hover:text-texto-1'
            }`}
          >
            <Coins className="size-4" />
            <span>Gorjeta da 99</span>
          </button>
        </div>

        {/* Data e Horário */}
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
          rotulo={tipoEntrada === 'gorjeta' ? 'Valor da gorjeta' : 'Valor total da corrida'}
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

        {/* Plataforma */}
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

        {/* Se for Corrida Normal: Modos de Pagamento e Divisão em Partes */}
        {tipoEntrada === 'corrida' && (
          <div className="p-3.5 rounded-xl bg-bg-2/80 border border-line/70 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wide text-texto-2 flex items-center gap-1.5">
                <Split className="size-3.5 text-laranja-400" />
                Como você recebeu?
              </span>
              <span className="text-[11px] text-texto-3">1 corrida = 1 lançamento</span>
            </div>

            {/* 3 Modos: Tudo no App, Tudo em Mãos ou Dividido */}
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
                <span className="truncate max-w-full">Tudo no App</span>
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
                <span className="truncate max-w-full">Tudo em Mãos</span>
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

            {/* Opções de Cupom vs Pago no App quando tiver valor no app (Decisão V2.4) */}
            {(modoDestino === 'app' || modoDestino === 'dividido') && (
              <div className="flex items-center justify-between p-2 rounded-lg bg-bg-1 border border-line/40 text-xs">
                <span className="text-texto-3 font-medium flex items-center gap-1">
                  <Tag className="size-3.5 text-laranja-400" />
                  Restante no App:
                </span>
                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => setRestoTipo('app')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      restoTipo === 'app'
                        ? 'bg-laranja-500/20 text-laranja-400 border border-laranja-500/40'
                        : 'text-texto-3 hover:text-texto-1'
                    }`}
                  >
                    Pago no App
                  </button>
                  <button
                    type="button"
                    onClick={() => setRestoTipo('cupom')}
                    className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                      restoTipo === 'cupom'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'text-texto-3 hover:text-texto-1'
                    }`}
                    title="A 99 cobre o cupom e repassa o valor integral para seu saldo"
                  >
                    Cupom 99
                  </button>
                </div>
              </div>
            )}

            {/* Meio Direto (quando for direto ou dividido) */}
            {(modoDestino === 'direto' || modoDestino === 'dividido') && (
              <div className="flex flex-col gap-2 pt-1 border-t border-line/40">
                <label className="text-xs font-semibold text-texto-2">
                  {modoDestino === 'dividido'
                    ? 'Onde você recebeu a parte em mãos?'
                    : 'Conta / Local onde recebeu:'}
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
                    <span>Pix Inter</span>
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
                    <span>Mercado Pago</span>
                  </button>
                </div>
              </div>
            )}

            {/* Calculadora Inteligente de Divisão (quando modoDestino === 'dividido') */}
            {modoDestino === 'dividido' && (
              <div className="p-3 rounded-lg bg-bg-1 border border-laranja-500/30 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-texto-1">
                    Valor recebido em mãos:
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
                  rotulo="Parte recebida do passageiro"
                  valor={valorPassageiroCentavos}
                  onValorChange={(v) => setValorPassageiroCentavos(Math.min(v, valorCentavos))}
                />

                {/* Demonstrativo das partes */}
                <div className="p-2.5 rounded-md bg-bg-2 border border-line text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-texto-2 flex items-center gap-1">
                      <span className="size-2 rounded-full bg-positivo" />
                      {rotuloMeio(meioDireto)}:
                    </span>
                    <strong className="text-texto-1 numero font-bold">
                      {formatarMoeda(valorPassageiroCentavos)}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-texto-2 flex items-center gap-1">
                      <span className="size-2 rounded-full bg-laranja-400" />
                      Restante no {localApp?.nome || 'App 99'} ({restoTipo === 'cupom' ? 'Cupom' : 'Saldo'}):
                    </span>
                    <strong className="text-laranja-400 numero font-bold">
                      {formatarMoeda(valorAppRetidoCentavos)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Campo Opcional: Taxa 99 do recibo (Decisão V2.4) */}
        {tipoEntrada === 'corrida' && (
          <div className="p-2.5 rounded-lg bg-bg-2 border border-line/60 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-texto-2">
                Taxa 99 do recibo (opcional)
              </span>
              <span className="text-[11px] text-texto-3">Descontada no saldo do App</span>
            </div>
            <MoneyInput
              rotulo="Valor cobrado pela plataforma"
              valor={taxa99Centavos}
              onValorChange={setTaxa99Centavos}
            />
          </div>
        )}

        {/* KM da corrida */}
        {tipoEntrada === 'corrida' && (
          <div className="flex flex-col gap-1.5">
            <Input
              rotulo="Km desta corrida (opcional)"
              type="text"
              inputMode="decimal"
              placeholder="Ex: 8.5"
              value={kmCorrida}
              onChange={(e) => setKmCorrida(e.target.value)}
              ajuda="Quilômetros rodados com passageiro."
            />
          </div>
        )}

        {/* Quantidade de Corridas (sempre 1 para corrida, ou oculto/0 para gorjeta) */}
        {tipoEntrada === 'corrida' && (
          <div className="flex items-center justify-between p-3 rounded-md bg-bg-1 border border-line/50">
            <div className="flex items-center gap-2 text-xs font-semibold text-texto-1">
              <Car className="size-4 text-laranja-400" />
              <span>Contagem de corridas</span>
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
        )}

        {/* Mais Detalhes (Observação) */}
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

        {/* Botão de Salvar */}
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
