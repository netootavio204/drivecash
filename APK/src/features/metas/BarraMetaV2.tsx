import React, { useMemo } from 'react';
import { formatarMoeda } from '@/lib/money';

export type BarraMetaV2Props = {
  titulo: string;
  valorAlvo: number;
  valorAlcancado: number;
  pctBronze?: number;
  pctPrata?: number;
  pctOuro?: number;
  compacto?: boolean;
  className?: string;
  onClick?: () => void;
};

/**
 * Barra de progresso contínuo de metas com marcos 🥉🥈🥇 (DriveCash V2)
 * Garante preenchimento contínuo, precisão decimal e largura mínima visível.
 */
export const BarraMetaV2: React.FC<BarraMetaV2Props> = ({
  titulo,
  valorAlvo,
  valorAlcancado,
  pctBronze = 70,
  pctPrata = 100,
  pctOuro = 130,
  compacto = false,
  className = '',
  onClick,
}) => {
  const alvo = Math.max(1, valorAlvo);
  const alcancado = Math.max(0, valorAlcancado);

  // Porcentagem real atingida (com 1 casa decimal)
  const pctReal = (alcancado / alvo) * 100;
  const pctFormatado = pctReal.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });

  // Posição na barra (escala 0 até pctOuro = 130%)
  const pctBarra = (pctReal / pctOuro) * 100;
  // Largura calculada com preenchimento mínimo visível de 2% se houver progresso (> 0)
  const larguraBarra = alcancado > 0 ? Math.max(2, Math.min(100, pctBarra)) : 0;

  // Valores dos marcos em centavos
  const valorBronze = Math.round((alvo * pctBronze) / 100);
  const valorPrata = alvo;
  const valorOuro = Math.round((alvo * pctOuro) / 100);

  // Identificação do nível alcançado
  const nivel = useMemo(() => {
    if (pctReal >= pctOuro) return 'ouro';
    if (pctReal >= pctPrata) return 'prata';
    if (pctReal >= pctBronze) return 'bronze';
    return 'nenhum';
  }, [pctReal, pctBronze, pctPrata, pctOuro]);

  // Mensagem de incentivo / quanto falta
  const mensagemFalta = useMemo(() => {
    if (alcancado < valorBronze) {
      const falta = valorBronze - alcancado;
      return `Falta ${formatarMoeda(falta)} para Bronze 🥉`;
    }
    if (alcancado < valorPrata) {
      const falta = valorPrata - alcancado;
      return `Falta ${formatarMoeda(falta)} para bater a Meta 🥈`;
    }
    if (alcancado < valorOuro) {
      const falta = valorOuro - alcancado;
      return `Falta ${formatarMoeda(falta)} para Ouro 🥇`;
    }
    return '🎉 Meta Ouro superada com sucesso!';
  }, [alcancado, valorBronze, valorPrata, valorOuro]);

  return (
    <div
      onClick={onClick}
      className={`space-y-1.5 ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Linha de Título, Valores e % */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="font-bold text-texto-1 tracking-wide">{titulo}</span>
          <span className="text-texto-3 font-mono truncate">
            {formatarMoeda(alcancado)} / {formatarMoeda(alvo)}
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0 font-mono font-bold">
          <span
            className={
              nivel === 'ouro'
                ? 'text-amber-400 font-black'
                : nivel === 'prata'
                ? 'text-slate-200'
                : nivel === 'bronze'
                ? 'text-amber-600'
                : 'text-laranja-400'
            }
          >
            {pctFormatado}%
          </span>
        </div>
      </div>

      {/* Trilho da Barra com Marcos */}
      <div className={`relative ${compacto ? 'h-2.5' : 'h-3.5'} w-full bg-bg-3 rounded-full overflow-hidden border border-line/40`}>
        {/* Barra Preenchida com Gradiente Conforme Nível */}
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            nivel === 'ouro'
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
              : nivel === 'prata'
              ? 'bg-gradient-to-r from-laranja-500 to-slate-200 shadow-[0_0_10px_rgba(255,122,0,0.5)]'
              : nivel === 'bronze'
              ? 'bg-gradient-to-r from-amber-700 to-laranja-500'
              : 'bg-gradient-to-r from-laranja-600 to-laranja-500'
          }`}
          style={{ width: `${larguraBarra}%` }}
        />

        {/* Linha de Marco 🥉 Bronze (70%) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-amber-600/70 z-10"
          style={{ left: `${(pctBronze / pctOuro) * 100}%` }}
          title={`Bronze (${pctBronze}%)`}
        />

        {/* Linha de Marco 🥈 Prata (100%) */}
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-white/80 z-10"
          style={{ left: `${(pctPrata / pctOuro) * 100}%` }}
          title={`Prata (${pctPrata}%)`}
        />
      </div>

      {/* Subtexto com mensagem ou marcos */}
      {!compacto ? (
        <div className="flex items-center justify-between text-[11px] text-texto-3 pt-0.5">
          <span className="text-laranja-400 font-medium">{mensagemFalta}</span>
          <div className="flex items-center gap-2 font-mono text-[10px]">
            <span title="Bronze">🥉 {pctBronze}%</span>
            <span title="Meta">🥈 100%</span>
            <span title="Ouro">🥇 {pctOuro}%</span>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between text-[10px] text-texto-3">
          <span className="text-texto-3 truncate">{mensagemFalta}</span>
        </div>
      )}
    </div>
  );
};
