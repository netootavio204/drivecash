import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/ui/Estados';
import { Button } from '@/components/ui/Button';
import { textos } from '@/lib/textos';

interface PaginaPlaceholderProps {
  titulo: string;
  descricao: string;
  icone?: ReactNode;
  faseTexto?: string;
}

export function PaginaPlaceholder({
  titulo,
  descricao,
  icone,
  faseTexto = 'Esta tela será implementada nas próximas fases do projeto.',
}: PaginaPlaceholderProps) {
  const navigate = useNavigate();

  return (
    <div className="py-8">
      <EmptyState
        titulo={titulo}
        descricao={`${descricao} ${faseTexto}`}
        icone={icone}
        acao={
          <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
            <Button variante="fantasma" onClick={() => navigate('/')}>
              {textos.comum.voltarInicio}
            </Button>
          </div>
        }
      />
    </div>
  );
}
