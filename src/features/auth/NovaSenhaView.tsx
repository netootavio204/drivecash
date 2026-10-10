import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { traduzirErro } from '@/lib/erros';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Lock, AlertCircle } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export const NovaSenhaView: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAtualizar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setErrorMsg('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não conferem.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { error } = await supabase.auth.updateUser({
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
        <div className="flex flex-col items-center mb-6 text-center">
          <img
            src="/logo.png"
            alt={APP_NAME}
            className="w-16 h-16 object-contain drop-shadow-[0_4px_20px_rgba(255,45,45,0.4)] mb-2"
          />
          <h1 className="text-xl font-black texto-gradiente font-display">
            Criar Nova Senha
          </h1>
          <p className="text-xs text-texto-3 mt-1">
            Digite sua nova senha para acessar o aplicativo
          </p>
        </div>

        <Card variante="padrao" className="w-full p-6">
          <form onSubmit={handleAtualizar} className="flex flex-col gap-4">
            <h2 className="text-sm font-bold text-texto-1 flex items-center gap-2">
              <Lock className="size-4 text-laranja-400" />
              Redefinição segura
            </h2>

            {errorMsg && (
              <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Input
              rotulo="Nova senha"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Input
              rotulo="Confirmar nova senha"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variante="primario"
              bloco
              className="mt-2"
              carregando={loading}
            >
              Salvar Nova Senha
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
