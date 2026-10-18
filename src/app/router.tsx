import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { PaginaPlaceholder } from '@/components/layout/PaginaPlaceholder';
import { InicioPage } from '@/features/dashboard/InicioPage';
import { LoginView } from '@/features/auth/LoginView';
import { CadastroView } from '@/features/auth/CadastroView';
import { RecuperarSenhaView } from '@/features/auth/RecuperarSenhaView';
import { NovaSenhaView } from '@/features/auth/NovaSenhaView';
import { OnboardingView } from '@/features/onboarding/OnboardingView';
import { TermosView } from '@/pages/TermosView';
import { PrivacidadeView } from '@/pages/PrivacidadeView';
import { ProtectedRoute, PublicOnlyRoute, OnboardingRoute } from '@/features/auth/RouteGuards';
import { Clock, Sparkles } from 'lucide-react';
import { CaixaView } from '@/features/caixa/CaixaView';
import { CaixaManutencaoView } from '@/features/caixa/CaixaManutencaoView';
import { PrioridadesView } from '@/features/prioridades/PrioridadesView';
import { MetasView } from '@/features/metas/MetasView';
import { ConquistasView } from '@/features/conquistas/ConquistasView';
import { ConfiguracoesView } from '@/pages/ConfiguracoesView';
import { HistoricoView } from '@/features/historico/HistoricoView';
import { RelatoriosView } from '@/features/relatorios/RelatoriosView';
import { VeiculoView } from '@/features/veiculo/VeiculoView';
import { MeuDinheiroPage } from '@/features/locais/MeuDinheiroPage';

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
            path: 'meu-dinheiro',
            element: <MeuDinheiroPage />,
          },
          {
            path: 'caixa/manutencao',
            element: <CaixaManutencaoView />,
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
            element: <MetasView />,
          },
          {
            path: 'conquistas',
            element: <ConquistasView />,
          },
          {
            path: 'prioridades',
            element: <PrioridadesView />,
          },
          {
            path: 'historico',
            element: <HistoricoView />,
          },
          {
            path: 'relatorios',
            element: <RelatoriosView />,
          },
          {
            path: 'veiculo',
            element: <VeiculoView />,
          },
          {
            path: 'configuracoes',
            element: <ConfiguracoesView />,
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
