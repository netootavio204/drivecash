import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { Skeleton } from '@/components/ui/Estados';

export const ProtectedRoute: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-0 flex flex-col items-center justify-center p-6 gap-4">
        <div className="size-16 rounded-2xl bg-gradient-to-tr from-vermelho-500 to-laranja-500 animate-pulse flex items-center justify-center shadow-lg">
          <span className="text-2xl font-black text-white">MD</span>
        </div>
        <p className="text-texto-3 text-sm animate-pulse">Carregando seus dados...</p>
        <div className="w-48">
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se o usuário ainda não completou o onboarding, redireciona para lá
  if (profile && profile.onboarding_concluido === false) {
    return <Navigate to="/onboarding" replace />;
  }

  return <Outlet />;
};

export const OnboardingRoute: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-0 flex items-center justify-center">
        <Skeleton className="w-48 h-8 rounded-md" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (profile && profile.onboarding_concluido === true) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export const PublicOnlyRoute: React.FC = () => {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (user) {
    if (profile && profile.onboarding_concluido === false) {
      return <Navigate to="/onboarding" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
