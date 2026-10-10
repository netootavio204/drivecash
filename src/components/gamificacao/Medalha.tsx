import React from 'react';

export type NivelMedalha = 'bronze' | 'prata' | 'ouro' | 'nenhum';

interface MedalhaProps {
  nivel: NivelMedalha;
  tamanho?: 'sm' | 'md' | 'lg' | 'xl';
  comBrilho?: boolean;
  className?: string;
}

const DIMENSOES = {
  sm: 'size-6',
  md: 'size-9',
  lg: 'size-14',
  xl: 'size-20',
};

export const Medalha: React.FC<MedalhaProps> = ({
  nivel,
  tamanho = 'md',
  comBrilho = true,
  className = '',
}) => {
  if (nivel === 'nenhum') {
    return (
      <div
        className={`${DIMENSOES[tamanho]} rounded-full border border-line/60 bg-bg-2/50 grid place-items-center text-texto-3 ${className}`}
        title="Sem medalha ainda"
      >
        <span className="text-[10px] font-black">−</span>
      </div>
    );
  }

  const ehOuro = nivel === 'ouro';
  const ehPrata = nivel === 'prata';

  // Cores de gradiente Neon
  const gradiente = ehOuro
    ? {
        cor1: '#FFE600',
        cor2: '#FF7A00',
        sombra: 'rgba(255, 122, 0, 0.45)',
        borda: '#FFC83D',
        texto: '🥇',
      }
    : ehPrata
    ? {
        cor1: '#FFFFFF',
        cor2: '#8E9AA8',
        sombra: 'rgba(201, 206, 214, 0.35)',
        borda: '#C9CED6',
        texto: '🥈',
      }
    : {
        cor1: '#FFA366',
        cor2: '#A85A2A',
        sombra: 'rgba(205, 127, 50, 0.35)',
        borda: '#CD7F32',
        texto: '🥉',
      };

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 ${DIMENSOES[tamanho]} ${className}`}
      style={{
        filter: comBrilho ? `drop-shadow(0 0 10px ${gradiente.sombra})` : undefined,
      }}
      title={`Medalha de ${nivel.toUpperCase()}`}
    >
      <svg viewBox="0 0 48 48" className="w-full h-full">
        <defs>
          <linearGradient id={`grad-${nivel}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradiente.cor1} />
            <stop offset="100%" stopColor={gradiente.cor2} />
          </linearGradient>
          <filter id={`glow-${nivel}`} x1="-20%" y1="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Círculo externo com borda metálica neon */}
        <circle
          cx="24"
          cy="24"
          r="21"
          fill={`url(#grad-${nivel})`}
          stroke={gradiente.borda}
          strokeWidth="2"
        />

        {/* Anel interno */}
        <circle
          cx="24"
          cy="24"
          r="16"
          fill="none"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1.5"
          strokeDasharray="2 2"
        />

        {/* Estrela de honra central */}
        <polygon
          points="24,14 26.5,20 33,20.5 28,24.5 29.5,31 24,27.5 18.5,31 20,24.5 15,20.5 21.5,20"
          fill="#FFFFFF"
          opacity="0.9"
        />
      </svg>
    </div>
  );
};
