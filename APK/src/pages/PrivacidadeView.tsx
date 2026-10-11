import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ArrowLeft, Shield } from 'lucide-react';
import { APP_NAME } from '@/lib/config';

export const PrivacidadeView: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg-0 p-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-xl flex flex-col gap-4">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-texto-3 hover:text-texto-1">
          <ArrowLeft className="size-4" /> Voltar
        </Link>

        <Card variante="padrao" className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="size-6 text-laranja-400" />
            <h1 className="text-xl font-bold text-texto-1">Política de Privacidade — {APP_NAME}</h1>
          </div>

          <div className="text-xs text-texto-2 leading-relaxed flex flex-col gap-3">
            <p>
              Sua privacidade é prioridade máxima no <strong>{APP_NAME}</strong>. Este documento descreve de forma transparente como seus dados são tratados.
            </p>
            <p>
              1. <strong>Coleta de Informações:</strong> Coletamos apenas as informações estritamente necessárias para a gestão do seu caixa (e-mail, nome, veículo e os lançamentos diários que você cadastra).
            </p>
            <p>
              2. <strong>Sigilo e Não Compartilhamento:</strong> Seus dados financeiros jamais serão vendidos, compartilhados ou exibidos a terceiros. Nenhum motorista tem acesso aos números ou metas de outro motorista.
            </p>
            <p>
              3. <strong>Exclusão de Conta:</strong> Você tem o direito de solicitar a exclusão integral e definitiva da sua conta e de todos os seus registros a qualquer momento.
            </p>
            <p className="text-texto-3 italic">
              Versão preliminar de privacidade. Atualização final prevista para a Fase 6.
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
