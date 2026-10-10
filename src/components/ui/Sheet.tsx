import { useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion, type PanInfo } from 'framer-motion';
import { X } from 'lucide-react';
import { useSobreposicao } from '@/hooks/useSobreposicao';
import { cn } from '@/lib/cn';

type SheetProps = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  rodape?: ReactNode;
  className?: string;
};

/** Bottom sheet com arraste para fechar (mobile) — no desktop vira painel central. */
export function Sheet({ aberto, aoFechar, titulo, children, rodape, className }: SheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  useSobreposicao(aberto, aoFechar, ref);

  const aoSoltar = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 120 || info.velocity.y > 600) aoFechar();
  };

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 flex items-end justify-center lg:items-center">
          <motion.div
            aria-hidden
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={aoFechar}
          />
          <motion.div
            ref={ref}
            role="dialog"
            aria-modal="true"
            aria-labelledby={tituloId}
            tabIndex={-1}
            className={cn(
              'relative w-full max-w-lg max-h-[92dvh] flex flex-col outline-none',
              'bg-bg-1 border border-line border-b-0 rounded-t-[28px] lg:rounded-lg lg:border-b',
              'shadow-[0_-20px_60px_rgba(0,0,0,0.6)]',
              className,
            )}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={aoSoltar}
          >
            <div className="flex justify-center pt-3 lg:hidden" aria-hidden>
              <span className="h-1.5 w-12 rounded-full bg-line" />
            </div>
            <header className="flex items-center justify-between gap-3 px-5 pt-3 pb-2">
              <h2 id={tituloId} className="text-lg font-bold">
                {titulo}
              </h2>
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar"
                className="grid size-11 place-items-center rounded-full text-texto-2 hover:bg-white/5 hover:text-texto-1"
              >
                <X aria-hidden className="size-5" />
              </button>
            </header>
            <div className="flex-1 overflow-y-auto px-5 pb-4">{children}</div>
            {rodape && (
              <footer className="px-5 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-line/60">
                {rodape}
              </footer>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
