import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Estados';
import { toast } from '@/components/ui/Toast';
import { traduzirErro } from '@/lib/erros';
import { formatarMoeda } from '@/lib/money';
import {
  useMetas,
  useCiclosMetas,
  useCriarMeta,
  useEditarMeta,
  useArquivarMeta,
  useAtualizarMetas,
  type Meta,
  type PeriodoMeta,
} from './api';
import { usePrioridades } from '@/features/prioridades/api';
import { Medalha } from '@/components/gamificacao/Medalha';
import {
  Target,
  Trophy,
  Sparkles,
  Plus,
  Edit2,
  Trash2,
} from 'lucide-react';

export const MetasView: React.FC = () => {
  const [periodoAtivo, setPeriodoAtivo] = useState<PeriodoMeta>('diaria');

  const { data: metas, isLoading: carregandoMetas } = useMetas();
  const { data: ciclos } = useCiclosMetas();
  const { data: prioridades = [] } = usePrioridades();

  const { mutateAsync: criarMeta, isPending: criando } = useCriarMeta();
  const { mutateAsync: editarMeta, isPending: editando } = useEditarMeta();
  const { mutateAsync: arquivarMeta } = useArquivarMeta();
  const { mutateAsync: atualizarMetas } = useAtualizarMetas();

  // Modais
  const [modalFormAberto, setModalFormAberto] = useState(false);
  const [metaEmEdicao, setMetaEmEdicao] = useState<Meta | null>(null);

  // Form State
  const [formTitulo, setFormTitulo] = useState('');
  const [formPeriodo, setFormPeriodo] = useState<PeriodoMeta>('diaria');
  const [formValor, setFormValor] = useState<number>(30000);
  const [formPctBronze, setFormPctBronze] = useState<number>(70);
  const [formPctPrata, setFormPctPrata] = useState<number>(100);
  const [formPctOuro, setFormPctOuro] = useState<number>(130);

  // Metas filtradas pelo período ativo
  const metaDoPeriodo = useMemo(() => {
    return metas?.find((m) => m.periodo === periodoAtivo);
  }, [metas, periodoAtivo]);

  const cicloDaMeta = useMemo(() => {
    if (!metaDoPeriodo) return null;
    return ciclos?.find((c) => c.meta_id === metaDoPeriodo.id);
  }, [ciclos, metaDoPeriodo]);

  // Cálculo da Meta Mínima sugerida pelas Prioridades (RN-25)
  const metaMinimaSugerida = useMemo(() => {
    const contasPendentes = prioridades.filter((p) => p.status === 'pendente');
    const totalContas = contasPendentes.reduce((acc, p) => acc + p.valor_centavos, 0);
    if (totalContas <= 0) return 0;
    // Base de 25 dias de trabalho no mês (6 dias por semana)
    return Math.ceil(totalContas / 25);
  }, [prioridades]);

  // Abrir criação
  const abrirCriacao = (periodoInicial?: PeriodoMeta) => {
    setMetaEmEdicao(null);
    setFormPeriodo(periodoInicial || periodoAtivo);
    setFormTitulo(
      periodoInicial === 'semanal'
        ? 'Meta da Semana'
        : periodoInicial === 'mensal'
        ? 'Meta do Mês'
        : 'Meta do Dia'
    );
    setFormValor(
      periodoInicial === 'semanal'
        ? 180000
        : periodoInicial === 'mensal'
        ? 750000
        : 30000
    );
    setFormPctBronze(70);
    setFormPctPrata(100);
    setFormPctOuro(130);
    setModalFormAberto(true);
  };

  const abrirEdicao = (m: Meta) => {
    setMetaEmEdicao(m);
    setFormPeriodo(m.periodo);
    setFormTitulo(m.titulo);
    setFormValor(m.valor_alvo);
    setFormPctBronze(m.pct_bronze);
    setFormPctPrata(m.pct_prata);
    setFormPctOuro(m.pct_ouro);
    setModalFormAberto(true);
  };

  const handleSalvar = async () => {
    if (!formTitulo.trim()) {
      toast.erro('Informe um título para a meta.');
      return;
    }
    if (formValor <= 0) {
      toast.erro('Informe um valor maior que zero.');
      return;
    }

    try {
      if (metaEmEdicao) {
        await editarMeta({
          id: metaEmEdicao.id,
          titulo: formTitulo.trim(),
          valorAlvo: formValor,
          pctBronze: formPctBronze,
          pctPrata: formPctPrata,
          pctOuro: formPctOuro,
        });
        toast.sucesso('Meta atualizada com sucesso!');
      } else {
        await criarMeta({
          titulo: formTitulo.trim(),
          periodo: formPeriodo,
          valorAlvo: formValor,
          pctBronze: formPctBronze,
          pctPrata: formPctPrata,
          pctOuro: formPctOuro,
        });
        toast.sucesso('Meta criada com sucesso!');
      }
      await atualizarMetas();
      setModalFormAberto(false);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  const handleUsarMetaMinima = async () => {
    if (metaMinimaSugerida <= 0) return;
    try {
      if (metaDoPeriodo && metaDoPeriodo.periodo === 'diaria') {
        await editarMeta({
          id: metaDoPeriodo.id,
          titulo: metaDoPeriodo.titulo,
          valorAlvo: metaMinimaSugerida,
        });
      } else {
        await criarMeta({
          titulo: 'Meta Diária de Sobrevivência',
          periodo: 'diaria',
          valorAlvo: metaMinimaSugerida,
        });
      }
      await atualizarMetas();
      toast.sucesso(`Meta diária ajustada para ${formatarMoeda(metaMinimaSugerida)}!`);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  // Cálculos do Ciclo Atual
  const valorAlvo = metaDoPeriodo?.valor_alvo ?? 30000;
  const valorAlcancado = cicloDaMeta?.valor_alcancado ?? 0;
  const pctAlcancado = Math.min(200, Math.round((valorAlcancado / Math.max(1, valorAlvo)) * 100));

  const valorBronze = Math.round((valorAlvo * (metaDoPeriodo?.pct_bronze ?? 70)) / 100);
  const valorPrata = valorAlvo;
  const valorOuro = Math.round((valorAlvo * (metaDoPeriodo?.pct_ouro ?? 130)) / 100);

  const nivelAtual = cicloDaMeta?.nivel_atual ?? 'nenhum';

  // Mensagem de incentivo
  const mensagemIncentivo = useMemo(() => {
    if (valorAlcancado < valorBronze) {
      const falta = valorBronze - valorAlcancado;
      return `Faltam ${formatarMoeda(falta)} para garantir o Bronze 🥉`;
    }
    if (valorAlcancado < valorPrata) {
      const falta = valorPrata - valorAlcancado;
      return `Faltam ${formatarMoeda(falta)} para bater a Meta (Prata 🥈)`;
    }
    if (valorAlcancado < valorOuro) {
      const falta = valorOuro - valorAlcancado;
      return `Sensacional! Faltam ${formatarMoeda(falta)} para o Ouro 🥇`;
    }
    return '🎉 Incrível! Você superou o Ouro máximo!';
  }, [valorAlcancado, valorBronze, valorPrata, valorOuro]);

  return (
    <div className="space-y-5 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Metas & Medalhas</h1>
          <p className="text-xs text-texto-3">Seus objetivos de faturamento e conquistas</p>
        </div>
        <Button
          variante="primario"
          className="text-xs !h-9 !py-0"
          onClick={() => abrirCriacao()}
          icone={<Plus className="size-4" />}
        >
          Nova Meta
        </Button>
      </div>

      {/* Seletor de Períodos */}
      <div className="flex items-center gap-1.5 p-1 bg-bg-2 rounded-lg border border-line/60">
        {(['diaria', 'semanal', 'mensal'] as PeriodoMeta[]).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriodoAtivo(p)}
            className={`flex-1 py-2 text-xs font-bold rounded-md capitalize transition-all ${
              periodoAtivo === p
                ? 'bg-laranja-500/20 text-laranja-400 border border-laranja-500/50 shadow-sm'
                : 'text-texto-3 hover:text-texto-1'
            }`}
          >
            {p === 'diaria' ? 'Diária' : p === 'semanal' ? 'Semanal' : 'Mensal'}
          </button>
        ))}
      </div>

      {/* Sugestão de Meta Mínima pelas Prioridades (RN-25) */}
      {periodoAtivo === 'diaria' && metaMinimaSugerida > 0 && (
        <Card className="p-3.5 bg-blue-500/10 border-blue-500/30 flex items-center justify-between gap-3">
          <div className="space-y-0.5 min-w-0">
            <span className="text-[11px] font-bold text-blue-400 uppercase tracking-wide flex items-center gap-1">
              <Sparkles className="size-3.5" /> Meta sugerida pelas suas contas
            </span>
            <p className="text-xs text-texto-2">
              Para pagar suas prioridades no mês, você precisa fazer no mínimo{' '}
              <strong className="text-texto-1 font-mono">{formatarMoeda(metaMinimaSugerida)}/dia</strong>.
            </p>
          </div>
          <Button
            variante="secundario"
            className="text-xs h-8 px-2.5 shrink-0"
            onClick={handleUsarMetaMinima}
          >
            Usar essa meta
          </Button>
        </Card>
      )}

      {/* Card Principal da Meta Ativa */}
      {carregandoMetas ? (
        <Skeleton className="h-64 w-full rounded-xl" />
      ) : metaDoPeriodo ? (
        <Card variante="destaque" className="p-5 space-y-5 relative overflow-hidden shadow-neon">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-laranja-400">
                {metaDoPeriodo.titulo}
              </span>
              <p className="text-3xl font-black font-mono text-texto-1">
                {formatarMoeda(valorAlcancado)}
              </p>
              <p className="text-xs text-texto-3">
                Alvo (100%): <strong className="text-texto-2 font-mono">{formatarMoeda(valorAlvo)}</strong>
              </p>
            </div>

            <div className="flex flex-col items-center gap-1">
              <Medalha nivel={nivelAtual} tamanho="lg" />
              <span className="text-[11px] font-bold capitalize text-texto-2">
                {nivelAtual === 'nenhum' ? 'Sem medalha' : nivelAtual}
              </span>
            </div>
          </div>

          {/* Barra de Progresso com os Marcos 🥉 🥈 🥇 */}
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between text-xs font-medium text-texto-3">
              <span>{pctAlcancado}% da meta</span>
              <span className="text-laranja-400 font-bold">{mensagemIncentivo}</span>
            </div>

            <div className="relative h-3 w-full bg-bg-3 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  nivelAtual === 'ouro'
                    ? 'bg-gradient-to-r from-laranja-500 to-vermelho-500 shadow-[0_0_12px_rgba(255,45,45,0.6)]'
                    : nivelAtual === 'prata'
                    ? 'bg-gradient-to-r from-laranja-400 to-laranja-500 shadow-[0_0_10px_rgba(255,122,0,0.5)]'
                    : 'bg-laranja-500'
                }`}
                style={{ width: `${Math.min(100, (pctAlcancado / 130) * 100)}%` }}
              />

              {/* Linhas de marcação dos 70% e 100% */}
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/40"
                style={{ left: `${(70 / 130) * 100}%` }}
                title="Bronze (70%)"
              />
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-white/70"
                style={{ left: `${(100 / 130) * 100}%` }}
                title="Prata (100%)"
              />
            </div>

            {/* Valores dos Marcos */}
            <div className="flex justify-between text-[11px] text-texto-3 pt-1">
              <div className="text-left">
                <span className="text-[#CD7F32] font-bold">🥉 {formatarMoeda(valorBronze)}</span>
                <p className="text-[10px]">70%</p>
              </div>
              <div className="text-center">
                <span className="text-[#C9CED6] font-bold">🥈 {formatarMoeda(valorPrata)}</span>
                <p className="text-[10px]">100% (Alvo)</p>
              </div>
              <div className="text-right">
                <span className="text-[#FFC83D] font-bold">🥇 {formatarMoeda(valorOuro)}</span>
                <p className="text-[10px]">130%</p>
              </div>
            </div>
          </div>

          {/* Botões de Ação na Meta */}
          <div className="pt-3 border-t border-line/60 flex items-center justify-between">
            <button
              type="button"
              onClick={() => abrirEdicao(metaDoPeriodo)}
              className="text-xs text-texto-3 hover:text-texto-1 flex items-center gap-1 font-semibold"
            >
              <Edit2 className="size-3.5" /> Editar Valores
            </button>
            <button
              type="button"
              onClick={async () => {
                if (confirm(`Deseja arquivar "${metaDoPeriodo.titulo}"?`)) {
                  await arquivarMeta(metaDoPeriodo.id);
                  toast.info('Meta arquivada.');
                }
              }}
              className="text-xs text-texto-3 hover:text-negativo flex items-center gap-1 font-semibold"
            >
              <Trash2 className="size-3.5" /> Arquivar
            </button>
          </div>
        </Card>
      ) : (
        /* Estado sem meta cadastrada para este período */
        <Card className="text-center py-12 space-y-3 bg-bg-2 border-line/60">
          <Target className="size-10 text-texto-3 mx-auto" />
          <h3 className="font-bold text-base text-texto-1">Nenhuma meta {periodoAtivo} criada</h3>
          <p className="text-xs text-texto-3 max-w-xs mx-auto">
            Defina uma meta para acompanhar seu progresso e ganhar medalhas e estrelas rodando.
          </p>
          <Button
            variante="primario"
            className="text-xs !h-9"
            onClick={() => abrirCriacao(periodoAtivo)}
          >
            Criar Meta {periodoAtivo === 'diaria' ? 'Diária' : periodoAtivo === 'semanal' ? 'Semanal' : 'Mensal'}
          </Button>
        </Card>
      )}

      {/* Card Explicativo das Medalhas */}
      <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
        <h4 className="font-bold text-sm text-texto-1 flex items-center gap-2">
          <Trophy className="size-4 text-laranja-400" />
          Como funcionam as medalhas?
        </h4>
        <div className="space-y-2 text-xs text-texto-2">
          <p>
            • 🥉 <strong>Bronze (70%):</strong> Bateu o mínimo do dia. Você ganha <strong>1 estrela ⭐</strong>.
          </p>
          <p>
            • 🥈 <strong>Prata (100%):</strong> Meta batida! Você ganha mais <strong>2 estrelas ⭐</strong> (3 no total).
          </p>
          <p>
            • 🥇 <strong>Ouro (130%):</strong> Superou a meta! Você ganha mais <strong>2 estrelas ⭐</strong> (5 no total).
          </p>
          <p className="text-texto-3 pt-1">
            As estrelas acumulam no seu perfil e fazem você subir de fase até se tornar uma <strong>Lenda do Volante</strong>!
          </p>
        </div>
      </Card>

      {/* Modal de Criação / Edição de Meta */}
      <Modal
        aberto={modalFormAberto}
        aoFechar={() => setModalFormAberto(false)}
        titulo={metaEmEdicao ? 'Editar Meta' : 'Criar Nova Meta'}
        descricao="Defina o valor alvo e acompanhe os marcos de medalhas."
        rodape={
          <div className="flex gap-2 w-full sm:justify-end">
            <Button variante="fantasma" onClick={() => setModalFormAberto(false)}>
              Cancelar
            </Button>
            <Button variante="primario" onClick={handleSalvar} carregando={criando || editando}>
              Salvar Meta
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            rotulo="Nome da meta"
            placeholder="Ex: Meta do Dia, Meta de Final de Semana"
            value={formTitulo}
            onChange={(e) => setFormTitulo(e.target.value)}
          />

          <MoneyInput
            rotulo="Valor alvo (100% - Prata)"
            valor={formValor}
            onValorChange={setFormValor}
            grande
          />

          {/* Prévia dos Valores das Medalhas */}
          <div className="p-3 bg-bg-2 border border-line/60 rounded-md space-y-2">
            <span className="text-xs font-bold text-texto-2 uppercase tracking-wide">
              Prévia dos Marcos de Medalha
            </span>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-bg-3 rounded border border-line/40">
                <span className="text-[#CD7F32] font-black">🥉 Bronze ({formPctBronze}%)</span>
                <p className="font-mono font-bold text-texto-1 mt-1">
                  {formatarMoeda(Math.round((formValor * formPctBronze) / 100))}
                </p>
              </div>
              <div className="p-2 bg-bg-3 rounded border border-line/40">
                <span className="text-[#C9CED6] font-black">🥈 Prata ({formPctPrata}%)</span>
                <p className="font-mono font-bold text-texto-1 mt-1">
                  {formatarMoeda(formValor)}
                </p>
              </div>
              <div className="p-2 bg-bg-3 rounded border border-line/40">
                <span className="text-[#FFC83D] font-black">🥇 Ouro ({formPctOuro}%)</span>
                <p className="font-mono font-bold text-texto-1 mt-1">
                  {formatarMoeda(Math.round((formValor * formPctOuro) / 100))}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
