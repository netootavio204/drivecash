import { Delete } from 'lucide-react';
import { cn } from '@/lib/cn';

type NumericKeypadProps = {
  onDigito: (digito: number) => void;
  onApagar: () => void;
  /** Tecla ",": transforma o valor digitado em reais inteiros (ex.: 32 → R$ 32,00). */
  onVirgula?: () => void;
  desabilitado?: boolean;
  className?: string;
};

const TECLAS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'apagar'] as const;

/** Teclado numérico grande (botões ≥ 56 px) — PRD 8.3. */
export function NumericKeypad({
  onDigito,
  onApagar,
  onVirgula,
  desabilitado = false,
  className,
}: NumericKeypadProps) {
  return (
    <div
      role="group"
      aria-label="Teclado numérico"
      className={cn('grid grid-cols-3 gap-2 select-none', className)}
    >
      {TECLAS.map((tecla) => {
        const ehApagar = tecla === 'apagar';
        const ehVirgula = tecla === ',';
        const rotulo = ehApagar ? 'Apagar último dígito' : ehVirgula ? 'Vírgula' : tecla;
        const aoClicar = () => {
          if (ehApagar) onApagar();
          else if (ehVirgula) onVirgula?.();
          else onDigito(Number(tecla));
        };
        return (
          <button
            key={tecla}
            type="button"
            aria-label={rotulo}
            disabled={desabilitado || (ehVirgula && !onVirgula)}
            onClick={aoClicar}
            className={cn(
              'numero h-14 sm:h-16 rounded-md text-2xl font-semibold',
              'bg-bg-3 border border-line text-texto-1',
              'transition-[transform,background-color,border-color,box-shadow] duration-150',
              'hover:border-laranja-500/60 hover:bg-[#232328]',
              'active:scale-95 active:bg-[#2a2a30] active:shadow-[0_0_18px_rgba(255,122,0,0.35)]',
              'disabled:opacity-40 disabled:pointer-events-none',
              ehApagar && 'text-laranja-400',
            )}
          >
            {ehApagar ? <Delete aria-hidden className="mx-auto size-6" /> : tecla}
          </button>
        );
      })}
    </div>
  );
}
