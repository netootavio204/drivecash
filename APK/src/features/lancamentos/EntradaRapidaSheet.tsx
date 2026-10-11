import React, { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Input } from '@/components/ui/Input';
import { Chip } from '@/components/ui/Chip';
import { usePlataformas, useCategorias, useCriarLancamento, useExcluirLancamento } from './api';
import { useSaldoPrincipal } from '@/features/caixa/api';
import { useDiaAtual } from '@/features/dia/api';
import { formatarMoeda } from '@/lib/money';
import { traduzirErro } from '@/lib/erros';
import { toast } from '@/components/ui/Toast';
import { Plus, Minus, ChevronDown, ChevronUp, AlertCircle, Car } from 'lucide-react';

interface EntradaRapidaSheetProps {
  aberto: boolean;
  aoFechar: () => void;
}

const VALORES_RAPIDOS = [500, 1000, 2000, 5000, 10000]; // R$ 5, 10, 20, 50, 100 em centavos

export const EntradaRapidaSheet: React.FC<EntradaRapidaSheetProps> = ({ aberto, aoFechar }) => {
  const { data: plataformas } = usePlataformas();
  const { data: categorias } = useCategorias('entrada');
  const { caixaId } = useSaldoPrincipal();
  const { data: diaAtual } = useDiaAtual();
  const { mutateAsync: criarLancamento, isPending } = useCriarLancamento();
  const { mutateAsync: excluirLancamento } = useExcluirLancamento();

  const [valorCentavos, setValorCentavos] = useState<number>(0);
  const [plataformaIdSelecionada, setPlataformaIdSelecionada] = useState<string | null>(null);
  const [qtdCorridas, setQtdCorridas] = useState<number>(1);
  const [maisDetalhes, setMaisDetalhes] = useState<boolean>(false);
  const [observacao, setObservacao] = useState<string>('');
  const [meioPagamento, setMeioPagamento] = useState<string>('saldo_app');
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

  const handleSalvar = async () => {
    if (valorCentavos <= 0) {
      setErroMsg('Informe um valor maior que zero.');
      return;
    }
    if (!caixaId) {
      setErroMsg('Caixa principal não encontrado.');
      return;
    }

    setErroMsg(null);

    // Categoria padrão de corridas
    const catCorridas = categorias?.find((c) => c.nome.toLowerCase().includes('corrida')) || categorias?.[0];

    try {
      const lancamentoCriado = await criarLancamento({
        caixaId,
        diaId: diaAtual?.id || null,
        tipo: 'entrada',
        valorCentavos,
        plataformaId: plataformaId || null,
        categoriaId: catCorridas?.id || null,
        qtdCorridas,
        descricao: observacao.trim() || null,
        meioPagamento,
      });

      // Memorizar última plataforma usada
      if (plataformaId) {
        localStorage.setItem('meta_driver_ultima_plataforma', plataformaId);
      }

      const valorFormatado = formatarMoeda(valorCentavos);
      toast.sucesso(`+${valorFormatado} no caixa`, {
        acao: {
          rotulo: 'Desfazer',
          aoClicar: async () => {
            if (lancamentoCriado?.id) {
              await excluirLancamento(lancamentoCriado.id);
              toast.info('Entrada desfeita.');
            }
          },
        },
      });

      // Reset e fechar
      setValorCentavos(0);
      setQtdCorridas(1);
      setObservacao('');
      setMaisDetalhes(false);
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
      descricao="Registre seus ganhos em até 3 toques."
    >
      <div className="flex flex-col gap-4 pt-1">
        {erroMsg && (
          <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* Campo Grande de Valor com MoneyInput */}
        <MoneyInput
          rotulo="Valor recebido"
          valor={valorCentavos}
          onValorChange={setValorCentavos}
          grande
        />

        {/* Atalhos de Valores Rápidos em 1 Toque */}
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
              onClick={() => setValorCentavos(0)}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-negativo hover:bg-negativo/10 transition-colors shrink-0"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Seleção Rápida de Plataforma */}
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

        {/* Sanfona "Mais Detalhes" */}
        <div className="border-t border-line/40 pt-2">
          <button
            type="button"
            onClick={() => setMaisDetalhes(!maisDetalhes)}
            className="flex items-center justify-between w-full py-1 text-xs text-texto-3 hover:text-texto-1 transition-colors"
          >
            <span>{maisDetalhes ? 'Menos detalhes' : 'Mais detalhes (observação, pagamento)'}</span>
            {maisDetalhes ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
          </button>

          {maisDetalhes && (
            <div className="flex flex-col gap-3 pt-3">
              <Input
                rotulo="Observação (opcional)"
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-texto-2">Forma de recebimento</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'saldo_app', rotulo: 'Saldo App' },
                    { id: 'dinheiro', rotulo: 'Dinheiro' },
                    { id: 'pix', rotulo: 'PIX Direto' },
                  ].map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMeioPagamento(m.id)}
                      className={`py-2 px-1 text-xs font-semibold rounded-md border transition-all ${
                        meioPagamento === m.id
                          ? 'border-laranja-500 bg-laranja-500/10 text-laranja-400'
                          : 'border-line bg-bg-2 text-texto-3'
                      }`}
                    >
                      {m.rotulo}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botão de Salvar em Destaque */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            variante="primario"
            tamanho="lg"
            bloco
            className="shadow-neon"
            onClick={handleSalvar}
            carregando={isPending}
          >
            {valorCentavos > 0 ? `+ Salvar ${formatarMoeda(valorCentavos)}` : 'Salvar Entrada'}
          </Button>
          <Button variante="fantasma" bloco onClick={aoFechar}>
            Cancelar
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
