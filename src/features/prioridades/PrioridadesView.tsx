import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Estados';
import { toast } from '@/components/ui/Toast';
import { traduzirErro } from '@/lib/erros';
import { formatarMoeda } from '@/lib/money';
import { formatarDataCurta } from '@/lib/datas';
import {
  usePrioridades,
  useCriarPrioridade,
  useEditarPrioridade,
  useExcluirPrioridade,
  usePagarPrioridade,
  type Prioridade,
  type NivelPrioridade,
  type RecorrenciaPrioridade,
} from './api';
import { useSaldoPrincipal } from '@/features/caixa/api';
import { useCategorias } from '@/features/lancamentos/api';
import {
  Calendar,
  CheckCircle2,
  Plus,
  Repeat,
  Trash2,
  Edit2,
  Sparkles,
  Check,
  ShieldAlert,
} from 'lucide-react';

const CONTAS_SUGERIDAS = [
  { titulo: 'Parcela do Carro / Aluguel', valor: 65000, recorrencia: 'mensal' as const, nivel: 'alta' as const },
  { titulo: 'Seguro / Proteção Veicular', valor: 18000, recorrencia: 'mensal' as const, nivel: 'alta' as const },
  { titulo: 'Internet / Celular', valor: 6000, recorrencia: 'mensal' as const, nivel: 'media' as const },
  { titulo: 'Troca de Óleo e Filtros', valor: 19000, recorrencia: 'mensal' as const, nivel: 'media' as const },
  { titulo: 'IPVA / Licenciamento', valor: 35000, recorrencia: 'anual' as const, nivel: 'baixa' as const },
];

