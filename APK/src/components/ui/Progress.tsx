import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type Marco = { percentual: number; tipo: 'bronze' | 'prata' | 'ouro' };

/** Marcos padrão do PRD (70% / 100% / 130%). */
export const MARCOS_PADRAO: Marco[] = [
  { percentual: 70, tipo: 'bronze' },
  { percentual: 100, tipo: 'prata' },
  { percentual: 130, tipo: 'ouro' },
];

const COR_MARCO = { bronze: 'var(--bronze)', prata: 'var(--prata)', ouro: 'var(--ouro)' };

type ProgressRingProps = {
  /** Percentual atingido (pode passar de 100). */
  percentual: number;
  tamanho?: number;
  espessura?: number;
  marcos?: Marco[];
  /** Percentual que representa a volta completa do anel (padrão: o maior marco). */
  escala?: number;
  rotulo: string;
  className?: string;
};

/** Anel de progresso com marcos 🥉🥈🥇 (PRD 9.6). */
export function ProgressRing({
  percentual,
  tamanho = 140,
  espessura = 12,
  marcos = MARCOS_PADRAO,
  escala,
  rotulo,
  className,
}: ProgressRingProps) {
  const reduzir = useReducedMotion();
  const total = escala ?? Math.max(100, ...marcos.map((m) => m.percentual));
  const raio = (tamanho - espessura) / 2;
  const circ = 2 * Math.PI * raio;
  const fracao = Math.min(Math.max(percentual, 0), total) / total;
  const gradId = `anel-${tamanho}-${espessura}`;
  const valorExibido = Math.round(percentual);

  return (
    <div
      role="progressbar"
      aria-label={rotulo}
      aria-valuemin={0}
      aria-valuemax={total}
      aria-valuenow={valorExibido}
      aria-valuetext={`${valorExibido}%`}
      className={cn('relative inline-grid place-items-center', className)}
      style={{ width: tamanho, height: tamanho }}
    >
      <svg width={tamanho} height={tamanho} className="-rotate-90" aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FF2D2D" />
            <stop offset="100%" stopColor="#FF7A00" />
          </linearGradient>
        </defs>
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke="var(--bg-3)"
          strokeWidth={espessura}
        />
        <motion.circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ * (1 - fracao) }}
          transition={{ duration: reduzir ? 0 : 1.1, ease: [0.22, 1, 0.36, 1] }}
          style={{ filter: 'drop-shadow(0 0 6px rgba(255,122,0,.55))' }}
        />
        {marcos.map((m) => {
          const ang = (Math.min(m.percentual, total) / total) * 2 * Math.PI;
          const x = tamanho / 2 + raio * Math.cos(ang);
          const y = tamanho / 2 + raio * Math.sin(ang);
          const atingido = percentual >= m.percentual;
          return (
            <circle
              key={m.tipo}
              cx={x}
              cy={y}
              r={espessura / 2 + 1}
              fill={atingido ? COR_MARCO[m.tipo] : 'var(--bg-1)'}
              stroke={COR_MARCO[m.tipo]}
              strokeWidth={2}
            />
          );
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">
        <div>
          <div className="numero text-2xl font-bold leading-none">{valorExibido}%</div>
          <div className="mt-1 text-[11px] uppercase tracking-wider text-texto-3">da meta</div>
        </div>
      </div>
    </div>
  );
}

type ProgressBarProps = {
  percentual: number;
  rotulo: string;
  mostrarValor?: boolean;
  className?: string;
};

export function ProgressBar({ percentual, rotulo, mostrarValor = true, className }: ProgressBarProps) {
  const reduzir = useReducedMotion();
  const limitado = Math.min(Math.max(percentual, 0), 100);
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-texto-2">{rotulo}</span>
        {mostrarValor && <span className="numero font-semibold">{Math.round(percentual)}%</span>}
      </div>
      <div
        role="progressbar"
        aria-label={rotulo}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(limitado)}
        className="h-2.5 w-full overflow-hidden rounded-full bg-bg-3"
      >
        <motion.div
          className="h-full rounded-full bg-[linear-gradient(90deg,var(--red-500),var(--orange-500))] shadow-[0_0_12px_rgba(255,122,0,0.5)]"
          initial={{ width: 0 }}
          animate={{ width: `${limitado}%` }}
          transition={{ duration: reduzir ? 0 : 0.8, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
