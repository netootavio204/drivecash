import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { traduzirErro } from '@/lib/erros';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AlertCircle, LogIn } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Informe seu e-mail e sua senha.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        setErrorMsg(traduzirErro(error));
      } else {
        navigate('/');
      }
    } catch (err) {
      setErrorMsg(traduzirErro(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-0 flex flex-col justify-center items-center px-4 py-8">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* Logo e Cabeçalho */}
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/logo.png"
            alt={APP_NAME}
            className="w-20 h-20 object-contain drop-shadow-[0_4px_20px_rgba(255,45,45,0.4)] mb-3"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <h1 className="text-2xl font-black tracking-tight texto-gradiente font-display">
            {APP_NAME}
          </h1>
          <p className="text-xs text-texto-3 mt-1">
            Seu caixa diário e metas no controle total
          </p>
        </div>

        {/* Card do Formulário */}
        <Card variante="padrao" className="w-full p-6">
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <h2 className="text-lg font-bold text-texto-1 flex items-center gap-2">
              <LogIn className="size-5 text-laranja-400" />
              Entrar na sua conta
            </h2>

            {errorMsg && (
              <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Input
              rotulo="E-mail"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <div className="flex flex-col gap-1">
              <Input
                rotulo="Senha"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="flex justify-end mt-1">
                <Link
                  to="/recuperar-senha"
                  className="text-xs text-laranja-400 hover:text-laranja-300 transition-colors"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <Button
              type="submit"
              variante="primario"
              bloco
              className="mt-2"
              carregando={loading}
            >
              Entrar
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-line/60 text-center flex flex-col gap-3">
            <p className="text-xs text-texto-2">
              Ainda não tem conta?{' '}
              <Link
                to="/cadastro"
                className="font-bold text-laranja-400 hover:underline"
              >
                Criar conta gratuita
              </Link>
            </p>

            <div className="flex justify-center gap-4 text-[11px] text-texto-3">
              <Link to="/termos" className="hover:underline">
                Termos de Uso
              </Link>
              <span>•</span>
              <Link to="/privacidade" className="hover:underline">
                Privacidade
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
