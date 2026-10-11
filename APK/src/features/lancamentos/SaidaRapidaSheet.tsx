import React, { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Input } from '@/components/ui/Input';
import { useCategorias, useCriarLancamento, useExcluirLancamento } from './api';
import { useSaldoPrincipal, useSaldoManutencao } from '@/features/caixa/api';
import { useDiaAtual } from '@/features/dia/api';
import { formatarMoeda } from '@/lib/money';
import { traduzirErro } from '@/lib/erros';
import { toast } from '@/components/ui/Toast';
import {
  Fuel,
  Utensils,
  Smartphone,
  Wrench,
  Droplets,
  Ticket,
  AlertTriangle,
  MoreHorizontal,
  Wallet,
  AlertCircle,
} from 'lucide-react';

interface SaidaRapidaSheetProps {
  aberto: boolean;
  aoFechar: () => void;
}

// Mapa de ícones para as categorias de despesas
const ICONE_CATEGORIA: Record<string, React.ReactNode> = {
  combustível: <Fuel className="size-5" />,
  alimentação: <Utensils className="size-5" />,
  'crédito no app': <Smartphone className="size-5" />,
  manutenção: <Wrench className="size-5" />,
  lavagem: <Droplets className="size-5" />,
  'pedágio / estacionamento': <Ticket className="size-5" />,
  multa: <AlertTriangle className="size-5" />,
  'retirada pessoal': <Wallet className="size-5" />,
  outras: <MoreHorizontal className="size-5" />,
};

