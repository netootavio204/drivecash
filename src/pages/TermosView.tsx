import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, FileText } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export const TermosView: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-0 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl flex flex-col gap-4">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-texto-3 hover:text-texto-1">
          <ArrowLeft className="size-4" /> Voltar
        </Link>

        <Card variante="padrao" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <FileText className="size-6 text-laranja-400" />
            <h1 className="text-xl font-bold text-texto-1">Termos de Uso — {APP_NAME}</h1>
          </div>

          <div className="text-xs text-texto-2 leading-relaxed flex flex-col gap-3">
            <p>
              O <strong>{APP_NAME}</strong> é uma ferramenta independente desenvolvida para auxiliar motoristas de aplicativo e condutores autônomos na organização financeira pessoal, metas e controle de despesas.
            </p>
            <p>
              1. <strong>Uso pessoal e responsabilidade:</strong> Os dados inseridos no aplicativo são de inteira responsabilidade do usuário. O aplicativo não realiza transações bancárias reais nem tem vínculo oficial com Uber, 99 ou inDrive.
            </p>
            <p>
              2. <strong>Segurança:</strong> Seus dados são armazenados de forma criptografada com isolamento de acesso via regras de segurança do Supabase.
            </p>
            <p>
              3. <strong>Disponibilidade:</strong> Nos esforçamos para garantir 100% de estabilidade e segurança.
            </p>
            <p className="text-texto-3 italic">
              Versão preliminar dos termos. Atualização final prevista para a Fase 6.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-line/60 flex justify-end">
            <Link to="/login">
              <Button variante="primario">
                Entendi
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};
