/**
 * Utilitário de som com Web Audio API nativo (não requer arquivos externos).
 * Gera notas suaves de vitória e conquista quando ativado.
 */

let audioCtx: AudioContext | null = null;

function obterAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/** Toca acorde de conquista suave e motivador */
export function tocarSomVitoria(tipo: 'bronze' | 'prata' | 'ouro' | 'fase') {
  try {
    const somAtivo = typeof window !== 'undefined' ? localStorage.getItem('meta_driver_som_ativo') === 'true' : false;
    if (!somAtivo) return;

    const ctx = obterAudioContext();
    if (!ctx) return;

    const frequencias =
      tipo === 'ouro' || tipo === 'fase'
        ? [523.25, 659.25, 783.99, 1046.5] // C5, E5, G5, C6 (Acorde maior alegre)
        : tipo === 'prata'
        ? [440.0, 554.37, 659.25] // A4, C#5, E5
        : [392.0, 493.88]; // G4, B4 (Bronze sutil)

    const agora = ctx.currentTime;
    frequencias.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, agora + idx * 0.08);

      gain.gain.setValueAtTime(0.001, agora + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.12, agora + idx * 0.08 + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, agora + idx * 0.08 + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(agora + idx * 0.08);
      osc.stop(agora + idx * 0.08 + 0.5);
    });
  } catch {
    // Silencia erros em navegadores sem suporte a áudio
  }
}
