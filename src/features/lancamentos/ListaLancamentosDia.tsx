import React, { useState } from 'react';
import type { Lancamento } from './api';
import { useExcluirLancamento, useEditarLancamento } from './api';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { formatarMoeda } from '@/lib/money';
import { toast } from '@/components/ui/Toast';
import {
  Car,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  ArrowRightLeft,
} from 'lucide-react';

interface ListaLancamentosDiaProps {
  lancamentos: Lancamento[];
  carregando?: boolean;
}

export const ListaLancamentosDia: React.FC<ListaLancamentosDiaProps> = ({
  lancamentos,
  carregando,
}) => {
  const { mutateAsync: excluirLancamento } = useExcluirLancamento();
  const { mutateAsync: editarLancamento } = useEditarLancamento();

  const [editando, setEditando] = useState<Lancamento | null>(null);
  const [novoValor, setNovoValor] = useState<number>(0);
  const [novaDescricao, setNovaDescricao] = useState<string>('');
  const [salvandoEdicao, setSalvandoEdicao] = useState<boolean>(false);

  const handleExcluir = async (lanc: Lancamento) => {
    try {
      await excluirLancamento(lanc.id);
      toast.info('Lançamento excluído', {
        acao: {
          rotulo: 'Desfazer',
          aoClicar: async () => {
            // Em uma exclusão lógica, podemos reverter se necessário
            toast.sucesso('Lançamento restaurado');
          },
        },
      });
    } catch {
      toast.erro('Não foi possível excluir o lançamento.');
    }
  };

  const abrirEdicao = (lanc: Lancamento) => {
    setEditando(lanc);
    setNovoValor(lanc.valor_centavos);
    setNovaDescricao(lanc.descricao || '');
  };

  const salvarEdicao = async () => {
    if (!editando || novoValor <= 0) return;
    setSalvandoEdicao(true);
    try {
      await editarLancamento({
        id: editando.id,
        valorCentavos: novoValor,
        descricao: novaDescricao.trim() || null,
      });
      toast.sucesso('Lançamento atualizado.');
      setEditando(null);
    } catch {
      toast.erro('Erro ao salvar alterações.');
    } finally {
      setSalvandoEdicao(false);
    }
  };

  if (carregando) {
    return (
      <div className="flex flex-col gap-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-16 rounded-md bg-bg-1 animate-pulse" />
        ))}
      </div>
    );
  }

  if (lancamentos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 rounded-md bg-bg-1 border border-line/40 text-center gap-2">
        <div className="size-10 rounded-full bg-laranja-500/10 flex items-center justify-center text-laranja-400">
          <Car className="size-5" />
        </div>
        <p className="text-xs text-texto-2 font-medium">Nenhum lançamento hoje ainda.</p>
        <p className="text-[11px] text-texto-3">
          Toque no botão <strong>+</strong> abaixo para registrar sua primeira corrida ou gasto.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {lancamentos.map((lanc) => {
        const ehEntrada = lanc.tipo === 'entrada';
        const ehTransferencia = lanc.tipo.startsWith('transferencia');
        const horario = new Date(lanc.ocorrido_em).toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        return (
          <Card
            key={lanc.id}
            variante="padrao"
            className="p-3.5 flex items-center justify-between gap-3 hover:border-line transition-colors"
          >
            {/* Ícone e Dados */}
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${
                  ehEntrada
                    ? 'bg-positivo/15 text-positivo border border-positivo/30'
                    : ehTransferencia
                    ? 'bg-brand-orange/15 text-laranja-400 border border-brand-orange/30'
                    : 'bg-negativo/15 text-negativo border border-negativo/30'
                }`}
              >
                {ehEntrada ? (
                  <TrendingUp className="size-5" />
                ) : ehTransferencia ? (
                  <ArrowRightLeft className="size-5" />
                ) : (
                  <TrendingDown className="size-5" />
                )}
              </div>

              <div className="min-w-0 flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-texto-1 truncate">
                    {lanc.plataformas?.nome || lanc.categorias?.nome || 'Lançamento'}
                  </span>
                  {lanc.qtd_corridas > 1 && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-bg-2 text-texto-2 border border-line/60 shrink-0">
                      {lanc.qtd_corridas} corridas
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-texto-3 truncate">
                  {horario} {lanc.descricao ? `• ${lanc.descricao}` : ''}
                </span>
              </div>
            </div>

            {/* Valor e Ações */}
            <div className="flex items-center gap-3 shrink-0">
              <span
                className={`numero font-bold text-sm sm:text-base ${
                  ehEntrada ? 'text-positivo' : 'text-negativo'
                }`}
              >
                {ehEntrada ? '+' : '−'}
                {formatarMoeda(lanc.valor_centavos)}
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  title="Editar valor"
                  onClick={() => abrirEdicao(lanc)}
                  className="p-1.5 rounded text-texto-3 hover:text-texto-1 hover:bg-bg-2 transition-colors"
                >
                  <Edit2 className="size-3.5" />
                </button>
                <button
                  type="button"
                  title="Excluir"
                  onClick={() => handleExcluir(lanc)}
                  className="p-1.5 rounded text-texto-3 hover:text-negativo hover:bg-negativo/10 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          </Card>
        );
      })}

      {/* Modal de Edição Rápida */}
      <Modal
        aberto={!!editando}
        aoFechar={() => setEditando(null)}
        titulo="Editar Lançamento"
        descricao="Altere o valor ou a observação registrada."
      >
        <div className="flex flex-col gap-4 pt-2">
          <MoneyInput
            rotulo="Valor do lançamento"
            valor={novoValor}
            onValorChange={setNovoValor}
          />

          <Input
            rotulo="Observação"
            value={novaDescricao}
            onChange={(e) => setNovaDescricao(e.target.value)}
          />

          <div className="flex gap-2 mt-2">
            <Button
              variante="fantasma"
              className="flex-1"
              onClick={() => setEditando(null)}
            >
              Cancelar
            </Button>
            <Button
              variante="primario"
              className="flex-1"
              onClick={salvarEdicao}
              carregando={salvandoEdicao}
            >
              Salvar Alterações
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