export const SaidaRapidaSheet: React.FC<SaidaRapidaSheetProps> = ({ aberto, aoFechar }) => {
  const { data: categorias } = useCategorias('saida');
  const { caixaId: principalId, saldoCentavos: saldoPrincipal } = useSaldoPrincipal();
  const { caixaId: manutencaoId, saldoCentavos: saldoManutencao } = useSaldoManutencao();
  const { data: diaAtual } = useDiaAtual();
  const { mutateAsync: criarLancamento, isPending } = useCriarLancamento();
  const { mutateAsync: excluirLancamento } = useExcluirLancamento();

  const [valorCentavos, setValorCentavos] = useState<number>(0);
  const [categoriaIdSelecionada, setCategoriaIdSelecionada] = useState<string | null>(null);
  const [origemCaixa, setOrigemCaixa] = useState<'principal' | 'manutencao'>('principal');
  const [observacao, setObservacao] = useState<string>('');
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  // Selecionar combustível como padrão inicial
  const categoriaId = React.useMemo(() => {
    if (categoriaIdSelecionada) return categoriaIdSelecionada;
    if (!categorias || categorias.length === 0) return '';
    const combustivel = categorias.find((c) => c.nome.toLowerCase().includes('combust'));
    return combustivel ? combustivel.id : categorias[0].id;
  }, [categoriaIdSelecionada, categorias]);

  const handleSalvar = async () => {
    if (valorCentavos <= 0) {
      setErroMsg('Informe um valor maior que zero.');
      return;
    }

    const destinoCaixaId = origemCaixa === 'principal' ? principalId : manutencaoId;
    if (!destinoCaixaId) {
      setErroMsg('Caixa de origem não encontrado.');
      return;
    }

    // Validação de saldo da reserva de manutenção (RN-09)
    if (origemCaixa === 'manutencao' && valorCentavos > saldoManutencao) {
      setErroMsg(`Saldo insuficiente na reserva de manutenção (${formatarMoeda(saldoManutencao)} disponíveis).`);
      return;
    }

    setErroMsg(null);

    try {
      const lancamentoCriado = await criarLancamento({
        caixaId: destinoCaixaId,
        diaId: diaAtual?.id || null,
        tipo: 'saida',
        valorCentavos,
        categoriaId: categoriaId || null,
        descricao: observacao.trim() || null,
      });

      const valorFormatado = formatarMoeda(valorCentavos);

      // Aviso discreto se o caixa principal ficar negativo
      if (origemCaixa === 'principal' && valorCentavos > saldoPrincipal) {
        const saldoNegativo = formatarMoeda(saldoPrincipal - valorCentavos);
        toast.info(`Seu caixa ficou em ${saldoNegativo}. Falta lançar alguma entrada?`);
      } else {
        toast.sucesso(`−${valorFormatado} registrado`, {
          acao: {
            rotulo: 'Desfazer',
            aoClicar: async () => {
              if (lancamentoCriado?.id) {
                await excluirLancamento(lancamentoCriado.id);
                toast.info('Despesa desfeita.');
              }
            },
          },
        });
      }

      // Reset e fechar
      setValorCentavos(0);
      setObservacao('');
      aoFechar();
    } catch (err) {
      setErroMsg(traduzirErro(err));
    }
  };

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Adicionar Despesa / Saída"
      descricao="Registre seus gastos para saber seu lucro real."
    >
      <div className="flex flex-col gap-4 pt-1">
        {erroMsg && (
          <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* Campo Grande de Valor */}
        <MoneyInput
          rotulo="Valor gasto"
          valor={valorCentavos}
          onValorChange={setValorCentavos}
          grande
        />

        {/* Seletor de Caixa de Origem (Principal vs Reserva de Manutenção) */}
        <div className="flex items-center gap-2 p-1.5 rounded-md bg-bg-1 border border-line/50">
          <button
            type="button"
            onClick={() => setOrigemCaixa('principal')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded transition-all ${
              origemCaixa === 'principal'
                ? 'bg-bg-2 text-laranja-400 border border-laranja-500/40'
                : 'text-texto-3 hover:text-texto-1'
            }`}
          >
            Caixa do Dia ({formatarMoeda(saldoPrincipal)})
          </button>
          <button
            type="button"
            onClick={() => setOrigemCaixa('manutencao')}
            className={`flex-1 py-1.5 px-2 text-xs font-bold rounded transition-all ${
              origemCaixa === 'manutencao'
                ? 'bg-bg-2 text-positivo border border-positivo/40'
                : 'text-texto-3 hover:text-texto-1'
            }`}
          >
            Reserva Manutenção ({formatarMoeda(saldoManutencao)})
          </button>
        </div>

        {/* Grade de Categorias com Ícones */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold uppercase tracking-wide text-texto-2">
            Categoria da despesa
          </label>
          <div className="grid grid-cols-3 gap-2">
            {categorias?.map((cat) => {
              const selecionada = cat.id === categoriaId;
              const nomeNormalizado = cat.nome.toLowerCase();
              const icone =
                ICONE_CATEGORIA[nomeNormalizado] || <MoreHorizontal className="size-5" />;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategoriaIdSelecionada(cat.id)}
                  className={`flex flex-col items-center justify-center p-2.5 rounded-md border text-center transition-all ${
                    selecionada
                      ? 'border-laranja-500 bg-laranja-500/15 text-laranja-400 shadow-[0_0_12px_rgba(255,122,0,0.2)]'
                      : 'border-line/60 bg-bg-2 text-texto-2 hover:bg-bg-3'
                  }`}
                >
                  <span className="mb-1">{icone}</span>
                  <span className="text-[11px] font-semibold truncate w-full">{cat.nome}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Campo de Observação */}
        <Input
          rotulo="Detalhes ou posto (opcional)"
          value={observacao}
          onChange={(e) => setObservacao(e.target.value)}
        />

        {/* Botão de Salvar */}
        <div className="flex flex-col gap-2 mt-2">
          <Button
            variante="perigo"
            tamanho="lg"
            bloco
            onClick={handleSalvar}
            carregando={isPending}
          >
            {valorCentavos > 0 ? `− Registrar ${formatarMoeda(valorCentavos)}` : 'Registrar Saída'}
          </Button>
          <Button variante="fantasma" bloco onClick={aoFechar}>
            Cancelar
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
