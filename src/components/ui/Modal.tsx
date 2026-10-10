import { useId, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useSobreposicao } from '@/hooks/useSobreposicao';
import { cn } from '@/lib/cn';
import { Button } from './Button';

type ModalProps = {
  aberto: boolean;
  aoFechar: () => void;
  titulo: string;
  children: ReactNode;
  rodape?: ReactNode;
  role?: 'dialog' | 'alertdialog';
  className?: string;
};

export function Modal({
  aberto,
  aoFechar,
  titulo,
  children,
  rodape,
  role = 'dialog',
  className,
}: ModalProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tituloId = useId();
  useSobreposicao(aberto, aoFechar, ref);

  return createPortal(
    <AnimatePresence>
      {aberto && (
        <div className="fixed inset-0 z-50 grid place-items-center p-4">
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
            role={role}
            aria-modal="true"
            aria-labelledby={tituloId}
            tabIndex={-1}
            className={cn(
              'card card-destaque relative w-full max-w-md p-6 outline-none',
              className,
            )}
            initial={{ opacity: 0, scale: 0.94, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <h2 id={tituloId} className="text-xl font-bold">
                {titulo}
              </h2>
              <button
                type="button"
                onClick={aoFechar}
                aria-label="Fechar"
                className="-mr-2 -mt-2 grid size-11 place-items-center rounded-full text-texto-2 hover:bg-white/5 hover:text-texto-1"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="text-texto-2">{children}</div>
            {rodape && <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">{rodape}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

type ConfirmDialogProps = {
  aberto: boolean;
  aoFechar: () => void;
  aoConfirmar: () => void | Promise<void>;
  titulo: string;
  mensagem: ReactNode;
  textoConfirmar?: string;
  textoCancelar?: string;
  perigoso?: boolean;
  /** Exige digitar uma palavra para liberar (ex.: "EXCLUIR"). */
  palavraConfirmacao?: string;
};

/** Diálogo de confirmação (ações destrutivas usam variante perigo). */
export function ConfirmDialog({
  aberto,
  aoFechar,
  aoConfirmar,
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  perigoso = false,
  palavraConfirmacao,
}: ConfirmDialogProps) {
  const [digitado, setDigitado] = useState('');
  const [carregando, setCarregando] = useState(false);
  const liberado = !palavraConfirmacao || digitado.trim() === palavraConfirmacao;

  const fechar = () => {
    setDigitado('');
    aoFechar();
  };

  const confirmar = async () => {
    setCarregando(true);
    try {
      await aoConfirmar();
      setDigitado('');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <Modal
      aberto={aberto}
      aoFechar={fechar}
      titulo={titulo}
      role="alertdialog"
      rodape={
        <>
          <Button variante="fantasma" onClick={fechar}>
            {textoCancelar}
          </Button>
          <Button
            variante={perigoso ? 'perigo' : 'primario'}
            onClick={confirmar}
            disabled={!liberado}
            carregando={carregando}
          >
            {textoConfirmar}
          </Button>
        </>
      }
    >
      <div className="flex gap-3">
        {perigoso && (
          <AlertTriangle aria-hidden className="mt-0.5 size-5 shrink-0 text-negativo" />
        )}
        <div className="space-y-3">
          <div>{mensagem}</div>
          {palavraConfirmacao && (
            <input
              data-autofocus
              aria-label={`Digite ${palavraConfirmacao} para confirmar`}
              value={digitado}
              onChange={(e) => setDigitado(e.target.value)}
              placeholder={palavraConfirmacao}
              className="campo !pt-2 !pb-2 !h-12 uppercase tracking-widest"
            />
          )}
        </div>
      </div>
    </Modal>
  );
}
