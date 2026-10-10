import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/cn';

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Obrigatório: descreve a ação para leitores de tela. */
  rotulo: string;
  icone: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { rotulo, icone, className, type = 'button', ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={rotulo}
      title={rotulo}
      className={cn('btn btn-icone [&>svg]:size-5', className)}
      {...resto}
    >
      {icone}
    </button>
  );
});

type FabProps = ButtonHTMLAttributes<HTMLButtonElement> & { rotulo: string };

/** Botão central "+" (PRD 8.1). */
export const Fab = forwardRef<HTMLButtonElement, FabProps>(function Fab(
  { rotulo, className, type = 'button', ...resto },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={rotulo}
      title={rotulo}
      className={cn('btn btn-fab', className)}
      {...resto}
    >
      <Plus aria-hidden className="size-8" strokeWidth={2.6} />
    </button>
  );
});
