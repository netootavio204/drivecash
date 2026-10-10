import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'placeholder'> & {
  rotulo: string;
  erro?: string;
  ajuda?: string;
};

/** Campo de texto com rótulo flutuante (PRD 9.5). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { rotulo, erro, ajuda, id, className, ...resto },
  ref,
) {
  const autoId = useId();
  const campoId = id ?? autoId;
  const descId = erro || ajuda ? `${campoId}-desc` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <div className="relative">
        <input
          ref={ref}
          id={campoId}
          placeholder=" "
          aria-invalid={erro ? true : undefined}
          aria-describedby={descId}
          className="campo peer"
          {...resto}
        />
        <label
          htmlFor={campoId}
          className={cn(
            'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-texto-3 transition-all duration-150',
            'peer-focus:top-4 peer-focus:text-xs peer-focus:text-laranja-400',
            'peer-[:not(:placeholder-shown)]:top-4 peer-[:not(:placeholder-shown)]:text-xs',
          )}
        >
          {rotulo}
        </label>
      </div>
      {(erro || ajuda) && (
        <p
          id={descId}
          className={cn('text-xs px-1', erro ? 'text-negativo' : 'text-texto-3')}
          role={erro ? 'alert' : undefined}
        >
          {erro ?? ajuda}
        </p>
      )}
    </div>
  );
});
