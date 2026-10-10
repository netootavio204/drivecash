import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { type Fase } from '@/features/metas/api';
import { Trophy, Star } from 'lucide-react';

interface ModalMudancaFaseProps {
  aberto: boolean;
  aoFechar: () => void;
  faseNova: Fase;
}

export const ModalMudancaFase: React.FC<ModalMudancaFaseProps> = ({
  aberto,
  aoFechar,
  faseNova,
}) => {
  return (
    <Modal
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Você Subiu de Fase! 🎉"
      descricao="Sua dedicação nas pistas desbloqueou um novo nível de honra!"
      rodape={
        <Button variante="primario" className="w-full sm:w-auto" onClick={aoFechar}>
          Bora Acelerar! 🚀
        </Button>
      }
    >
      <div className="text-center py-4 space-y-4">
        {/* Ícone Gigante da Nova Fase */}
        <div
          className="size-20 rounded-3xl mx-auto grid place-items-center shadow-neon relative"
          style={{
            backgroundColor: `${faseNova.cor || '#FF7A00'}20`,
            border: `2px solid ${faseNova.cor || '#FF7A00'}`,
          }}
        >
          <Trophy className="size-10" style={{ color: faseNova.cor || '#FF7A00' }} />
          <span className="absolute -top-1.5 -right-1.5 bg-laranja-500 text-white text-[10px] font-black rounded-full size-6 grid place-items-center shadow-md">
            #{faseNova.numero}
          </span>
        </div>

        <div className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-texto-3 font-bold">Nova Fase</p>
          <h3
            className="text-2xl font-black tracking-tight"
            style={{ color: faseNova.cor || '#FF7A00' }}
          >
            {faseNova.nome}
          </h3>
          <p className="text-xs text-texto-2">
            Requisito alcançado: {faseNova.estrelas_minimas} ⭐ estrelas acumuladas.
          </p>
        </div>

        <div className="p-3 bg-bg-2 border border-line/60 rounded-md text-xs text-texto-2 flex items-center justify-center gap-2">
          <Star className="size-4 text-laranja-400 fill-laranja-400" />
          <span>Continue rodando para alcançar a próxima fase de prestígio!</span>
        </div>
      </div>
    </Modal>
  );
};
