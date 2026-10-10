import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { traduzirErro } from '@/lib/erros';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export const CadastroView: React.FC = () => {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleCadastro = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!nome.trim()) {
      setErrorMsg('Informe como você gostaria de ser chamado.');
      return;
    }
    if (!email.trim() || !password) {
      setErrorMsg('Preencha seu e-mail e crie uma senha.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não são iguais.');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            nome: nome.trim(),
          },
        },
      });

      if (error) {
        setErrorMsg(traduzirErro(error));
      } else if (data.session) {
        navigate('/onboarding');
      } else {
        setSuccessMsg(
          'Conta criada com sucesso! Verifique seu e-mail para ativar seu acesso.'
        );
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
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/logo.png"
            alt={APP_NAME}
            className="w-16 h-16 object-contain drop-shadow-[0_4px_20px_rgba(255,45,45,0.4)] mb-2"
          />
          <h1 className="text-xl font-black texto-gradiente font-display">
            Criar conta no {APP_NAME}
          </h1>
          <p className="text-xs text-texto-3 mt-1">
            Comece a controlar seus ganhos e metas hoje mesmo
          </p>
        </div>

        <Card variante="padrao" className="w-full p-6">
          {successMsg ? (
            <div className="flex flex-col items-center text-center py-4 gap-3">
              <CheckCircle2 className="size-12 text-positivo animate-bounce" />
              <h2 className="text-base font-bold text-texto-1">Quase lá!</h2>
              <p className="text-xs text-texto-2 leading-relaxed">
                {successMsg}
              </p>
              <Link to="/login" className="w-full mt-3">
                <Button variante="primario" bloco>
                  Ir para o Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleCadastro} className="flex flex-col gap-4">
              <h2 className="text-base font-bold text-texto-1 flex items-center gap-2">
                <UserPlus className="size-5 text-laranja-400" />
                Seus dados de acesso
              </h2>

              {errorMsg && (
                <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Input
                rotulo="Seu nome ou apelido"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
              />

              <Input
                rotulo="Seu melhor e-mail"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Input
                rotulo="Criar senha (mínimo 6 dígitos)"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />

              <Input
                rotulo="Confirmar senha"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />

              <p className="text-[11px] text-texto-3 text-center leading-snug">
                Ao criar sua conta, você concorda com nossos{' '}
                <Link to="/termos" className="text-laranja-400 hover:underline">
                  Termos
                </Link>{' '}
                e{' '}
                <Link to="/privacidade" className="text-laranja-400 hover:underline">
                  Privacidade
                </Link>
                .
              </p>

              <Button
                type="submit"
                variante="primario"
                bloco
                className="mt-1"
                carregando={loading}
              >
                Cadastrar e Começar
              </Button>
            </form>
          )}

          <div className="mt-5 pt-4 border-t border-line/60 text-center">
            <p className="text-xs text-texto-2">
              Já tem uma conta?{' '}
              <Link to="/login" className="font-bold text-laranja-400 hover:underline">
                Fazer login
              </Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
