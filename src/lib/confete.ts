import confetti from 'canvas-confetti';
import { tocarSomVitoria } from './som';

type TipoCelebracao = 'bronze' | 'prata' | 'ouro' | 'fase' | 'conquista';

interface ItemFila {
  tipo: TipoCelebracao;
  titulo?: string;
}

const filaCelebracoes: ItemFila[] = [];
let executando = false;

function processarProxima() {
  if (filaCelebracoes.length === 0) {
    executando = false;
    return;
  }

  executando = true;
  const item = filaCelebracoes.shift()!;

  // Verificar se o usuário desligou efeitos visuais
  const efeitosAtivos =
    typeof window !== 'undefined'
      ? localStorage.getItem('meta_driver_efeitos_ativos') !== 'false'
      : true;

  if (efeitosAtivos) {
    dispararEfeitoVisual(item.tipo);
  }

  if (item.tipo === 'bronze' || item.tipo === 'prata' || item.tipo === 'ouro' || item.tipo === 'fase') {
    tocarSomVitoria(item.tipo);
  }

  setTimeout(() => {
    processarProxima();
  }, 1200);
}

function dispararEfeitoVisual(tipo: TipoCelebracao) {
  if (typeof window === 'undefined') return;

  switch (tipo) {
    case 'bronze':
      // Chuva leve de tons acobreados/âmbar
      confetti({
        particleCount: 30,
        spread: 45,
        origin: { y: 0.7 },
        colors: ['#CD7F32', '#FFC83D', '#FFFFFF'],
      });
      break;

    case 'prata':
      // Chuva média prateada e branca
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#C9CED6', '#E2E8F0', '#FF7A00'],
      });
      break;

    case 'ouro':
      // Festa com explosão dourada neon e serpentina
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#FFC83D', '#FF7A00', '#FF2D2D', '#FFFFFF'],
      });
      setTimeout(() => {
        confetti({
          particleCount: 60,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFC83D', '#FF7A00'],
        });
        confetti({
          particleCount: 60,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFC83D', '#FF7A00'],
        });
      }, 250);
      break;

    case 'fase':
      // Explosão máxima de mudança de fase
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#FF7A00', '#FF2D2D', '#22C55E', '#3B82F6', '#FFC83D'],
      });
      break;

    case 'conquista':
      // Explosão lateral com estrelas
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#FF7A00', '#FFC83D'],
      });
      break;
  }
}

/** Enfileira uma celebração garantindo que nunca sobreponha outra */
export function celebrar(tipo: TipoCelebracao, titulo?: string) {
  filaCelebracoes.push({ tipo, titulo });
  if (!executando) {
    processarProxima();
  }
}
