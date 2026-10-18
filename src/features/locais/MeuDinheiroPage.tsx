import { useState } from 'react';
import {
  Wallet,
  Smartphone,
  Building2,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  Settings,
  HelpCircle,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Estados';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { formatarMoeda } from '@/lib/money';
import { formatarData } from '@/lib/datas';
import {
  useLocaisDinheiro,
  useConciliacaoLocais,
  useHistoricoTransferencias,
  useAtualizarSaldoInicial,
} from './api';
import { TransferenciaModal } from './TransferenciaModal';
import type { LocalComSaldo } from './types';

export function MeuDinheiroPage() {
  const { data: locais = [], isLoading: carregandoLocais } = useLocaisDinheiro();
  const { data: conciliacao } = useConciliacaoLocais();
  const { data: transferencias = [], isLoading: carregandoTransf } = useHistoricoTransferencias();
  const { mutateAsync: atualizarSaldoInicial, isPending: salvandoSaldoInicial } = useAtualizarSaldoInicial();

  const [modalTransfAberto, setModalTransfAberto] = useState(false);
  const [localAjustando, setLocalAjustando] = useState<LocalComSaldo | null>(null);
  const [novoSaldoInicial, setNovoSaldoInicial] = useState<number>(0);

  const totalCentavos = locais.reduce((acc, l) => acc + (l.saldo_centavos || 0), 0);
  const localApp = locais.find((l) => l.tipo === 'app');
  const appNegativo = (localApp?.saldo_centavos ?? 0) < 0;

  function obterIcone(tipo: string) {
    switch (tipo) {
      case 'bolso':
        return <Wallet className="size-5 text-emerald-400" />;
      case 'app':
        return <Smartphone className="size-5 text-amber-400" />;
      default:
        return <Building2 className="size-5 text-blue-400" />;
    }
  }

  const abrirAjusteSaldoInicial = (local: LocalComSaldo) => {
    setLocalAjustando(local);
    setNovoSaldoInicial(local.saldo_inicial_centavos || 0);
  };

  const salvarAjuste = async () => {
    if (!localAjustando) return;
    try {
      await atualizarSaldoInicial({
        localId: localAjustando.id,
        saldoInicialCentavos: novoSaldoInicial,
      });
      toast.sucesso(`Saldo inicial de ${localAjustando.nome} atualizado!`);
      setLocalAjustando(null);
    } catch (e: any) {
      toast.erro(e.message || 'Erro ao atualizar saldo inicial');
    }
  };

  if (carregandoLocais) {
    return (
      <div className="space-y-4 max-w-4xl mx-auto p-4">
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-32 w-full rounded-md" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Skeleton className="h-28 w-full rounded-md" />
          <Skeleton className="h-28 w-full rounded-md" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 pb-20">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line pb-4">
        <div>
          <h1 className="text-2xl font-black text-texto-1 tracking-tight flex items-center gap-2">
            <Wallet className="size-6 text-laranja-500" />
            Meu Dinheiro
          </h1>
          <p className="text-xs text-texto-2 mt-1">
            Acompanhe exatamente onde está cada real: no bolso, no app da 99 e nos seus bancos.
          </p>
        </div>

        <Button
          variante="primario"
          icone={<ArrowRightLeft className="size-4" />}
          onClick={() => setModalTransfAberto(true)}
        >
          Nova Transferência
        </Button>
      </div>

      {/* Alerta de App Negativo */}
      {appNegativo && (
        <div className="p-3.5 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-5 shrink-0 text-negativo" />
            <div>
              <p className="font-bold">Saldo no App 99 Negativo ({formatarMoeda(localApp?.saldo_centavos ?? 0)})</p>
              <p className="text-[11px] text-negativo/90 mt-0.5">
                Normal quando a taxa da plataforma supera as retenções em corridas no cartão. Os próximos recebimentos irão compensar.
              </p>
            </div>
          </div>
          <Button
            variante="primario"
            className="text-xs h-8 px-3 shrink-0"
            onClick={() => setModalTransfAberto(true)}
          >
            Fazer Recarga
          </Button>
        </div>
      )}

      {/* Card Destaque: Patrimônio Líquido em Trânsito / Total Geral */}
      <Card variante="destaque" className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-texto-3">
              Total Acumulado em Todos os Locais
            </span>
            <div className="numero text-3xl sm:text-4xl font-black text-texto-1 mt-1">
              {formatarMoeda(totalCentavos)}
            </div>
            <p className="text-xs text-texto-2 mt-1">
              Soma do seu bolso + saldo disponível da 99 + contas bancárias.
            </p>
          </div>

          {/* Status de Conciliação */}
          <div className="p-3 rounded-lg bg-bg-2 border border-line flex items-center gap-2.5 text-xs">
            {conciliacao && conciliacao.diferenca_centavos === 0 ? (
              <>
                <CheckCircle2 className="size-5 text-positivo shrink-0" />
                <div>
                  <p className="font-bold text-positivo">Tudo Conferido ✔</p>
                  <p className="text-[11px] text-texto-3">Locais batem 100% com os caixas</p>
                </div>
              </>
            ) : (
              <>
                <HelpCircle className="size-5 text-laranja-400 shrink-0" />
                <div>
                  <p className="font-bold text-texto-1">Conciliação Ativa</p>
                  <p className="text-[11px] text-texto-3">Histórico anterior preservado com segurança</p>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>

      {/* Grade de Contas / Locais */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-texto-3 mb-3">
          Contas e Saldos Detalhados
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {locais.map((local) => {
            const isNegativo = (local.saldo_centavos || 0) < 0;
            return (
              <Card
                key={local.id}
                className={`p-4 bg-bg-2 border transition-all ${
                  isNegativo ? 'border-negativo/40 bg-negativo/5' : 'border-line/70'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-md bg-bg-1 border border-line">
                      {obterIcone(local.tipo)}
                    </div>
                    <div>
                      <h3 className="font-black text-sm text-texto-1">{local.nome}</h3>
                      <span className="text-[11px] text-texto-3 capitalize">
                        {local.tipo === 'app' ? 'Saldo no Aplicativo' : local.tipo}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => abrirAjusteSaldoInicial(local)}
                    className="p-1.5 rounded-md hover:bg-bg-1 text-texto-3 hover:text-texto-1 transition-colors"
                    title="Ajustar saldo inicial"
                  >
                    <Settings className="size-4" />
                  </button>
                </div>

                <div className="flex items-baseline justify-between pt-2 border-t border-line/40">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-texto-3 tracking-wider block">
                      Saldo Atual
                    </span>
                    <span
                      className={`numero text-xl font-black ${
                        isNegativo ? 'text-negativo' : 'text-texto-1'
                      }`}
                    >
                      {formatarMoeda(local.saldo_centavos || 0)}
                    </span>
                  </div>

                  {local.saldo_inicial_centavos !== 0 && (
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-semibold text-texto-3 tracking-wider block">
                        Abertura
                      </span>
                      <span className="numero text-xs font-medium text-texto-2">
                        {formatarMoeda(local.saldo_inicial_centavos)}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Histórico Recente de Transferências */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-texto-3">
            Últimas Transferências Entre Locais
          </h2>
          {transferencias.length > 0 && (
            <span className="text-xs text-texto-3 font-medium">
              Mostrando as {transferencias.length} mais recentes
            </span>
          )}
        </div>

        {carregandoTransf ? (
          <Skeleton className="h-32 w-full rounded-md" />
        ) : transferencias.length === 0 ? (
          <Card className="p-6 text-center bg-bg-2 border-line/70">
            <ArrowRightLeft className="size-8 mx-auto text-texto-3/50 mb-2" />
            <p className="text-sm font-semibold text-texto-2">
              Nenhuma transferência registrada ainda.
            </p>
            <p className="text-xs text-texto-3 mt-1">
              Quando você fizer um saque do app para o banco ou depósito do bolso, o registro aparecerá aqui.
            </p>
            <Button
              variante="secundario"
              className="mt-4 text-xs h-8"
              onClick={() => setModalTransfAberto(true)}
            >
              Fazer primeira transferência
            </Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {transferencias.map((t) => (
              <Card
                key={t.id}
                className="p-3 bg-bg-2 border-line/60 flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-full bg-laranja-500/10 text-laranja-400 shrink-0">
                    <ArrowRightLeft className="size-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-texto-1 truncate">
                      {t.local_origem?.nome || 'Origem'} ➔ {t.local_destino?.nome || 'Destino'}
                    </p>
                    <p className="text-[11px] text-texto-3">
                      {formatarData(new Date(t.criado_em), 'dd/MM/yyyy HH:mm')}
                      {t.observacao && ` • ${t.observacao}`}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <p className="numero font-bold text-texto-1 text-sm">
                    {formatarMoeda(t.valor_centavos)}
                  </p>
                  {t.taxa_centavos > 0 && (
                    <p className="text-[10px] text-negativo font-medium">
                      taxa: −{formatarMoeda(t.taxa_centavos)}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Transferência */}
      <TransferenciaModal
        aberto={modalTransfAberto}
        aoFechar={() => setModalTransfAberto(false)}
        locais={locais}
      />

      {/* Modal de Ajuste de Saldo Inicial */}
      {localAjustando && (
        <Modal
          aberto={!!localAjustando}
          aoFechar={() => setLocalAjustando(null)}
          titulo={`Saldo Inicial: ${localAjustando.nome}`}
          descricao="Defina o valor que você já possuía nesta conta ao começar a usar o DriveCash."
        >
          <div className="space-y-4">
            <MoneyInput
              rotulo="Saldo de Abertura"
              valor={novoSaldoInicial}
              onValorChange={setNovoSaldoInicial}
              grande
              autoFocus
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-line">
              <Button
                variante="fantasma"
                onClick={() => setLocalAjustando(null)}
                disabled={salvandoSaldoInicial}
              >
                Cancelar
              </Button>
              <Button
                variante="primario"
                onClick={salvarAjuste}
                carregando={salvandoSaldoInicial}
              >
                Salvar Saldo Inicial
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
