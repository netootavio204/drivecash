/**
 * Módulo de plataforma com fallback seguro para web.
 * No ambiente web tradicional, todos os recursos nativos degradam graciosamente.
 */

export function isNativo(): boolean {
  return false;
}

export function getPlataforma(): 'android' | 'ios' | 'web' {
  return 'web';
}

export async function vibrarToque() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(15);
    } catch {
      // silencioso
    }
  }
}

export async function vibrarSucesso() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([30, 50, 30]);
    } catch {
      // silencioso
    }
  }
}

export async function vibrarAlerta() {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([50, 100, 50]);
    } catch {
      // silencioso
    }
  }
}

export async function inicializarAppNativo() {
  // No-op no web
}

export function configurarBotaoVoltar(
  _estaNoInicio: () => boolean,
  _voltarNavegacao: () => void,
  _exibirAvisoSaida: () => void
) {
  return () => {};
}

export function configurarDeepLinks(_aoAbrirUrl: (url: string) => void) {
  return () => {};
}

export async function compartilharExportacao(nomeArquivo: string, conteudo: string, mimeType: string = 'text/csv') {
  const blob = new Blob([conteudo], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  return true;
}
