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
import {
  useSaldoManutencao,
  useSaldoPrincipal,
  useConfiguracaoManutencao,
  useAtualizarConfigManutencao,
  useTransferir,
  useGastarManutencao,
} from './api';
import { useCategorias } from '@/features/lancamentos/api';
import {
  ShieldCheck,
  Wrench,
  PiggyBank,
  Settings,
  Sparkles,
  Plus,
} from 'lucide-react';

export const CaixaManutencaoView: React.FC = () => {
  const { saldoCentavos: saldoManutencao, caixaId: manutencaoId, isLoading: carregandoSaldo } = useSaldoManutencao();
  const { saldoCentavos: saldoPrincipal, caixaId: principalId } = useSaldoPrincipal();
  const { data: configManutencao } = useConfiguracaoManutencao();
  const { data: categoriasSaida } = useCategorias('saida');

  const { mutateAsync: atualizarConfig } = useAtualizarConfigManutencao();
  const { mutateAsync: transferir, isPending: transferindo } = useTransferir();
  const { mutateAsync: gastarReserva, isPending: gastando } = useGastarManutencao();

  // Modais
  const [modalAporteAberto, setModalAporteAberto] = useState(false);
  const [valorAporte, setValorAporte] = useState(0);

  const [modalGastoAberto, setModalGastoAberto] = useState(false);
  const [valorGasto, setValorGasto] = useState(0);
  const [descGasto, setDescGasto] = useState('');

  const [modalConfigAberto, setModalConfigAberto] = useState(false);
  const metaCentavos = configManutencao?.meta_reserva_manutencao_centavos ?? 150000;
  const [novaMeta, setNovaMeta] = useState(metaCentavos);
  const [novoDepositoDiario, setNovoDepositoDiario] = useState(configManutencao?.deposito_manutencao_centavos ?? 2000);

  // Cálculos de Progresso da Meta
  const pctMeta = Math.min(100, Math.round((saldoManutencao / Math.max(1, metaCentavos)) * 100));
  const depositoDiarioAtual = configManutencao?.deposito_manutencao_centavos ?? 2000;
  const faltaParaMeta = Math.max(0, metaCentavos - saldoManutencao);
  const diasEstimados = depositoDiarioAtual > 0 ? Math.ceil(faltaParaMeta / depositoDiarioAtual) : 0;

  // Aportar valor avulso
  const handleConfirmarAporte = async () => {
    if (valorAporte <= 0) {
      toast.erro('Informe um valor maior que zero.');
      return;
    }
    if (valorAporte > saldoPrincipal) {
      toast.erro('Saldo insuficiente no Caixa Principal.');
      return;
    }
    if (!principalId || !manutencaoId) return;

    try {
      await transferir({
        origemId: principalId,
        destinoId: manutencaoId,
        valorCentavos: valorAporte,
        descricao: 'Aporte avulso na Reserva de Manutenção',
      });
      toast.sucesso(`Aporte de ${formatarMoeda(valorAporte)} realizado com sucesso!`);
      setModalAporteAberto(false);
      setValorAporte(0);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  // Registrar gasto com manutenção
  const handleConfirmarGasto = async () => {
    if (valorGasto <= 0) {
      toast.erro('Informe o valor gasto na oficina/peças.');
      return;
    }
    if (!principalId || !manutencaoId) return;

    const catManutencao =
      categoriasSaida?.find((c) => c.nome.toLowerCase().includes('manuten') || c.nome.toLowerCase().includes('peça')) ||
      categoriasSaida?.[0];

    try {
      await gastarReserva({
        valorCentavos: valorGasto,
        descricao: descGasto.trim() || 'Serviço de mecânico / peças',
        categoriaId: catManutencao?.id || null,
        saldoReservaCentavos: saldoManutencao,
        caixaPrincipalId: principalId,
        caixaReservaId: manutencaoId,
      });

      toast.sucesso('Gasto de manutenção registrado com sucesso!');
      setModalGastoAberto(false);
      setValorGasto(0);
      setDescGasto('');
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  // Salvar configurações
  const handleSalvarConfig = async () => {
    try {
      await atualizarConfig({
        metaReservaCentavos: novaMeta,
        depositoCentavos: novoDepositoDiario,
      });
      toast.sucesso('Configurações da reserva salvas!');
      setModalConfigAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Reserva de Manutenção</h1>
          <p className="text-xs text-texto-3">O cofrinho de proteção do seu carro e do seu trabalho</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setNovaMeta(metaCentavos);
            setNovoDepositoDiario(depositoDiarioAtual);
            setModalConfigAberto(true);
          }}
          className="p-2 text-texto-3 hover:text-texto-1 rounded-full hover:bg-bg-2"
          title="Configurar Meta e Depósito"
        >
          <Settings className="size-5" />
        </button>
      </div>

      {/* Card Principal: Saldo da Reserva */}
      <Card className="p-5 bg-gradient-to-br from-bg-2 to-bg-1 border-line/60 relative overflow-hidden">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-positivo flex items-center gap-1.5 uppercase tracking-wide">
              <ShieldCheck className="size-4" /> Saldo Protegido
            </span>
            {carregandoSaldo ? (
              <Skeleton className="h-10 w-36" />
            ) : (
              <p className="text-3xl font-black font-mono text-texto-1">
                {formatarMoeda(saldoManutencao)}
              </p>
            )}
            <p className="text-xs text-texto-3">
              Guardado para trocas de óleo, pneus, freios e oficina
            </p>
          </div>

          <div className="size-12 rounded-2xl bg-positivo/15 border border-positivo/30 text-positivo grid place-items-center">
            <PiggyBank className="size-6" />
          </div>
        </div>

        {/* Barra de Progresso da Meta */}
        <div className="mt-5 pt-4 border-t border-line/40 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-texto-2 font-medium">Meta da Reserva:</span>
            <span className="font-bold text-texto-1 font-mono">{formatarMoeda(metaCentavos)}</span>
          </div>

          <div className="h-2.5 w-full bg-bg-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-positivo transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"
              style={{ width: `${pctMeta}%` }}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-texto-3">
            <span className="font-semibold text-texto-2">{pctMeta}% concluído</span>
            {faltaParaMeta > 0 && diasEstimados > 0 && (
              <span className="text-texto-3">
                Faltam <strong className="text-texto-2 font-mono">{formatarMoeda(faltaParaMeta)}</strong> • ~{diasEstimados} dias a {formatarMoeda(depositoDiarioAtual)}/dia
              </span>
            )}
            {faltaParaMeta === 0 && (
              <span className="text-positivo font-bold">🎉 Meta atingida! Carro protegido.</span>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="mt-5 flex flex-col sm:grid sm:grid-cols-2 gap-2.5">
          <Button
            variante="secundario"
            onClick={() => setModalAporteAberto(true)}
            icone={<Plus className="size-4" />}
            className="w-full justify-center"
          >
            Aportar Valor
          </Button>
          <Button
            variante="primario"
            onClick={() => setModalGastoAberto(true)}
            icone={<Wrench className="size-4" />}
            className="w-full justify-center"
          >
            Gastar da Reserva
          </Button>
        </div>
      </Card>

      {/* Informações de Proteção */}
      <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
        <h3 className="font-bold text-sm text-texto-1 flex items-center gap-2">
          <Sparkles className="size-4 text-laranja-400" />
          Como funciona a sua Reserva?
        </h3>
        <div className="space-y-2 text-xs text-texto-2">
          <p>
            • <strong>Depósito diário:</strong> No fechamento de cada dia rodado, o sistema sugere guardar{' '}
            <strong>{formatarMoeda(depositoDiarioAtual)}</strong> para não pesar de uma só vez.
          </p>
          <p>
            • <strong>Uso inteligente:</strong> Quando precisar da oficina, o valor é debitado primeiro desta reserva. Se a conta for maior que o saldo guardado, o restante sai do caixa normal sem travar seu dia.
          </p>
        </div>
      </Card>

      {/* Modal de Aporte Avulso */}
      <Modal
        aberto={modalAporteAberto}
        aoFechar={() => setModalAporteAberto(false)}
        titulo="Aportar na Manutenção"
        descricao="Transfira um valor do Caixa do Dia para guardar na reserva."
        rodape={
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalAporteAberto(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleConfirmarAporte} carregando={transferindo} className="w-full sm:w-auto justify-center">
              Confirmar Aporte
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <MoneyInput
            rotulo="Valor a transferir"
            valor={valorAporte}
            onValorChange={setValorAporte}
            grande
          />
          <p className="text-xs text-texto-3">
            Disponível no Caixa do Dia:{' '}
            <strong className="text-texto-1 font-mono">{formatarMoeda(saldoPrincipal)}</strong>
          </p>
        </div>
      </Modal>

      {/* Modal de Gasto com Oficina */}
      <Modal
        aberto={modalGastoAberto}
        aoFechar={() => setModalGastoAberto(false)}
        titulo="Gastar da Reserva"
        descricao="Registre pagamentos de mecânico, pneus, peças ou revisão."
        rodape={
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalGastoAberto(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleConfirmarGasto} carregando={gastando} className="w-full sm:w-auto justify-center">
              Registrar Pagamento
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <MoneyInput
            rotulo="Valor gasto na oficina"
            valor={valorGasto}
            onValorChange={setValorGasto}
            grande
          />

          <Input
            rotulo="Descrição do serviço ou peça"
            placeholder="Ex: Troca de 2 pneus dianteiros, troca de óleo 5w30"
            value={descGasto}
            onChange={(e) => setDescGasto(e.target.value)}
          />

          {valorGasto > saldoManutencao && (
            <div className="p-3 bg-laranja-500/10 border border-laranja-500/30 rounded-md text-xs text-laranja-400">
              💡 O serviço custa mais que o saldo da reserva ({formatarMoeda(saldoManutencao)}). O excedente de{' '}
              <strong>{formatarMoeda(valorGasto - saldoManutencao)}</strong> será debitado automaticamente do Caixa do Dia.
            </div>
          )}
        </div>
      </Modal>

      {/* Modal de Configuração da Reserva */}
      <Modal
        aberto={modalConfigAberto}
        aoFechar={() => setModalConfigAberto(false)}
        titulo="Configurar Reserva"
        descricao="Ajuste o valor alvo e o depósito diário sugerido."
        rodape={
          <div className="flex flex-col-reverse sm:flex-row gap-2.5 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalConfigAberto(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleSalvarConfig} className="w-full sm:w-auto justify-center">
              Salvar Alterações
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <MoneyInput
            rotulo="Meta total da reserva (alvo)"
            valor={novaMeta}
            onValorChange={setNovaMeta}
          />

          <MoneyInput
            rotulo="Depósito sugerido por dia rodado"
            valor={novoDepositoDiario}
            onValorChange={setNovoDepositoDiario}
          />
        </div>
      </Modal>
    </div>
  );
};
