import { useId, useRef, type KeyboardEvent } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export type Aba<T extends string> = { valor: T; rotulo: string };

type TabsProps<T extends string> = {
  abas: Aba<T>[];
  valor: T;
  onMudar: (valor: T) => void;
  rotulo: string;
  className?: string;
};

/** Abas com indicador deslizante e navegação por setas (WAI-ARIA tabs). */
export function Tabs<T extends string>({ abas, valor, onMudar, rotulo, className }: TabsProps<T>) {
  const grupo = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const aoTeclar = (e: KeyboardEvent<HTMLDivElement>) => {
    const atual = abas.findIndex((a) => a.valor === valor);
    let proximo: number;
    if (e.key === 'ArrowRight') proximo = (atual + 1) % abas.length;
    else if (e.key === 'ArrowLeft') proximo = (atual - 1 + abas.length) % abas.length;
    else if (e.key === 'Home') proximo = 0;
    else if (e.key === 'End') proximo = abas.length - 1;
    else return;
    e.preventDefault();
    onMudar(abas[proximo].valor);
    refs.current[proximo]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={rotulo}
      onKeyDown={aoTeclar}
      className={cn('flex gap-1 rounded-md bg-bg-1 border border-line p-1 overflow-x-auto', className)}
    >
      {abas.map((aba, i) => {
        const ativa = aba.valor === valor;
        return (
          <button
            key={aba.valor}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={ativa}
            tabIndex={ativa ? 0 : -1}
            onClick={() => onMudar(aba.valor)}
            className={cn(
              'relative flex-1 min-h-11 px-4 rounded-sm text-sm font-semibold whitespace-nowrap transition-colors',
              ativa ? 'text-white' : 'text-texto-2 hover:text-texto-1',
            )}
          >
            {ativa && (
              <motion.span
                layoutId={`aba-${grupo}`}
                aria-hidden
                className="absolute inset-0 rounded-sm bg-[linear-gradient(135deg,var(--red-500),var(--orange-500))] shadow-[0_4px_16px_rgba(255,90,0,0.35)]"
                transition={{ type: 'spring', stiffness: 400, damping: 34 }}
              />
            )}
            <span className="relative">{aba.rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}
