import { useEffect } from 'react';
import { create } from 'zustand';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TipoToast = 'sucesso' | 'erro' | 'info';

export type Toast = {
  id: number;
  mensagem: string;
  tipo: TipoToast;
  /** Ação opcional, ex.: { rotulo: 'Desfazer', aoClicar: ... } */
  acao?: { rotulo: string; aoClicar: () => void };
  duracao: number;
};

type ToastStore = {
  toasts: Toast[];
  mostrar: (t: Omit<Toast, 'id' | 'duracao' | 'tipo'> & Partial<Pick<Toast, 'duracao' | 'tipo'>>) => number;
  remover: (id: number) => void;
};

let proximoId = 1;

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  mostrar: (t) => {
    const id = proximoId++;
    const toast: Toast = {
      id,
      tipo: t.tipo ?? 'sucesso',
      duracao: t.duracao ?? (t.acao ? 6000 : 3500),
      mensagem: t.mensagem,
      acao: t.acao,
    };
    set((s) => ({ toasts: [...s.toasts.slice(-2), toast] }));
    return id;
  },
  remover: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}));

/** Atalho: `const toast = useToast(); toast({ mensagem: '...' })` */
export function useToast() {
  return useToastStore((s) => s.mostrar);
}

const ICONES = {
  sucesso: <CheckCircle2 aria-hidden className="size-5 text-positivo" />,
  erro: <AlertCircle aria-hidden className="size-5 text-negativo" />,
  info: <Info aria-hidden className="size-5 text-laranja-400" />,
};

function ItemToast({ toast }: { toast: Toast }) {
  const remover = useToastStore((s) => s.remover);

  useEffect(() => {
    const timer = window.setTimeout(() => remover(toast.id), toast.duracao);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.duracao, remover]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 12, scale: 0.96 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'pointer-events-auto flex w-full items-center gap-3 rounded-md px-4 py-3',
        'card-vidro !rounded-md border-l-4',
        toast.tipo === 'sucesso' && '!border-l-positivo',
        toast.tipo === 'erro' && '!border-l-negativo',
        toast.tipo === 'info' && '!border-l-laranja-500',
      )}
    >
      {ICONES[toast.tipo]}
      <p className="flex-1 text-sm font-medium text-texto-1">{toast.mensagem}</p>
      {toast.acao && (
        <button
          type="button"
          onClick={() => {
            toast.acao?.aoClicar();
            remover(toast.id);
          }}
          className="min-h-10 rounded-sm px-3 text-sm font-extrabold text-laranja-400 hover:bg-white/5"
        >
          {toast.acao.rotulo}
        </button>
      )}
      <button
        type="button"
        onClick={() => remover(toast.id)}
        aria-label="Fechar aviso"
        className="grid size-9 place-items-center rounded-full text-texto-3 hover:text-texto-1 hover:bg-white/5"
      >
        <X aria-hidden className="size-4" />
      </button>
    </motion.div>
  );
}

/** Coloque uma vez no app. Avisos aparecem acima da barra inferior. */
export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(96px+env(safe-area-inset-bottom))] z-[60] mx-auto flex w-full max-w-md flex-col gap-2 px-4 lg:bottom-6 lg:right-6 lg:left-auto lg:mx-0"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ItemToast key={t.id} toast={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
