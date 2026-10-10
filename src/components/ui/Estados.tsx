import type { ReactNode } from 'react';
import { AlertOctagon, Inbox, RotateCw } from 'lucide-react';
import { cn } from '@/lib/cn';
import { textos } from '@/lib/textos';
import { Button } from './Button';

/** Bloco de carregamento com brilho (nunca tela em branco — PRD 8.6). */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn('skeleton h-4 w-full', className)} />;
}

/** Skeleton pronto de um cartão. */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div role="status" aria-label={textos.comum.carregando} className={cn('card p-5 space-y-3', className)}>
      <Skeleton className="h-3 w-1/3" />
      <Skeleton className="h-8 w-2/3" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

type EmptyStateProps = {
  titulo: string;
  descricao?: string;
  icone?: ReactNode;
  acao?: ReactNode;
  className?: string;
};

/** Estado vazio: ícone + frase motivadora + ação (PRD 8.6). */
export function EmptyState({ titulo, descricao, icone, acao, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center text-center gap-4 px-6 py-10', className)}>
      <div className="relative grid size-20 place-items-center rounded-[26px] bg-bg-3 border border-line text-laranja-400 shadow-[0_0_32px_rgba(255,90,0,0.18)]">
        <span aria-hidden className="[&>svg]:size-9">
          {icone ?? <Inbox />}
        </span>
      </div>
      <div className="space-y-1.5 max-w-sm">
        <h2 className="text-lg font-bold text-texto-1">{titulo}</h2>
        {descricao && <p className="text-sm text-texto-2">{descricao}</p>}
      </div>
      {acao}
    </div>
  );
}

type ErrorStateProps = {
  mensagem?: string;
  aoTentarDeNovo?: () => void;
  className?: string;
};

/** Estado de erro: mensagem clara + "Tentar de novo" (PRD 8.6). */
export function ErrorState({
  mensagem = textos.erro.generico,
  aoTentarDeNovo,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center text-center gap-4 px-6 py-10', className)}
    >
      <div className="grid size-20 place-items-center rounded-[26px] bg-negativo/10 border border-negativo/30 text-negativo">
        <AlertOctagon aria-hidden className="size-9" />
      </div>
      <p className="max-w-sm text-texto-1 font-medium">{mensagem}</p>
      {aoTentarDeNovo && (
        <Button variante="secundario" icone={<RotateCw />} onClick={aoTentarDeNovo}>
          {textos.erro.tentarDeNovo}
        </Button>
      )}
    </div>
  );
}
