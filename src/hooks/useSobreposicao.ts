import { useEffect, useRef, type RefObject } from 'react';

const FOCAVEIS =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Comportamento comum de janelas sobrepostas (Sheet, Modal):
 * - fecha com Esc · trava rolagem do fundo · prende o foco dentro · devolve o foco ao fechar.
 */
export function useSobreposicao(
  aberto: boolean,
  aoFechar: () => void,
  ref: RefObject<HTMLElement | null>,
) {
  const aoFecharRef = useRef(aoFechar);
  useEffect(() => {
    aoFecharRef.current = aoFechar;
  }, [aoFechar]);

  useEffect(() => {
    if (!aberto) return;
    const anterior = document.activeElement as HTMLElement | null;
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      const el = ref.current;
      if (!el) return;
      const primeiro = el.querySelector<HTMLElement>('[data-autofocus]') ?? el;
      primeiro.focus();
    }, 30);

    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        aoFecharRef.current();
        return;
      }
      if (e.key !== 'Tab' || !ref.current) return;
      const itens = Array.from(ref.current.querySelectorAll<HTMLElement>(FOCAVEIS));
      if (itens.length === 0) return;
      const primeiro = itens[0];
      const ultimo = itens[itens.length - 1];
      if (e.shiftKey && document.activeElement === primeiro) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primeiro.focus();
      }
    };
    document.addEventListener('keydown', aoTeclar);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', aoTeclar);
      document.body.style.overflow = overflowAnterior;
      anterior?.focus?.();
    };
  }, [aberto, ref]);
}
