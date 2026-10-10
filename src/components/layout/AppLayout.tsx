import { Outlet, useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { SidebarNav } from './SidebarNav';
import { Toaster } from '@/components/ui/Toast';
import { APP_NAME } from '@/lib/config';

export function AppLayout() {
  const location = useLocation();
  const ehDesignSystem = location.pathname === '/design-system';

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-bg-0 text-texto-1 selection:bg-laranja-500/30">
      <SidebarNav />

      <main className="flex-1 flex flex-col min-w-0 pb-24 lg:pb-8">
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-bg-1/80 backdrop-blur-md border-b border-line sticky top-0 z-30">
          <div className="flex items-center gap-2.5">
            <img src="/logo-96.png" alt={APP_NAME} className="size-8 rounded-lg object-contain" />
            <span className="font-extrabold text-base tracking-tight texto-gradiente">{APP_NAME}</span>
          </div>
          {!ehDesignSystem && (
            <a
              href="/design-system"
              className="text-xs font-bold text-laranja-400 bg-laranja-500/10 px-2.5 py-1 rounded-full border border-laranja-500/20"
            >
              Design System
            </a>
          )}
        </header>

        <div className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>

      <BottomNav />
      <Toaster />
    </div>
  );
}
