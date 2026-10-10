import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

type ChipProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  selecionado?: boolean;
  icone?: ReactNode;
};

/** Chip selecionável (plataformas, filtros, valores rápidos). */
export function Chip({ selecionado = false, icone, className, children, ...resto }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={selecionado}
      className={cn(
        'inline-flex items-center gap-1.5 min-h-10 px-4 rounded-full text-sm font-semibold',
        'border transition-[background-color,border-color,box-shadow,transform] duration-150',
        'active:scale-95 disabled:opacity-45 disabled:pointer-events-none',
        selecionado
          ? 'text-white border-transparent bg-[linear-gradient(135deg,var(--red-500),var(--orange-500))] shadow-[0_4px_16px_rgba(255,90,0,0.35)]'
          : 'text-texto-2 bg-bg-3 border-line hover:border-laranja-500/60 hover:text-texto-1',
        className,
      )}
      {...resto}
    >
      {icone && (
        <span aria-hidden className="[&>svg]:size-4">
          {icone}
        </span>
      )}
      {children}
    </button>
  );
}

type BadgeProps = {
  tom?: 'neutro' | 'marca' | 'positivo' | 'negativo' | 'aviso';
  children: ReactNode;
  className?: string;
};

export function Badge({ tom = 'neutro', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold',
        tom === 'neutro' && 'bg-bg-3 text-texto-2 border border-line',
        tom === 'marca' && 'bg-laranja-500/15 text-laranja-400 border border-laranja-500/30',
        tom === 'positivo' && 'bg-positivo/12 text-positivo border border-positivo/30',
        tom === 'negativo' && 'bg-negativo/12 text-negativo border border-negativo/30',
        tom === 'aviso' && 'bg-aviso/12 text-aviso border border-aviso/30',
        className,
      )}
    >
      {children}
    </span>
  );
}
