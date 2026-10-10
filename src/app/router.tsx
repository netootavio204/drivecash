import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PaginaPlaceholder } from '@/components/layout/PaginaPlaceholder';
import { InicioPage } from '@/features/dashboard/InicioPage';
import { DesignSystemPage } from '@/features/design-system/DesignSystemPage';
import { LoginView } from '@/features/auth/LoginView';
import { CadastroView } from '@/features/auth/CadastroView';
import { RecuperarSenhaView } from '@/features/auth/RecuperarSenhaView';
import { NovaSenhaView } from '@/features/auth/NovaSenhaView';
import { OnboardingView } from '@/features/onboarding/OnboardingView';
import { TermosView } from '@/pages/TermosView';
import { PrivacidadeView } from '@/pages/PrivacidadeView';
import { ProtectedRoute, PublicOnlyRoute, OnboardingRoute } from '@/features/auth/RouteGuards';
import {
  ShieldCheck,
  Target,
  Trophy,
  CheckSquare,
  History,
  BarChart3,
  Car,
  Settings,
  Clock,
  Sparkles,
} from 'lucide-react';
import { textos } from '@/lib/textos';

import { CaixaView } from '@/features/caixa/CaixaView';

export const router = createBrowserRouter([

  // Rotas Públicas (Apenas para não autenticados)
  {
    element: <PublicOnlyRoute />,
    children: [
      {
        path: '/login',
        element: <LoginView />,
      },
      {
        path: '/cadastro',
        element: <CadastroView />,
      },
      {
        path: '/recuperar-senha',
        element: <RecuperarSenhaView />,
      },
      {
        path: '/nova-senha',
        element: <NovaSenhaView />,
      },
    ],
  },

  // Rota de Onboarding (Para autenticados que ainda não concluíram o setup)
  {
    element: <OnboardingRoute />,
    children: [
      {
        path: '/onboarding',
        element: <OnboardingView />,
      },
    ],
  },

  // Páginas informativas públicas (acessíveis com ou sem login)
  {
    path: '/termos',
    element: <TermosView />,
  },
  {
    path: '/privacidade',
    element: <PrivacidadeView />,
  },

  // Rotas Protegidas (Exigem login e onboarding concluído)
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          {
            index: true,
            element: <InicioPage />,
          },
          {
            path: 'caixa',
            element: <CaixaView />,
          },

          {
            path: 'caixa/manutencao',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.manutencao}
                descricao="Reserva protegida para pneus, óleo, seguro e manutenções do carro."
                icone={<ShieldCheck />}
                faseTexto="Será ativado na Fase 4."
              />
            ),
          },
          {
            path: 'dia/abrir',
            element: (
              <PaginaPlaceholder
                titulo="Bater ponto — Abrir dia"
                descricao="Registro de abertura com saldo acumulado e km inicial."
                icone={<Clock />}
                faseTexto="Será ativado na Fase 3."
              />
            ),
          },
          {
            path: 'dia/fechar',
            element: (
              <PaginaPlaceholder
                titulo="Fechar o dia"
                descricao="Resumo final de ganhos, conferência de dinheiro e depósito na manutenção."
                icone={<Clock />}
                faseTexto="Será ativado na Fase 4."
              />
            ),
          },
          {
            path: 'metas',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.metas}
                descricao="Metas diárias, semanais e mensais com marcos de 70%, 100% e 130%."
                icone={<Target />}
                faseTexto="Será ativado na Fase 5."
              />
            ),
          },
          {
            path: 'conquistas',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.conquistas}
                descricao="Medalhas, níveis, estrelas e histórico de fases desbloqueadas."
                icone={<Trophy />}
                faseTexto="Será ativado na Fase 5."
              />
            ),
          },
          {
            path: 'prioridades',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.prioridades}
                descricao="Contas e despesas essenciais organizadas por ordem de urgência."
                icone={<CheckSquare />}
                faseTexto="Será ativado na Fase 4."
              />
            ),
          },
          {
            path: 'historico',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.historico}
                descricao="Calendário e lista completa de dias rodados e fechados."
                icone={<History />}
                faseTexto="Será ativado na Fase 6."
              />
            ),
          },
          {
            path: 'relatorios',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.relatorios}
                descricao="Gráficos de lucro líquido, custo por km e rendimento por plataforma."
                icone={<BarChart3 />}
                faseTexto="Será ativado na Fase 6."
              />
            ),
          },
          {
            path: 'veiculo',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.veiculo}
                descricao="Quilometragem, média de consumo de combustível e alertas de troca de óleo."
                icone={<Car />}
                faseTexto="Será ativado na Fase 6."
              />
            ),
          },
          {
            path: 'configuracoes',
            element: (
              <PaginaPlaceholder
                titulo={textos.nav.configuracoes}
                descricao="Perfil do motorista, plataformas ativas, categorias e exportação de dados."
                icone={<Settings />}
                faseTexto="Será ativado na Fase 6."
              />
            ),
          },
          {
            path: 'design-system',
            element: <DesignSystemPage />,
          },
          {
            path: '*',
            element: (
              <PaginaPlaceholder
                titulo="Página não encontrada"
                descricao="O caminho solicitado não existe."
                icone={<Sparkles />}
              />
            ),
          },
        ],
      },
    ],
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
