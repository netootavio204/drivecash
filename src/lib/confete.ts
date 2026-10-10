// src/lib/confete.ts
import confetti from 'canvas-confetti';

const CORES = ['#FF2D2D', '#FF7A00', '#FFC83D', '#FFFFFF', '#111111'];

function efeitosAtivos(): boolean {
  if (typeof window === 'undefined') return false;
  return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function celebrar(nivel: 'bronze' | 'prata' | 'ouro' | 'fase') {
  if (!efeitosAtivos()) return;
  const base = { colors: CORES, disableForReducedMotion: true, zIndex: 9999 };

  if (nivel === 'bronze') {
    confetti({ ...base, particleCount: 60, spread: 70, origin: { y: 0.7 } });
  }

  if (nivel === 'prata') {
    confetti({ ...base, particleCount: 80, angle: 60, spread: 60, origin: { x: 0, y: 0.8 } });
    confetti({ ...base, particleCount: 80, angle: 120, spread: 60, origin: { x: 1, y: 0.8 } });
  }

  if (nivel === 'ouro' || nivel === 'fase') {
    const fim = Date.now() + (nivel === 'fase' ? 4000 : 2500);
    (function chuva() {
      confetti({ ...base, particleCount: 6, angle: 60, spread: 55, origin: { x: 0 } });
      confetti({ ...base, particleCount: 6, angle: 120, spread: 55, origin: { x: 1 } });
      confetti({
        ...base,
        particleCount: 3,
        spread: 360,
        startVelocity: 18,
        gravity: 0.5,
        ticks: 320,
        scalar: 1.4,
        shapes: ['square'],
      });
      if (Date.now() < fim) requestAnimationFrame(chuva);
    })();
  }
}
