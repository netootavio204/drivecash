import { forwardRef, useId, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  rotulo: string;
  erro?: string;
  ajuda?: string;
  dica?: string;
};

/** Campo de texto moderno e alinhado (sem sobreposição de texto ou rótulo). */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { rotulo, erro, ajuda, dica, id, className, placeholder, ...resto },
  ref,
) {
  const autoId = useId();
  const campoId = id ?? autoId;
  const textoDescricao = erro || dica || ajuda;
  const descId = textoDescricao ? `${campoId}-desc` : undefined;

  return (
    <div className={cn('flex flex-col gap-1.5 w-full text-left', className)}>
      {rotulo && (
        <label
          htmlFor={campoId}
          className="text-xs font-semibold text-texto-2 uppercase tracking-wider select-none"
        >
          {rotulo}
        </label>
      )}

      <input
        ref={ref}
        id={campoId}
        placeholder={placeholder}
        aria-invalid={erro ? true : undefined}
        aria-describedby={descId}
        className={cn(
          'w-full h-12 px-3.5 rounded-xl bg-bg-2 border border-line text-sm text-texto-1',
          'placeholder:text-texto-3/50 transition-all duration-150',
          'focus:outline-none focus:border-laranja-500 focus:ring-1 focus:ring-laranja-500',
          'hover:border-line/90',
          erro && 'border-negativo focus:border-negativo focus:ring-negativo'
        )}
        {...resto}
      />

      {textoDescricao && (
        <p
          id={descId}
          className={cn(
            'text-[11px] px-1 transition-colors',
            erro ? 'text-negativo font-medium' : 'text-texto-3'
          )}
          role={erro ? 'alert' : undefined}
        >
          {textoDescricao}
        </p>
      )}
    </div>
  );
});
