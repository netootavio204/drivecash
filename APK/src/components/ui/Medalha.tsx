import { motion } from 'framer-motion';
import { Award, Trophy, Star } from 'lucide-react';
import { cn } from '@/lib/cn';

export type TipoMedalha = 'bronze' | 'prata' | 'ouro';

interface MedalhaProps {
  tipo: TipoMedalha;
  desbloqueada?: boolean;
  tamanho?: 'sm' | 'md' | 'lg';
  rotulo?: string;
  className?: string;
}

const CONFIG_TIPO = {
  bronze: {
    gradiente: 'from-[#CD7F32] via-[#E8A87C] to-[#8C4A15]',
    borda: 'border-[#CD7F32]',
    brilho: 'rgba(205, 127, 50, 0.4)',
    icone: Award,
    nome: 'Bronze',
  },
  prata: {
    gradiente: 'from-[#C9CED6] via-[#FFFFFF] to-[#7E8896]',
    borda: 'border-[#C9CED6]',
    brilho: 'rgba(201, 206, 214, 0.45)',
    icone: Star,
    nome: 'Prata',
  },
  ouro: {
    gradiente: 'from-[#FFC83D] via-[#FFEBB0] to-[#E59A00]',
    borda: 'border-[#FFC83D]',
    brilho: 'rgba(255, 200, 61, 0.6)',
    icone: Trophy,
    nome: 'Ouro',
  },
};

const TAMANHOS = {
  sm: 'size-10 text-xs',
  md: 'size-16 text-sm',
  lg: 'size-24 text-base',
};

export function Medalha({
  tipo,
  desbloqueada = true,
  tamanho = 'md',
  rotulo,
  className,
}: MedalhaProps) {
  const config = CONFIG_TIPO[tipo];
  const Icone = config.icone;

  return (
    <div className={cn('flex flex-col items-center gap-1.5', className)}>
      <motion.div
        whileHover={desbloqueada ? { scale: 1.08, rotate: [0, -3, 3, 0] } : undefined}
        transition={{ duration: 0.3 }}
        className={cn(
          'relative rounded-full grid place-items-center shadow-lg border-2 transition-all',
          TAMANHOS[tamanho],
          desbloqueada
            ? cn(`bg-gradient-to-tr ${config.gradiente}`, config.borda)
            : 'bg-bg-3 border-line opacity-40 grayscale',
        )}
        style={{
          boxShadow: desbloqueada ? `0 0 20px ${config.brilho}` : 'none',
        }}
        title={`${config.nome} ${desbloqueada ? 'desbloqueado' : '(bloqueado)'}`}
      >
        <Icone
          className={cn(
            'text-bg-0 drop-shadow-sm',
            tamanho === 'sm' && 'size-5',
            tamanho === 'md' && 'size-8',
            tamanho === 'lg' && 'size-12',
          )}
        />
      </motion.div>
      {rotulo && (
        <span className="text-xs font-semibold text-texto-2 text-center">{rotulo}</span>
      )}
    </div>
  );
}
