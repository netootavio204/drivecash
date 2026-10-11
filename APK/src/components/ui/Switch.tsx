import { useId } from 'react';
import { cn } from '@/lib/cn';

type SwitchProps = {
  ligado: boolean;
  onMudar: (ligado: boolean) => void;
  rotulo: string;
  descricao?: string;
  desabilitado?: boolean;
  className?: string;
};

/** Interruptor liga/desliga acessível (role="switch"). */
export function Switch({
  ligado,
  onMudar,
  rotulo,
  descricao,
  desabilitado = false,
  className,
}: SwitchProps) {
  const id = useId();
  return (
    <div className={cn('flex items-center justify-between gap-4 min-h-12', className)}>
      <div className="min-w-0">
        <label htmlFor={id} className="block font-semibold text-texto-1 cursor-pointer">
          {rotulo}
        </label>
        {descricao && <p className="text-sm text-texto-3">{descricao}</p>}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={ligado}
        disabled={desabilitado}
        onClick={() => onMudar(!ligado)}
        className={cn(
          'relative shrink-0 h-8 w-14 rounded-full border transition-[background-color,border-color,box-shadow] duration-200',
          'disabled:opacity-45 disabled:cursor-not-allowed',
          ligado
            ? 'border-transparent bg-[linear-gradient(135deg,var(--red-500),var(--orange-500))] shadow-[0_0_16px_rgba(255,122,0,0.4)]'
            : 'border-line bg-bg-3',
        )}
      >
        <span
          aria-hidden
          className={cn(
            'absolute top-1/2 -translate-y-1/2 size-6 rounded-full bg-white shadow transition-[left] duration-200',
            ligado ? 'left-[calc(100%-1.75rem)]' : 'left-1',
          )}
        />
      </button>
    </div>
  );
}
