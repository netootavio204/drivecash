import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Wallet, Target, MoreHorizontal, ArrowUpRight, ArrowDownLeft, ShieldCheck, CheckSquare } from 'lucide-react';
import { Fab } from '@/components/ui/IconButton';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/cn';
import { textos } from '@/lib/textos';

import { EntradaRapidaSheet } from '@/features/lancamentos/EntradaRapidaSheet';
import { SaidaRapidaSheet } from '@/features/lancamentos/SaidaRapidaSheet';

export function BottomNav() {
  const [menuAcoesAberto, setMenuAcoesAberto] = useState(false);
  const [menuMaisAberto, setMenuMaisAberto] = useState(false);
  const [sheetEntradaAberta, setSheetEntradaAberta] = useState(false);
  const [sheetSaidaAberta, setSheetSaidaAberta] = useState(false);
  const navigate = useNavigate();

  const rotasMais = [
    { caminho: '/meu-dinheiro', rotulo: 'Meu Dinheiro', icone: Wallet },
    { caminho: '/prioridades', rotulo: textos.nav.prioridades, icone: CheckSquare },
    { caminho: '/caixa/manutencao', rotulo: textos.nav.manutencao, icone: ShieldCheck },
    { caminho: '/conquistas', rotulo: textos.nav.conquistas, icone: Target },
    { caminho: '/historico', rotulo: textos.nav.historico, icone: Wallet },
    { caminho: '/relatorios', rotulo: textos.nav.relatorios, icone: Home },
    { caminho: '/veiculo', rotulo: textos.nav.veiculo, icone: Home },
    { caminho: '/configuracoes', rotulo: textos.nav.configuracoes, icone: MoreHorizontal },
  ];

  return (
    <>
      <nav
        aria-label="Navegação móvel inferior"
        className="fixed bottom-0 inset-x-0 z-40 bg-bg-1/90 backdrop-blur-xl border-t border-line pb-seguro lg:hidden"
      >
        <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2">
          <NavLink
            to="/"
            end
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-semibold py-1 transition-colors',
                isActive ? 'text-laranja-400' : 'text-texto-2 hover:text-texto-1',
              )
            }
          >
            <Home className="size-5" />
            <span>{textos.nav.inicio}</span>
          </NavLink>

          <NavLink
            to="/caixa"
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-semibold py-1 transition-colors',
                isActive ? 'text-laranja-400' : 'text-texto-2 hover:text-texto-1',
              )
            }
          >
            <Wallet className="size-5" />
            <span>{textos.nav.caixa}</span>
          </NavLink>

          <div className="flex justify-center -translate-y-4">
            <Fab
              rotulo={textos.nav.novo}
              onClick={() => setMenuAcoesAberto(true)}
            />
          </div>

          <NavLink
            to="/metas"
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex flex-col items-center justify-center gap-1 text-xs font-semibold py-1 transition-colors',
                isActive ? 'text-laranja-400' : 'text-texto-2 hover:text-texto-1',
              )
            }
          >
            <Target className="size-5" />
            <span>{textos.nav.metas}</span>
          </NavLink>

          <button
            type="button"
            onClick={() => setMenuMaisAberto(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs font-semibold py-1 text-texto-2 hover:text-texto-1 transition-colors"
          >
            <MoreHorizontal className="size-5" />
            <span>{textos.nav.mais}</span>
          </button>
        </div>
      </nav>

      {/* Sheet de Escolha (+) */}
      <Sheet
        aberto={menuAcoesAberto}
        aoFechar={() => setMenuAcoesAberto(false)}
        titulo="Novo lançamento rápido"
        descricao="Escolha o que deseja registrar agora:"
      >
        <div className="grid gap-3 py-2">
          <Button
            variante="primario"
            tamanho="lg"
            bloco
            icone={<ArrowUpRight className="text-white" />}
            onClick={() => {
              setMenuAcoesAberto(false);
              setSheetEntradaAberta(true);
            }}
          >
            + Corrida / Entrada
          </Button>
          <Button
            variante="perigo"
            tamanho="lg"
            bloco
            icone={<ArrowDownLeft className="text-white" />}
            onClick={() => {
              setMenuAcoesAberto(false);
              setSheetSaidaAberta(true);
            }}
          >
            − Despesa / Saída
          </Button>
          <Button
            variante="fantasma"
            tamanho="md"
            bloco
            icone={<Wallet />}
            onClick={() => {
              setMenuAcoesAberto(false);
              navigate('/caixa');
            }}
          >
            Ver Extrato Completo
          </Button>
        </div>
      </Sheet>

      <EntradaRapidaSheet
        aberto={sheetEntradaAberta}
        aoFechar={() => setSheetEntradaAberta(false)}
      />

      <SaidaRapidaSheet
        aberto={sheetSaidaAberta}
        aoFechar={() => setSheetSaidaAberta(false)}
      />


      {/* Sheet de Mais opções */}
      <Sheet
        aberto={menuMaisAberto}
        aoFechar={() => setMenuMaisAberto(false)}
        titulo="Mais opções"
      >
        <div className="grid grid-cols-2 gap-2 py-2">
          {rotasMais.map((item) => (
            <button
              key={item.caminho}
              type="button"
              onClick={() => {
                setMenuMaisAberto(false);
                navigate(item.caminho);
              }}
              className="flex items-center gap-2.5 p-3.5 rounded-md bg-bg-2 border border-line text-sm font-semibold text-texto-1 hover:border-laranja-500/50 hover:bg-bg-3 transition-colors text-left"
            >
              <item.icone className="size-4 text-laranja-400 shrink-0" />
              <span className="truncate">{item.rotulo}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </>
  );
}
