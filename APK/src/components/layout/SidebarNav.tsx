import { NavLink } from 'react-router-dom';
import {
  Home,
  Wallet,
  Target,
  Trophy,
  CheckSquare,
  History,
  BarChart3,
  Car,
  Settings,
  ShieldCheck,
  LogOut,
} from 'lucide-react';
import { APP_NAME } from '@/lib/config';
import { textos } from '@/lib/textos';
import { cn } from '@/lib/cn';
import { useAuth } from '@/features/auth/AuthContext';


export function SidebarNav() {
  const rotasPrincipais = [
    { caminho: '/', rotulo: textos.nav.inicio, icone: Home },
    { caminho: '/caixa', rotulo: textos.nav.caixa, icone: Wallet },
    { caminho: '/caixa/manutencao', rotulo: textos.nav.manutencao, icone: ShieldCheck },
    { caminho: '/metas', rotulo: textos.nav.metas, icone: Target },
    { caminho: '/conquistas', rotulo: textos.nav.conquistas, icone: Trophy },
    { caminho: '/prioridades', rotulo: textos.nav.prioridades, icone: CheckSquare },
    { caminho: '/historico', rotulo: textos.nav.historico, icone: History },
    { caminho: '/relatorios', rotulo: textos.nav.relatorios, icone: BarChart3 },
    { caminho: '/veiculo', rotulo: textos.nav.veiculo, icone: Car },
    { caminho: '/configuracoes', rotulo: textos.nav.configuracoes, icone: Settings },
  ];

  return (
    <aside
      aria-label="Navegação lateral desktop"
      className="hidden lg:flex flex-col w-64 shrink-0 bg-bg-1 border-r border-line min-h-screen p-4 sticky top-0"
    >
      <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-line/60">
        <img src="/logo-96.png" alt={APP_NAME} className="size-10 rounded-xl object-contain shadow-md" />
        <div>
          <h1 className="font-extrabold text-base tracking-tight texto-gradiente">{APP_NAME}</h1>
          <p className="text-[11px] text-texto-3 font-medium">Controle para Motoristas</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {rotasPrincipais.map((item) => (
          <NavLink
            key={item.caminho}
            to={item.caminho}
            end={item.caminho === '/'}
            className={({ isActive }: { isActive: boolean }) =>
              cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-md text-sm font-semibold transition-all',
                isActive
                  ? 'bg-gradient-to-r from-vermelho-500/20 to-laranja-500/20 text-laranja-400 border border-laranja-500/30 shadow-[0_0_15px_rgba(255,122,0,0.15)]'
                  : 'text-texto-2 hover:text-texto-1 hover:bg-bg-2',
              )
            }
          >
            <item.icone className="size-5 shrink-0" />
            <span>{item.rotulo}</span>
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 mt-auto border-t border-line/60">
        <BotaoSair />
      </div>
    </aside>
  );
}

function BotaoSair() {
  const { profile, signOut } = useAuth();
  return (
    <div className="flex items-center justify-between px-3 py-2 rounded-md bg-bg-2 border border-line/40">
      <div className="flex items-center gap-2 overflow-hidden">
        <div className="size-7 rounded-full bg-gradient-to-tr from-brand-red to-brand-orange flex items-center justify-center font-bold text-xs text-white shrink-0">
          {profile?.nome ? profile.nome.charAt(0).toUpperCase() : 'M'}
        </div>
        <div className="truncate">
          <p className="text-xs font-bold text-texto-1 truncate">{profile?.nome || 'Motorista'}</p>
        </div>
      </div>
      <button
        onClick={() => signOut()}
        title="Sair da conta"
        className="p-1.5 text-texto-3 hover:text-brand-red rounded transition-colors"
      >
        <LogOut className="size-4" />
      </button>
    </div>
  );
}