export const PrioridadesView: React.FC = () => {
  const { data: prioridades, isLoading } = usePrioridades();
  const { caixaId: principalId, saldoCentavos } = useSaldoPrincipal();
  const { data: categoriasSaida } = useCategorias('saida');

  const { mutateAsync: criarPrioridade, isPending: criando } = useCriarPrioridade();
  const { mutateAsync: editarPrioridade, isPending: editando } = useEditarPrioridade();
  const { mutateAsync: excluirPrioridade } = useExcluirPrioridade();
  const { mutateAsync: pagarPrioridade, isPending: pagando } = usePagarPrioridade();

  // Modais de Criação / Edição
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [prioridadeEmEdicao, setPrioridadeEmEdicao] = useState<Prioridade | null>(null);

  // Form State
  const [titulo, setTitulo] = useState('');
  const [valorCentavos, setValorCentavos] = useState(0);
  const [vencimento, setVencimento] = useState(new Date().toISOString().slice(0, 10));
  const [nivel, setNivel] = useState<NivelPrioridade>('alta');
  const [recorrencia, setRecorrencia] = useState<RecorrenciaPrioridade>('mensal');
  const [observacao, setObservacao] = useState('');

  // Modal de Pagamento
  const [modalPagarAberto, setModalPagarAberto] = useState(false);
  const [prioridadeParaPagar, setPrioridadeParaPagar] = useState<Prioridade | null>(null);

  const hoje = new Date().toISOString().slice(0, 10);

  // Estatísticas
  const pendentes = prioridades?.filter((p) => p.status === 'pendente') || [];
  const vencidas = pendentes.filter((p) => p.vencimento < hoje);
  const totalPendenteCentavos = pendentes.reduce((acc, p) => acc + p.valor_centavos, 0);

  const abrirCriacao = () => {
    setPrioridadeEmEdicao(null);
    setTitulo('');
    setValorCentavos(0);
    setVencimento(hoje);
    setNivel('alta');
    setRecorrencia('mensal');
    setObservacao('');
    setModalFormAberto(true);
  };

  const abrirEdicao = (p: Prioridade) => {
    setPrioridadeEmEdicao(p);
    setTitulo(p.titulo);
    setValorCentavos(p.valor_centavos);
    setVencimento(p.vencimento);
    setNivel(p.nivel);
    setRecorrencia(p.recorrencia);
    setObservacao(p.observacao || '');
    setModalFormAberto(true);
  };

  const handleSalvar = async () => {
    if (!titulo.trim()) {
      toast.erro('Informe o nome da conta.');
      return;
    }
    if (valorCentavos <= 0) {
      toast.erro('Informe um valor maior que zero.');
      return;
    }

    try {
      if (prioridadeEmEdicao) {
        await editarPrioridade({
          id: prioridadeEmEdicao.id,
          titulo: titulo.trim(),
          valorCentavos,
          vencimento,
          nivel,
          recorrencia,
          observacao,
        });
        toast.sucesso('Conta atualizada!');
      } else {
        await criarPrioridade({
          titulo: titulo.trim(),
          valorCentavos,
          vencimento,
          nivel,
          recorrencia,
          observacao,
        });
        toast.sucesso('Conta adicionada com sucesso!');
      }
      setModalFormAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  const handleConfirmarPagamento = async () => {
    if (!prioridadeParaPagar || !principalId) return;

    // Achar categoria financeira padrão ou a primeira
    const catFinanceira =
      categoriasSaida?.find((c) => c.nome.toLowerCase().includes('financeir') || c.nome.toLowerCase().includes('fixa')) ||
      categoriasSaida?.[0];

    try {
      await pagarPrioridade({
        prioridadeId: prioridadeParaPagar.id,
        caixaId: principalId,
        categoriaId: catFinanceira?.id || '',
      });

      toast.sucesso(`"${prioridadeParaPagar.titulo}" marcada como paga!`);
      setModalPagarAberto(false);
      setPrioridadeParaPagar(null);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  const handleAdicionarSugerida = async (sug: typeof CONTAS_SUGERIDAS[0]) => {
    try {
      await criarPrioridade({
        titulo: sug.titulo,
        valorCentavos: sug.valor,
        vencimento: hoje,
        nivel: sug.nivel,
        recorrencia: sug.recorrencia,
      });
      toast.sucesso(`"${sug.titulo}" adicionada com sucesso!`);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Prioridades</h1>
          <p className="text-xs text-texto-3">Contas e obrigações essenciais do motorista</p>
        </div>
        <Button
          variante="primario"
          className="text-xs !h-9 !py-0"
          onClick={abrirCriacao}
          icone={<Plus className="size-4" />}
        >
          Nova Conta
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-3.5 bg-bg-2 border-line/60">
          <span className="text-xs text-texto-3">Total a Pagar</span>
          <p className="text-lg font-black text-texto-1 font-mono">
            {formatarMoeda(totalPendenteCentavos)}
          </p>
          <span className="text-[11px] text-texto-3">{pendentes.length} contas pendentes</span>
        </Card>

        <Card
          className={`p-3.5 border transition-all ${
            vencidas.length > 0
              ? 'bg-negativo/10 border-negativo/40 text-negativo'
              : 'bg-bg-2 border-line/60 text-texto-3'
          }`}
        >
          <span className="text-xs">Contas Vencidas</span>
          <p className="text-lg font-black font-mono">
            {vencidas.length > 0 ? `${vencidas.length} vencida(s)` : 'Nenhuma 👏'}
          </p>
          <span className="text-[11px]">
            {vencidas.length > 0
              ? formatarMoeda(vencidas.reduce((a, b) => a + b.valor_centavos, 0))
              : 'Tudo em dia'}
          </span>
        </Card>
      </div>

      {/* Sugestões Rápidas de Primeiro Uso */}
      {pendentes.length === 0 && !isLoading && (
        <Card className="p-4 bg-laranja-500/10 border-laranja-500/30 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-laranja-400" />
            <h3 className="font-bold text-sm text-texto-1">Contas comuns de motorista</h3>
          </div>
          <p className="text-xs text-texto-2">
            Adicione rapidamente suas despesas fixas com 1 toque para acompanhar seus vencimentos:
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            {CONTAS_SUGERIDAS.map((sug) => (
              <button
                key={sug.titulo}
                type="button"
                onClick={() => handleAdicionarSugerida(sug)}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-bg-2 text-texto-2 hover:text-laranja-400 border border-line/60 hover:border-laranja-500/40 transition-all flex items-center gap-1 active:scale-95"
              >
                <Plus className="size-3 text-laranja-400" />
                {sug.titulo} ({formatarMoeda(sug.valor)})
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Lista de Contas */}
      <div className="space-y-3">
        <h3 className="font-bold text-sm text-texto-2 uppercase tracking-wide">
          Suas Obrigações ({prioridades?.length || 0})
        </h3>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-md" />
            ))}
          </div>
        ) : prioridades?.length === 0 ? (
          <div className="text-center py-12 text-texto-3 text-xs bg-bg-2 rounded-md border border-line/40">
            Nenhuma conta cadastrada ainda. Toque em "Nova Conta" para começar.
          </div>
        ) : (
          <div className="space-y-2.5">
            {prioridades?.map((conta) => {
              const ehPendente = conta.status === 'pendente';
              const estaVencida = ehPendente && conta.vencimento < hoje;
              const venceHoje = ehPendente && conta.vencimento === hoje;

              return (
                <Card
                  key={conta.id}
                  className={`p-3.5 border transition-all ${
                    !ehPendente
                      ? 'bg-bg-2/50 border-line/40 opacity-70'
                      : estaVencida
                      ? 'bg-negativo/10 border-negativo/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]'
                      : venceHoje
                      ? 'bg-laranja-500/10 border-laranja-500/50'
                      : 'bg-bg-2 border-line/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-texto-1 truncate">
                          {conta.titulo}
                        </span>

                        {estaVencida && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-negativo text-white flex items-center gap-1">
                            <ShieldAlert className="size-3" /> Vencida
                          </span>
                        )}

                        {venceHoje && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-laranja-500 text-white">
                            Vence Hoje
                          </span>
                        )}

                        {!ehPendente && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-positivo/20 text-positivo flex items-center gap-1">
                            <Check className="size-3" /> Paga
                          </span>
                        )}

                        <span
                          className={`size-2 rounded-full ${
                            conta.nivel === 'alta'
                              ? 'bg-negativo'
                              : conta.nivel === 'media'
                              ? 'bg-laranja-400'
                              : 'bg-positivo'
                          }`}
                          title={`Importância: ${conta.nivel}`}
                        />
                      </div>

                      <div className="flex items-center gap-3 text-xs text-texto-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3.5" />
                          Vencimento: {formatarDataCurta(new Date(conta.vencimento + 'T12:00:00'))}
                        </span>
                        {conta.recorrencia !== 'nenhuma' && (
                          <span className="flex items-center gap-1 capitalize">
                            <Repeat className="size-3" /> {conta.recorrencia}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-mono font-bold text-base text-texto-1">
                        {formatarMoeda(conta.valor_centavos)}
                      </p>
                    </div>
                  </div>

                  {/* Ações da Conta */}
                  <div className="mt-3 pt-2.5 border-t border-line/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => abrirEdicao(conta)}
                        className="text-texto-3 hover:text-texto-1 p-1"
                        title="Editar"
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          if (confirm(`Deseja excluir "${conta.titulo}"?`)) {
                            await excluirPrioridade(conta.id);
                            toast.info('Conta removida.');
                          }
                        }}
                        className="text-texto-3 hover:text-negativo p-1"
                        title="Excluir"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>

                    {ehPendente && (
                      <Button
                        variante="primario"
                        className="text-xs !h-8 !py-0"
                        onClick={() => {
                          setPrioridadeParaPagar(conta);
                          setModalPagarAberto(true);
                        }}
                        icone={<CheckCircle2 className="size-3.5" />}
                      >
                        Pagar Conta
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação / Edição */}
      <Modal
        aberto={modalFormAberto}
        aoFechar={() => setModalFormAberto(false)}
        titulo={prioridadeEmEdicao ? 'Editar Conta' : 'Nova Prioridade'}
        descricao="Cadastre os dados da obrigação para controle financeiro."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalFormAberto(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleSalvar} carregando={criando || editando}>
              Salvar Conta
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Nome da conta ou obrigação"
            placeholder="Ex: Parcela do Carro, Seguro, Celular"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />

          <MoneyInput
            rotulo="Valor a pagar"
            valor={valorCentavos}
            onValorChange={setValorCentavos}
            grande
          />

          <Input
            rotulo="Data de vencimento"
            type="date"
            value={vencimento}
            onChange={(e) => setVencimento(e.target.value)}
          />

          {/* Importância / Urgência */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-texto-2">
              Nível de importância
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'alta' as const, rotulo: 'Alta (🔴)', desc: 'Essencial' },
                { id: 'media' as const, rotulo: 'Média (🟡)', desc: 'Importante' },
                { id: 'baixa' as const, rotulo: 'Baixa (🟢)', desc: 'Flexível' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setNivel(item.id)}
                  className={`p-2 rounded text-xs font-bold border transition-all ${
                    nivel === item.id
                      ? 'border-laranja-500 bg-laranja-500/20 text-laranja-400'
                      : 'border-line/60 bg-bg-2 text-texto-3 hover:text-texto-1'
                  }`}
                >
                  <div>{item.rotulo}</div>
                  <div className="text-[10px] text-texto-3 font-normal">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Recorrência */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wide text-texto-2">
              Repetição (Recorrência)
            </label>
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'nenhuma' as const, rotulo: 'Única' },
                { id: 'diaria' as const, rotulo: 'Diária' },
                { id: 'semanal' as const, rotulo: 'Semanal' },
                { id: 'mensal' as const, rotulo: 'Mensal' },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setRecorrencia(item.id)}
                  className={`py-1.5 text-xs font-semibold rounded border transition-all ${
                    recorrencia === item.id
                      ? 'border-laranja-500 bg-laranja-500/20 text-laranja-400'
                      : 'border-line/60 bg-bg-2 text-texto-3 hover:text-texto-1'
                  }`}
                >
                  {item.rotulo}
                </button>
              ))}
            </div>
          </div>

          <Input
            rotulo="Observação (opcional)"
            placeholder="Ex: Pagar pelo app do banco X..."
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal de Pagamento de Conta */}
      <Modal
        aberto={modalPagarAberto}
        aoFechar={() => setModalPagarAberto(false)}
        titulo="Pagar Conta"
        descricao="Confirmar a baixa financeira desta obrigação."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalPagarAberto(false)}>
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={handleConfirmarPagamento}
              carregando={pagando}
              icone={<CheckCircle2 className="size-4" />}
            >
              Confirmar Pagamento
            </Button>
          </div>
        }
      >
        {prioridadeParaPagar && (
          <div className="space-y-3">
            <div className="p-3 bg-bg-2 border border-line/60 rounded-md space-y-1">
              <span className="text-xs text-texto-3">Conta selecionada:</span>
              <p className="font-bold text-base text-texto-1">{prioridadeParaPagar.titulo}</p>
              <p className="text-lg font-mono font-black text-negativo">
                {formatarMoeda(prioridadeParaPagar.valor_centavos)}
              </p>
            </div>

            <div className="p-3 bg-laranja-500/10 border border-laranja-500/30 rounded-md text-xs text-laranja-400 space-y-1">
              <p>
                ✓ Será gerada uma saída de{' '}
                <strong>{formatarMoeda(prioridadeParaPagar.valor_centavos)}</strong> no Caixa do
                Dia.
              </p>
              {prioridadeParaPagar.recorrencia !== 'nenhuma' && (
                <p>
                  ✓ Como é uma conta <strong>{prioridadeParaPagar.recorrencia}</strong>, a próxima
                  ocorrência futura será gerada automaticamente.
                </p>
              )}
            </div>

            <div className="text-xs text-texto-3">
              Saldo disponível no caixa:{' '}
              <strong className="text-texto-1 font-mono">{formatarMoeda(saldoCentavos)}</strong>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
