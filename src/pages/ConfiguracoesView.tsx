import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/features/auth/AuthContext';
import { tocarSomVitoria } from '@/lib/som';
import { celebrar } from '@/lib/confete';
import { toast } from '@/components/ui/Toast';
import {
  Volume2,
  VolumeX,
  Sparkles,
  User,
  Shield,
  FileText,
  LogOut,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ConfiguracoesView: React.FC = () => {
  const { profile, user, signOut } = useAuth();
  const navigate = useNavigate();

  const [somAtivo, setSomAtivo] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('meta_driver_som_ativo') === 'true';
  });

  const [efeitosAtivos, setEfeitosAtivos] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('meta_driver_efeitos_ativos') !== 'false';
  });

  const handleToggleSom = (ativo: boolean) => {
    setSomAtivo(ativo);
    localStorage.setItem('meta_driver_som_ativo', ativo ? 'true' : 'false');
    if (ativo) {
      tocarSomVitoria('prata');
      toast.sucesso('Efeitos sonoros ativados!');
    } else {
      toast.info('Efeitos sonoros desativados.');
    }
  };

  const handleToggleEfeitos = (ativo: boolean) => {
    setEfeitosAtivos(ativo);
    localStorage.setItem('meta_driver_efeitos_ativos', ativo ? 'true' : 'false');
    if (ativo) {
      celebrar('bronze');
      toast.sucesso('Animações de comemoração ativadas!');
    } else {
      toast.info('Animações de comemoração desativadas.');
    }
  };

  const handleTestarCelebracao = () => {
    celebrar('ouro');
    if (somAtivo) {
      tocarSomVitoria('ouro');
    }
    toast.sucesso('Teste de comemoração disparado!');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-black text-texto-1">Configurações</h1>
        <p className="text-xs text-texto-3">Personalize sons, alertas e preferências do Meta Driver</p>
      </div>

      {/* Preferências de Gamificação & Sons */}
      <Card className="p-5 bg-bg-2 border-line/60 space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="size-5 text-laranja-400" />
          <h2 className="text-base font-bold text-texto-1">Gamificação & Comemorações</h2>
        </div>

        <div className="divide-y divide-line/40 text-sm">
          {/* Som */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-semibold text-texto-1 flex items-center gap-2">
                {somAtivo ? (
                  <Volume2 className="size-4 text-laranja-400" />
                ) : (
                  <VolumeX className="size-4 text-texto-3" />
                )}
                Efeitos Sonoros
              </span>
              <p className="text-xs text-texto-3">
                Tocar toque sutil ao conquistar medalhas ou subir de fase.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={somAtivo}
                onChange={(e) => handleToggleSom(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-bg-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-laranja-500"></div>
            </label>
          </div>

          {/* Animação / Confete */}
          <div className="py-3 flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-semibold text-texto-1 flex items-center gap-2">
                <Sparkles className="size-4 text-amber-400" />
                Chuva de Confetes
              </span>
              <p className="text-xs text-texto-3">
                Exibir animação visual nas conquistas e metas atingidas.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={efeitosAtivos}
                onChange={(e) => handleToggleEfeitos(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-bg-3 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-laranja-500"></div>
            </label>
          </div>
        </div>

        {/* Botão de teste */}
        <div className="pt-2 flex justify-end">
          <Button
            variante="secundario"
            className="text-xs h-8"
            onClick={handleTestarCelebracao}
          >
            Testar Comemoração
          </Button>
        </div>
      </Card>

      {/* Perfil do Motorista */}
      <Card className="p-5 bg-bg-2 border-line/60 space-y-4">
        <div className="flex items-center gap-2">
          <User className="size-5 text-laranja-400" />
          <h2 className="text-base font-bold text-texto-1">Perfil do Motorista</h2>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-1.5 border-b border-line/40">
            <span className="text-texto-3">Nome</span>
            <span className="font-semibold text-texto-1">{profile?.nome || 'Não informado'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-line/40">
            <span className="text-texto-3">E-mail</span>
            <span className="font-semibold text-texto-1">{user?.email || 'Não informado'}</span>
          </div>
          <div className="flex justify-between py-1.5 border-b border-line/40">
            <span className="text-texto-3">Fuso horário</span>
            <span className="font-semibold text-texto-1 font-mono">{profile?.fuso_horario || 'America/Sao_Paulo'}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-texto-3">Status da Conta</span>
            <span className="font-semibold text-emerald-400">Ativa e configurada</span>
          </div>
        </div>
      </Card>

      {/* Informações e Suporte */}
      <Card className="p-5 bg-bg-2 border-line/60 space-y-3">
        <h2 className="text-sm font-bold text-texto-1">Sobre o Aplicativo</h2>
        <div className="space-y-2 text-xs text-texto-2">
          <button
            type="button"
            onClick={() => navigate('/termos')}
            className="w-full flex items-center justify-between py-2 hover:text-laranja-400 text-left border-b border-line/30"
          >
            <span className="flex items-center gap-2">
              <FileText className="size-4 text-texto-3" /> Termos de Uso
            </span>
            <span>&rarr;</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/privacidade')}
            className="w-full flex items-center justify-between py-2 hover:text-laranja-400 text-left border-b border-line/30"
          >
            <span className="flex items-center gap-2">
              <Shield className="size-4 text-texto-3" /> Política de Privacidade
            </span>
            <span>&rarr;</span>
          </button>
          <div className="flex items-center justify-between py-2 text-texto-3">
            <span>Versão</span>
            <span className="font-mono">1.5.0 (Fase 5 Gamificada)</span>
          </div>
        </div>
      </Card>

      {/* Botão de Sair */}
      <div className="pt-2">
        <Button
          variante="perigo"
          bloco
          icone={<LogOut className="size-4" />}
          onClick={async () => {
            if (confirm('Deseja realmente sair da sua conta?')) {
              await signOut();
            }
          }}
        >
          Sair da Conta
        </Button>
      </div>
    </div>
  );
};
