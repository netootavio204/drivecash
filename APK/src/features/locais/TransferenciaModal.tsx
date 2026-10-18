import { useState } from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Input } from '@/components/ui/Input';
import { toast } from '@/components/ui/Toast';
import { formatarMoeda } from '@/lib/money';
import { useTransferirLocal } from './api';
import type { LocalComSaldo } from './types';

interface TransferenciaModalProps {
  aberto: boolean;
  aoFechar: () => void;
  locais: LocalComSaldo[];
  origemPadraoId?: string;
  destinoPadraoId?: string;
}

export function TransferenciaModal({
  aberto,
  aoFechar,
  locais,
  origemPadraoId,
  destinoPadraoId,
}: TransferenciaModalProps) {
  const [origemId, setOrigemId] = useState<string>(
    origemPadraoId || locais[1]?.id || locais[0]?.id || '',
  );
  const [destinoId, setDestinoId] = useState<string>(
    destinoPadraoId || locais[2]?.id || locais[1]?.id || '',
  );
  const [valorCentavos, setValorCentavos] = useState<number>(0);
  const [taxaCentavos, setTaxaCentavos] = useState<number>(0);
  const [observacao, setObservacao] = useState<string>('');

  const { mutateAsync: transferir, isPending: transferindo } = useTransferirLocal();

  const localOrigem = locais.find((l) => l.id === origemId);
  const localDestino = locais.find((l) => l.id === destinoId);

  // Sugestão de taxa de R$ 1,00 se a origem for o App 99
  const isSaqueApp99 = localOrigem?.tipo === 'app';

  // Validações
  const valorInvalido = valorCentavos <= 0;
  const mesmaConta = origemId === destinoId;
  const taxaMaiorQueValor = taxaCentavos > valorCentavos;
  const podeTransferir = !valorInvalido && !mesmaConta && !taxaMaiorQueValor && !transferindo;

  const valorLiquidoDestino = Math.max(0, valorCentavos - taxaCentavos);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!podeTransferir) return;

    try {
      await transferir({
        local_origem_id: origemId,
        local_destino_id: destinoId,
        valor_centavos: valorCentavos,
        taxa_centavos: taxaCentavos,
        observacao: observacao.trim() || undefined,
      });

      toast.sucesso(
        `Transferência de ${formatarMoeda(valorCentavos)} realizada com sucesso!`,
      );
      // Reset
      setValorCentavos(0);
      setTaxaCentavos(0);
      setObservacao('');
      aoFechar();
    } catch (err: any) {
      toast.erro(err.message || 'Erro ao realizar transferência');
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Transferir Dinheiro"
      descricao="Mova valores entre seu bolso, app da 99 e contas bancárias sem alterar suas receitas brutas."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção de Origem e Destino */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-texto-3 mb-1">
              De onde sai (Origem)
            </label>
            <select
              value={origemId}
              onChange={(e) => setOrigemId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-bg-2 border border-line text-sm text-texto-1 focus:outline-none focus:border-laranja-500 font-medium"
            >
              {locais.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nome} ({formatarMoeda(loc.saldo_centavos || 0)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-texto-3 mb-1">
              Para onde vai (Destino)
            </label>
            <select
              value={destinoId}
              onChange={(e) => setDestinoId(e.target.value)}
              className="w-full px-3 py-2 rounded-md bg-bg-2 border border-line text-sm text-texto-1 focus:outline-none focus:border-laranja-500 font-medium"
            >
              {locais.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.nome} ({formatarMoeda(loc.saldo_centavos || 0)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {mesmaConta && (
          <p className="text-xs text-negativo flex items-center gap-1 font-semibold">
            <AlertCircle className="size-3.5" /> Escolha contas de origem e destino diferentes.
          </p>
        )}

        {/* Valor da Transferência */}
        <div>
          <MoneyInput
            rotulo="Valor a transferir"
            valor={valorCentavos}
            onValorChange={setValorCentavos}
            grande
            autoFocus
          />
        </div>

        {/* Taxa de Transferência */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-texto-3">
              Taxa de transferência (se houver)
            </span>
            {isSaqueApp99 && (
              <button
                type="button"
                onClick={() => setTaxaCentavos(100)}
                className="text-[11px] font-bold text-laranja-400 hover:underline"
              >
                + R$ 1,00 (Saque rápido 99)
              </button>
            )}
          </div>
          <MoneyInput
            rotulo="Taxa paga"
            valor={taxaCentavos}
            onValorChange={setTaxaCentavos}
          />
        </div>

        {/* Observação Opcional */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-texto-3 mb-1">
            Observação (opcional)
          </label>
          <Input
            rotulo="Ex: Saque semanal da 99 ou depósito"
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Ex: Saque semanal da quarta-feira"
          />
        </div>

        {/* Resumo do Impacto nos Saldos */}
        {valorCentavos > 0 && !mesmaConta && (
          <div className="p-3 rounded-md bg-bg-2 border border-line/70 space-y-1.5 text-xs">
            <p className="font-bold text-texto-2">Resumo da movimentação:</p>
            <div className="flex justify-between text-texto-2">
              <span>{localOrigem?.nome} debitará:</span>
              <span className="font-bold text-negativo">−{formatarMoeda(valorCentavos)}</span>
            </div>
            {taxaCentavos > 0 && (
              <div className="flex justify-between text-texto-3">
                <span>Taxa descontada:</span>
                <span className="font-medium text-texto-2">−{formatarMoeda(taxaCentavos)}</span>
              </div>
            )}
            <div className="flex justify-between text-texto-1 pt-1 border-t border-line/40 font-bold">
              <span>{localDestino?.nome} receberá líquido:</span>
              <span className="text-positivo">+{formatarMoeda(valorLiquidoDestino)}</span>
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-line/60">
          <Button type="button" variante="fantasma" onClick={aoFechar} disabled={transferindo}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variante="primario"
            carregando={transferindo}
            disabled={!podeTransferir}
            icone={<Check className="size-4" />}
          >
            Confirmar Transferência
          </Button>
        </div>
      </form>
    </Modal>
  );
}
