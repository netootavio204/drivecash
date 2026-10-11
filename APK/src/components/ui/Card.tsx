import type { HTMLAttributes, ReactNode } from 'react';
import { TrendingDown, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatarMoeda } from '@/lib/money';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  variante?: 'padrao' | 'destaque' | 'vidro';
  as?: 'div' | 'section' | 'article';
};

export function Card({ variante = 'padrao', as: Tag = 'div', className, ...resto }: CardProps) {
  return (
    <Tag
      className={cn(
        variante === 'padrao' && 'card',
        variante === 'destaque' && 'card card-destaque',
        variante === 'vidro' && 'card-vidro',
        'p-5',
        className,
      )}
      {...resto}
    />
  );
}

type StatCardProps = {
  rotulo: string;
  /** Valor em centavos (exibido como moeda) OU texto livre. */
  centavos?: number;
  texto?: string;
  icone?: ReactNode;
  /** Variação em centavos: mostra seta e sinal (+/−), nunca só cor. */
  variacao?: number;
  tom?: 'neutro' | 'positivo' | 'negativo' | 'marca';
  className?: string;
};

export function StatCard({
  rotulo,
  centavos,
  texto,
  icone,
  variacao,
  tom = 'neutro',
  className,
}: StatCardProps) {
  const valor = centavos !== undefined ? formatarMoeda(centavos) : (texto ?? '—');
  return (
    <div className={cn('card p-4 flex flex-col gap-2 min-w-0', className)}>
      <div className="flex items-center gap-2 text-texto-2 text-xs font-semibold uppercase tracking-wide">
        {icone && (
          <span aria-hidden className="text-laranja-400 [&>svg]:size-4">
            {icone}
          </span>
        )}
        <span className="truncate">{rotulo}</span>
      </div>
      <div
        className={cn(
          'numero text-xl sm:text-2xl font-bold truncate',
          tom === 'positivo' && 'text-positivo',
          tom === 'negativo' && 'text-negativo',
          tom === 'marca' && 'texto-gradiente',
        )}
      >
        {valor}
      </div>
      {variacao !== undefined && variacao !== 0 && (
        <div
          className={cn(
            'numero flex items-center gap-1 text-xs font-semibold',
            variacao > 0 ? 'text-positivo' : 'text-negativo',
          )}
        >
          {variacao > 0 ? (
            <TrendingUp aria-hidden className="size-3.5" />
          ) : (
            <TrendingDown aria-hidden className="size-3.5" />
          )}
          {formatarMoeda(variacao, { comSinal: true })}
        </div>
      )}
    </div>
  );
}
