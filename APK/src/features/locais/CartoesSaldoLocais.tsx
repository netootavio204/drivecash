import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wallet,
  Smartphone,
  Building2,
  ArrowRightLeft,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Estados';
import { formatarMoeda } from '@/lib/money';
import { useLocaisDinheiro } from './api';
import { TransferenciaModal } from './TransferenciaModal';

export function CartoesSaldoLocais() {
  const navigate = useNavigate();
  const { data: locais = [], isLoading } = useLocaisDinheiro();
  const [modalTransferenciaAberto, setModalTransferenciaAberto] = useState(false);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
        <Skeleton className="h-20 w-full rounded-md" />
      </div>
    );
  }

  // Identifica o App 99 para checagem de saldo negativo
  const localApp = locais.find((l) => l.tipo === 'app');
  const appNegativo = (localApp?.saldo_centavos ?? 0) < 0;

  // Total acumulado em todos os locais
  const totalCentavos = locais.reduce((acc, l) => acc + (l.saldo_centavos || 0), 0);

  function obterIconeLocal(tipo: string) {
    switch (tipo) {
      case 'bolso':
        return <Wallet className="size-3.5 text-emerald-400" />;
      case 'app':
        return <Smartphone className="size-3.5 text-amber-400" />;
      default:
        return <Building2 className="size-3.5 text-blue-400" />;
    }
  }

  return (
    <div className="space-y-3">
      {/* Alerta Discreto de App 99 Negativo (Decisão V2.3) */}
      {appNegativo && (
        <div className="p-2.5 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0 text-negativo animate-pulse" />
            <span>
              Saldo no <strong>App 99 negativo ({formatarMoeda(localApp?.saldo_centavos ?? 0)})</strong>. As corridas recebidas no app irão abater esse saldo.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setModalTransferenciaAberto(true)}
            className="text-[11px] font-bold text-negativo hover:underline shrink-0"
          >
            Fazer recarga
          </button>
        </div>
      )}

      {/* Cabeçalho dos locais de dinheiro com ação de transferir */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wider text-texto-3">
            Onde está seu dinheiro
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-bg-2 border border-line text-texto-2 font-medium">
            Total: {formatarMoeda(totalCentavos)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalTransferenciaAberto(true)}
            className="text-xs font-bold text-laranja-400 hover:text-laranja-300 flex items-center gap-1 transition-colors"
          >
            <ArrowRightLeft className="size-3.5" />
            <span>Transferir</span>
          </button>
          <span className="text-line">•</span>
          <button
            type="button"
            onClick={() => navigate('/meu-dinheiro')}
            className="text-xs font-bold text-texto-2 hover:text-texto-1 flex items-center gap-0.5 transition-colors"
          >
            <span>Ver tudo</span>
            <ChevronRight className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Grade de cartões de saldo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {locais.map((local) => {
          const isNegativo = (local.saldo_centavos || 0) < 0;
          return (
            <Card
              key={local.id}
              className={`p-3 bg-bg-2 border transition-all cursor-pointer hover:border-laranja-500/40 relative overflow-hidden ${
                isNegativo ? 'border-negativo/40 bg-negativo/5' : 'border-line/70'
              }`}
              onClick={() => navigate('/meu-dinheiro')}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  {obterIconeLocal(local.tipo)}
                  <span className="text-xs font-semibold text-texto-2 truncate">
                    {local.nome}
                  </span>
                </div>
              </div>

              <div
                className={`numero text-base sm:text-lg font-black tracking-tight ${
                  isNegativo ? 'text-negativo font-extrabold' : 'text-texto-1'
                }`}
              >
                {formatarMoeda(local.saldo_centavos || 0)}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal de Transferência */}
      <TransferenciaModal
        aberto={modalTransferenciaAberto}
        aoFechar={() => setModalTransferenciaAberto(false)}
        locais={locais}
      />
    </div>
  );
}
