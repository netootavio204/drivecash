import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { useAuth } from '@/features/auth/AuthContext';
import { tocarSomVitoria } from '@/lib/som';
import { celebrar } from '@/lib/confete';
import { exportarBackupUsuario, restaurarBackupUsuario } from '@/lib/backup';
import { supabase } from '@/lib/supabase';
import { toast } from '@/components/ui/Toast';
import { traduzirErro } from '@/lib/erros';
import {
  Volume2,
  VolumeX,
  Sparkles,
  User,
  Shield,
  FileText,
  LogOut,
  Phone,
  MessageSquare,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const ConfiguracoesView: React.FC = () => {
  const { profile, user, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // Estados de Sons e Confetes
  const [somAtivo, setSomAtivo] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('meta_driver_som_ativo') === 'true';
  });

  const [efeitosAtivos, setEfeitosAtivos] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem('meta_driver_efeitos_ativos') !== 'false';
  });

  // Modais
  const [modalPerfilAberto, setModalPerfilAberto] = useState(false);
  const [modalSuporteAberto, setModalSuporteAberto] = useState(false);
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Form Perfil
  const [formNome, setFormNome] = useState(profile?.nome || '');
  const [formWhatsapp, setFormWhatsapp] = useState(profile?.whatsapp || '');
  const [salvandoPerfil, setSalvandoPerfil] = useState(false);

  // Form Suporte
  const [assuntoSuporte, setAssuntoSuporte] = useState('');
  const [mensagemSuporte, setMensagemSuporte] = useState('');
  const [enviandoSuporte, setEnviandoSuporte] = useState(false);

  // Excluir Conta
  const [confirmacaoExcluir, setConfirmacaoExcluir] = useState('');
  const [excluindoConta, setExcluindoConta] = useState(false);

  // Backup
  const [processandoBackup, setProcessandoBackup] = useState(false);

  const queryClient = useQueryClient();

  // Reset Seletivo (Decisão V2.4)
  const [modalResetAberto, setModalResetAberto] = useState(false);
  const [resetEntradas, setResetEntradas] = useState(true);
  const [resetSaidas, setResetSaidas] = useState(true);
  const [resetTransferencias, setResetTransferencias] = useState(false);
  const [resetPausas, setResetPausas] = useState(false);
  const [palavraReset, setPalavraReset] = useState('');
  const [resetando, setResetando] = useState(false);

  const handleExecutarReset = async () => {
    if (palavraReset.trim().toUpperCase() !== 'ZERAR') {
      toast.erro('Digite a palavra ZERAR em maiúsculo para confirmar.');
      return;
    }

    if (!user) return;

    try {
      setResetando(true);

      // Tenta via RPC dedicada
      let resetRealizado = false;
      try {
        const { error } = await (supabase.rpc as any)('rpc_reset_seletivo', {
          p_opcoes: {
            entradas: resetEntradas,
            saidas: resetSaidas,
            transferencias: resetTransferencias,
            pausas: resetPausas,
          },
          p_palavra_seguranca: 'ZERAR',
        });
        if (!error) {
          resetRealizado = true;
        }
      } catch (e) {
        console.warn('[DriveCash V2] RPC rpc_reset_seletivo pendente, usando fallback direto:', e);
      }

      if (!resetRealizado) {
        // Fallback direto seguro por user_id
        const agora = new Date().toISOString();
        if (resetEntradas) {
          await supabase
            .from('lancamentos')
            .update({ excluido_em: agora })
            .eq('user_id', user.id)
            .in('tipo', ['entrada', 'ajuste_entrada', 'transferencia_entrada'])
            .is('excluido_em', null);
        }

        if (resetSaidas) {
          await supabase
            .from('lancamentos')
            .update({ excluido_em: agora })
            .eq('user_id', user.id)
            .in('tipo', ['saida', 'ajuste_saida', 'transferencia_saida'])
            .is('excluido_em', null);
        }

        if (resetTransferencias) {
          await (supabase as any)
            .from('locais_transferencias')
            .update({ excluido_em: agora })
            .eq('user_id', user.id)
            .is('excluido_em', null);
        }

        if (resetPausas) {
          await (supabase as any)
            .from('pausas')
            .delete()
            .eq('user_id', user.id);
        }
      }

      // Invalidação imediata do cache para zerar a interface na hora
      await queryClient.invalidateQueries();

      toast.sucesso('Limpeza seletiva concluída! Seu extrato e saldos foram reiniciados.');
      setModalResetAberto(false);
      setPalavraReset('');
    } catch (err: any) {
      toast.erro(traduzirErro(err));
    } finally {
      setResetando(false);
    }
  };

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

  const handleSalvarPerfil = async () => {
    if (!formNome.trim()) {
      toast.erro('Informe seu nome.');
      return;
    }

    try {
      setSalvandoPerfil(true);
      const { error } = await supabase
        .from('profiles')
        .update({
          nome: formNome.trim(),
          whatsapp: formWhatsapp.trim() || null,
        })
        .eq('id', user?.id || '');

      if (error) throw error;
      await refreshProfile();
      toast.sucesso('Perfil atualizado com sucesso!');
      setModalPerfilAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    } finally {
      setSalvandoPerfil(false);
    }
  };

  const handleEnviarSuporte = async () => {
    if (!assuntoSuporte.trim() || !mensagemSuporte.trim()) {
      toast.erro('Preencha o assunto e a mensagem.');
      return;
    }

    try {
      setEnviandoSuporte(true);
      const { error } = await supabase.from('suporte_mensagens').insert({
        user_id: user?.id || '',
        assunto: assuntoSuporte.trim(),
        mensagem: mensagemSuporte.trim(),
        contato: profile?.whatsapp || user?.email || '',
      });

      if (error) throw error;
      toast.sucesso('Mensagem enviada! Responderemos em breve.');
      setAssuntoSuporte('');
      setMensagemSuporte('');
      setModalSuporteAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    } finally {
      setEnviandoSuporte(false);
    }
  };

  const handleExportarBackup = async () => {
    if (!user) return;
    try {
      setProcessandoBackup(true);
      await exportarBackupUsuario(user.id);
      toast.sucesso('Backup JSON gerado com sucesso!');
    } catch (err) {
      toast.erro(traduzirErro(err));
    } finally {
      setProcessandoBackup(false);
    }
  };

  const handleImportarBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const arquivo = e.target.files?.[0];
    if (!arquivo || !user) return;

    try {
      setProcessandoBackup(true);
      const texto = await arquivo.text();
      const resultado = await restaurarBackupUsuario(texto, user.id);
      if (resultado.sucesso) {
        toast.sucesso(resultado.mensagem);
      } else {
        toast.erro(resultado.mensagem);
      }
    } catch (err) {
      toast.erro(traduzirErro(err));
    } finally {
      setProcessandoBackup(false);
      e.target.value = '';
    }
  };

  const handleExcluirConta = async () => {
    if (confirmacaoExcluir !== 'EXCLUIR') {
      toast.erro('Digite exatamente "EXCLUIR" para confirmar.');
      return;
    }

    try {
      setExcluindoConta(true);
      const { error } = await supabase.rpc('rpc_excluir_conta');
      if (error) throw error;
      toast.sucesso('Sua conta foi excluída com sucesso.');
      await signOut();
    } catch (err) {
      toast.erro(traduzirErro(err));
      setExcluindoConta(false);
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cabeçalho */}
      <div>
        <h1 className="text-2xl font-black text-texto-1">Configurações</h1>
        <p className="text-xs text-texto-3">Personalize sons, perfil, backup e preferências do app</p>
      </div>

      {/* Perfil do Motorista */}
      <Card className="p-5 bg-bg-2 border-line/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="size-5 text-laranja-400" />
            <h2 className="text-base font-bold text-texto-1">Perfil do Motorista</h2>
          </div>
          <Button
            variante="secundario"
            className="text-xs h-8"
            onClick={() => {
              setFormNome(profile?.nome || '');
              setFormWhatsapp(profile?.whatsapp || '');
              setModalPerfilAberto(true);
            }}
          >
            Editar Perfil
          </Button>
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
            <span className="text-texto-3 flex items-center gap-1.5">
              <Phone className="size-3.5 text-emerald-400" /> Celular (WhatsApp)
            </span>
            <span className="font-semibold text-texto-1 font-mono">
              {profile?.whatsapp || 'Não cadastrado'}
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-texto-3">Status da Conta</span>
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="size-3.5" /> Ativa e sincronizada
            </span>
          </div>
        </div>
      </Card>

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
                Tocar acordes suaves e motivadores ao bater metas ou subir de fase.
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
                Exibir animação visual nas conquistas e medalhas atingidas.
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
      </Card>

      {/* Backup e Restauração de Dados */}
      <Card className="p-5 bg-bg-2 border-line/60 space-y-4">
        <div className="flex items-center gap-2">
          <Download className="size-5 text-blue-400" />
          <h2 className="text-base font-bold text-texto-1">Backup & Segurança dos Dados</h2>
        </div>
        <p className="text-xs text-texto-3">
          Exporte uma cópia completa de todos os seus lançamentos e metas em JSON ou restaure em outro aparelho.
        </p>

        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-3 pt-1">
          <Button
            variante="secundario"
            icone={<Download className="size-4" />}
            onClick={handleExportarBackup}
            carregando={processandoBackup}
            className="w-full justify-center text-xs sm:text-sm"
          >
            Exportar Backup
          </Button>

          <label className="btn btn-secundario w-full justify-center text-xs sm:text-sm cursor-pointer">
            <Upload className="size-4 mr-2" />
            <span>Restaurar JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportarBackup}
              disabled={processandoBackup}
              className="sr-only"
            />
          </label>
        </div>
      </Card>

      {/* Limpeza / Reset Seletivo para Recomeço Limpo (Decisão V2.4) */}
      <Card className="p-5 bg-bg-2 border-line/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <RotateCcw className="size-5 text-amber-400" />
            <h2 className="text-base font-bold text-texto-1">Recomeço Limpo / Reset Seletivo</h2>
          </div>
          <Button
            variante="secundario"
            className="text-xs h-8 text-amber-400 hover:text-amber-300 border-amber-500/30"
            onClick={() => setModalResetAberto(true)}
          >
            Escolher o que zerar
          </Button>
        </div>
        <p className="text-xs text-texto-3">
          Deseja recomeçar o registro com lançamentos retroativos limpos? Você pode escolher exatamente o que zerar (entradas, saídas ou transferências) com total segurança sem apagar sua conta.
        </p>
      </Card>

      {/* Suporte e Contato */}
      <Card className="p-5 bg-bg-2 border-line/60 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="size-5 text-laranja-400" />
            <h2 className="text-base font-bold text-texto-1">Ajuda & Suporte</h2>
          </div>
          <Button
            variante="secundario"
            className="text-xs h-8"
            onClick={() => setModalSuporteAberto(true)}
          >
            Enviar Mensagem
          </Button>
        </div>
        <p className="text-xs text-texto-3">
          Tem dúvidas, sugestões ou encontrou algum problema? Fale diretamente com a equipe.
        </p>
      </Card>

      {/* Informações Legais */}
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
            <span className="font-mono">1.6.0 (Fase 6 — Lançamento Oficial)</span>
          </div>
        </div>
      </Card>

      {/* Ações da Conta (Sair e Excluir Conta) */}
      <div className="space-y-3 pt-2">
        <Button
          variante="secundario"
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

        <Button
          variante="fantasma"
          bloco
          className="text-negativo hover:bg-negativo/10"
          icone={<Trash2 className="size-4" />}
          onClick={() => {
            setConfirmacaoExcluir('');
            setModalExcluirAberto(true);
          }}
        >
          Excluir Minha Conta (RN-27)
        </Button>
      </div>

      {/* Modal Editar Perfil */}
      <Modal
        aberto={modalPerfilAberto}
        aoFechar={() => setModalPerfilAberto(false)}
        titulo="Editar Perfil"
        descricao="Atualize seu nome e WhatsApp para contato e grupos de motoristas."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalPerfilAberto(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleSalvarPerfil} carregando={salvandoPerfil}>
              Salvar Alterações
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Seu Nome Completo"
            placeholder="Ex: João da Silva"
            value={formNome}
            onChange={(e) => setFormNome(e.target.value)}
          />
          <Input
            rotulo="Celular / WhatsApp (com DDD)"
            placeholder="Ex: (11) 98765-4321"
            value={formWhatsapp}
            onChange={(e) => setFormWhatsapp(e.target.value)}
          />
        </div>
      </Modal>

      {/* Modal Formulário de Suporte */}
      <Modal
        aberto={modalSuporteAberto}
        aoFechar={() => setModalSuporteAberto(false)}
        titulo="Contato & Suporte"
        descricao="Envie sua mensagem e responderemos o mais rápido possível."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalSuporteAberto(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleEnviarSuporte} carregando={enviandoSuporte}>
              Enviar Mensagem
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Assunto"
            placeholder="Ex: Dúvida sobre fechamento, Sugestão de melhoria"
            value={assuntoSuporte}
            onChange={(e) => setAssuntoSuporte(e.target.value)}
          />
          <div className="space-y-1">
            <label className="text-xs font-bold text-texto-2">Mensagem</label>
            <textarea
              rows={4}
              placeholder="Descreva sua solicitação com detalhes..."
              value={mensagemSuporte}
              onChange={(e) => setMensagemSuporte(e.target.value)}
              className="w-full p-3 rounded-xl bg-bg-2 border border-line/60 text-texto-1 text-xs focus:outline-none focus:border-laranja-500/70"
            />
          </div>
        </div>
      </Modal>

      {/* Modal Excluir Conta (RN-27) */}
      <Modal
        aberto={modalExcluirAberto}
        aoFechar={() => setModalExcluirAberto(false)}
        titulo="Excluir Conta Permanentemente"
        descricao="Atenção: esta ação é irreversível e apagará todos os seus lançamentos, caixas e histórico."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalExcluirAberto(false)}>
              Cancelar
            </Button>
            <Button
              variante="perigo"
              onClick={handleExcluirConta}
              carregando={excluindoConta}
              disabled={confirmacaoExcluir !== 'EXCLUIR'}
            >
              Confirmar Exclusão
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3 bg-negativo/15 border border-negativo/40 rounded-xl text-negativo flex items-start gap-2.5">
            <AlertTriangle className="size-5 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Aviso Crítico de Segurança</strong>
              Todos os seus registros financeiros, metas e histórico serão excluídos sem possibilidade de recuperação.
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-texto-2 font-bold block">
              Para prosseguir, digite exatamente a palavra <span className="text-negativo font-mono font-black">EXCLUIR</span> abaixo:
            </label>
            <Input
              rotulo="Confirmação de segurança"
              placeholder="Digite EXCLUIR"
              value={confirmacaoExcluir}
              onChange={(e) => setConfirmacaoExcluir(e.target.value)}
            />
          </div>
        </div>
      </Modal>

      {/* Modal Reset Seletivo (Decisão V2.4) */}
      <Modal
        aberto={modalResetAberto}
        aoFechar={() => setModalResetAberto(false)}
        titulo="Recomeço Limpo / Reset Seletivo"
        descricao="Escolha exatamente quais categorias de registros você deseja limpar para recomeçar seus lançamentos com dados limpos."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button
              variante="fantasma"
              onClick={() => setModalResetAberto(false)}
              disabled={resetando}
            >
              Cancelar
            </Button>
            <Button
              variante="perigo"
              onClick={handleExecutarReset}
              carregando={resetando}
              disabled={palavraReset.trim().toUpperCase() !== 'ZERAR'}
            >
              Executar Limpeza Seletiva
            </Button>
          </div>
        }
      >
        <div className="space-y-4 text-xs">
          <p className="text-texto-2 font-medium">
            Selecione o que deseja limpar. <strong>Sua conta, perfil, conquistas e categorias NÃO serão apagados.</strong>
          </p>

          <div className="space-y-2 p-3 rounded-lg bg-bg-2 border border-line">
            <label className="flex items-center gap-2 cursor-pointer text-texto-1">
              <input
                type="checkbox"
                checked={resetEntradas}
                onChange={(e) => setResetEntradas(e.target.checked)}
                className="size-4 accent-laranja-500 rounded"
              />
              <span className="font-semibold">Entradas e Corridas passadas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-texto-1">
              <input
                type="checkbox"
                checked={resetSaidas}
                onChange={(e) => setResetSaidas(e.target.checked)}
                className="size-4 accent-laranja-500 rounded"
              />
              <span className="font-semibold">Despesas e Saídas passadas</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-texto-1">
              <input
                type="checkbox"
                checked={resetTransferencias}
                onChange={(e) => setResetTransferencias(e.target.checked)}
                className="size-4 accent-laranja-500 rounded"
              />
              <span className="font-semibold">Histórico de transferências entre locais</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-texto-1">
              <input
                type="checkbox"
                checked={resetPausas}
                onChange={(e) => setResetPausas(e.target.checked)}
                className="size-4 accent-laranja-500 rounded"
              />
              <span className="font-semibold">Histórico de intervalos de trabalho</span>
            </label>
          </div>

          <div className="space-y-1.5 pt-1">
            <label className="text-texto-2 font-bold block">
              Para confirmar com segurança, digite a palavra <span className="text-negativo font-mono font-black">ZERAR</span> abaixo:
            </label>
            <Input
              rotulo="Palavra de verificação"
              placeholder="Digite ZERAR"
              value={palavraReset}
              onChange={(e) => setPalavraReset(e.target.value)}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};
