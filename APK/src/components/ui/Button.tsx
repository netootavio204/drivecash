import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/cn';

export type VarianteBotao = 'primario' | 'secundario' | 'perigo' | 'fantasma';
export type TamanhoBotao = 'md' | 'lg';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: VarianteBotao;
  tamanho?: TamanhoBotao;
  carregando?: boolean;
  bloco?: boolean;
  icone?: ReactNode;
  iconeDireita?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variante = 'primario',
    tamanho = 'md',
    carregando = false,
    bloco = false,
    icone,
    iconeDireita,
    disabled,
    className,
    children,
    type = 'button',
    ...resto
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || carregando}
      aria-busy={carregando || undefined}
      className={cn(
        'btn',
        `btn-${variante}`,
        tamanho === 'lg' && 'btn-lg',
        bloco && 'btn-bloco',
        className,
      )}
      {...resto}
    >
      {carregando ? (
        <Loader2 aria-hidden className="spinner size-5" />
      ) : (
        icone && <span aria-hidden className="inline-flex [&>svg]:size-5">{icone}</span>
      )}
      <span className={cn(carregando && 'opacity-90')}>{children}</span>
      {!carregando && iconeDireita && (
        <span aria-hidden className="inline-flex [&>svg]:size-5">
          {iconeDireita}
        </span>
      )}
    </button>
  );
});
