import { forwardRef, useCallback, useId, type ChangeEvent, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/cn';
import { formatarMoeda, VALOR_MAXIMO_CENTAVOS } from '@/lib/money';

type MoneyInputProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'value' | 'onChange' | 'type' | 'defaultValue'
> & {
  /** Valor em centavos (inteiro). */
  valor: number;
  onValorChange: (centavos: number) => void;
  rotulo: string;
  /** Mostra o valor grande, centralizado (uso em sheets de lançamento). */
  grande?: boolean;
  maximo?: number;
  erro?: string;
};

/**
 * Campo de dinheiro com máscara estilo banco (PRD RN-01):
 * digite só números e a vírgula "anda" — 1 → 0,01 · 12 → 0,12 · 12345 → 123,45.
 * Apagar remove o último dígito.
 */
export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(function MoneyInput(
  {
    valor,
    onValorChange,
    rotulo,
    grande = false,
    maximo = VALOR_MAXIMO_CENTAVOS,
    erro,
    id,
    className,
    ...resto
  },
  ref,
) {
  const autoId = useId();
  const campoId = id ?? autoId;
  const erroId = erro ? `${campoId}-erro` : undefined;

  const aoMudar = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const digitos = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
      const novo = digitos === '' ? 0 : Number(digitos);
      if (!Number.isSafeInteger(novo) || novo > maximo) {
        // Mantém o valor anterior se passar do máximo.
        e.target.value = formatarMoeda(valor);
        return;
      }
      onValorChange(novo);
    },
    [maximo, onValorChange, valor],
  );

  /** Mantém o cursor sempre no fim (a máscara trabalha da direita para a esquerda). */
  const cursorNoFim = (e: { currentTarget: HTMLInputElement }) => {
    const el = e.currentTarget;
    const fim = el.value.length;
    if (el.selectionStart !== fim || el.selectionEnd !== fim) el.setSelectionRange(fim, fim);
  };

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={campoId}
        className={cn(
          'text-xs font-semibold uppercase tracking-wide text-texto-2',
          grande && 'text-center',
        )}
      >
        {rotulo}
      </label>
      <input
        ref={ref}
        id={campoId}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        value={formatarMoeda(valor)}
        onChange={aoMudar}
        onFocus={cursorNoFim}
        onClick={cursorNoFim}
        onKeyUp={cursorNoFim}
        aria-invalid={erro ? true : undefined}
        aria-describedby={erroId}
        className={cn(
          'numero w-full bg-bg-1 border border-line text-texto-1 transition-[border-color,box-shadow] duration-200',
          'focus:outline-none focus:border-laranja-500 focus:shadow-[0_0_0_3px_rgba(255,122,0,0.18)]',
          'aria-[invalid=true]:border-negativo',
          grande
            ? 'h-20 rounded-md text-center text-display font-bold'
            : 'h-14 rounded-sm px-4 text-xl font-semibold',
        )}
        {...resto}
      />
      {erro && (
        <p id={erroId} role="alert" className="text-xs px-1 text-negativo">
          {erro}
        </p>
      )}
    </div>
  );
});
