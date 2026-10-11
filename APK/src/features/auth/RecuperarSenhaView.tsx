import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { traduzirErro } from '@/lib/erros';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { KeyRound, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export const RecuperarSenhaView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRecuperar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Digite seu e-mail para continuar.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/nova-senha`,
      });

      if (error) {
        setErrorMsg(traduzirErro(error));
      } else {
        setEnviado(true);
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
            Recuperar Senha
          </h1>
          <p className="text-xs text-texto-3 mt-1">
            Vamos te enviar um link para redefinir seu acesso
          </p>
        </div>

        <Card variante="padrao" className="w-full p-6">
          {enviado ? (
            <div className="flex flex-col items-center text-center py-2 gap-3">
              <CheckCircle2 className="size-12 text-positivo animate-bounce" />
              <h2 className="text-base font-bold text-texto-1">E-mail enviado!</h2>
              <p className="text-xs text-texto-2 leading-relaxed">
                Se este e-mail estiver cadastrado, você receberá um link em alguns instantes para redefinir sua senha.
              </p>
              <Link to="/login" className="w-full mt-3">
                <Button variante="secundario" bloco>
                  Voltar para o Login
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRecuperar} className="flex flex-col gap-4">
              <h2 className="text-sm font-bold text-texto-1 flex items-center gap-2">
                <KeyRound className="size-4 text-laranja-400" />
                Informe o e-mail cadastrado
              </h2>

              {errorMsg && (
                <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
                  <AlertCircle className="size-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <Input
                rotulo="Seu e-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />

              <Button
                type="submit"
                variante="primario"
                bloco
                className="mt-1"
                carregando={loading}
              >
                Enviar link de recuperação
              </Button>

              <div className="text-center mt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-texto-3 hover:text-texto-1 transition-colors"
                >
                  <ArrowLeft className="size-3.5" />
                  Voltar para o Login
                </Link>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};
