import React, { useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Estados';
import {
  useGamificacaoUsuario,
  useFases,
  useConquistasCatalogo,
  useConquistasUsuario,
  useAvaliarConquistas,
  type Fase,
} from '@/features/metas/api';
import {
  Trophy,
  Flame,
  Star,
  Lock,
  CheckCircle2,
  Award,
  RefreshCw,
} from 'lucide-react';
import { ModalMudancaFase } from '@/components/gamificacao/ModalMudancaFase';

export const ConquistasView: React.FC = () => {
  const [apenasDesbloqueadas, setApenasDesbloqueadas] = useState(false);
  const [modalFaseAberto, setModalFaseAberto] = useState(false);

  const { data: gamificacao, isLoading: carregandoGamificacao } = useGamificacaoUsuario();
  const { data: fases = [], isLoading: carregandoFases } = useFases();
  const { data: catalogo = [], isLoading: carregandoCatalogo } = useConquistasCatalogo();
  const { data: desbloqueadas = [], isLoading: carregandoDesbloqueadas } = useConquistasUsuario();
  const { mutateAsync: avaliarConquistas, isPending: avaliando } = useAvaliarConquistas();

  // Avaliação automática de conquistas ao entrar na tela
  useEffect(() => {
    void avaliarConquistas();
  }, [avaliarConquistas]);

  // Mapeamento de códigos desbloqueados
  const mapDesbloqueadas = useMemo(() => {
    const map = new Map<string, { desbloqueadaEm: string }>();
    for (const c of desbloqueadas) {
      map.set(c.codigo, { desbloqueadaEm: c.desbloqueada_em });
    }
    return map;
  }, [desbloqueadas]);

  // Fase atual e próxima fase
  const numeroFaseAtual = gamificacao?.fase_atual ?? 1;

  const faseAtual: Fase = useMemo(() => {
    return (
      fases.find((f) => f.numero === numeroFaseAtual) ||
      fases[0] || {
        numero: 1,
        nome: 'Aprendiz',
        estrelas_minimas: 0,
        cor: '#3B82F6',
      }
    );
  }, [fases, numeroFaseAtual]);

  const proximaFase = useMemo(() => {
    if (!fases.length) return null;
    return fases.find((f) => f.numero === faseAtual.numero + 1) || null;
  }, [faseAtual, fases]);

  const estrelasTotais = gamificacao?.estrelas_totais ?? 0;
  const estrelasMinimasAtual = faseAtual.estrelas_minimas;
  const estrelasMinimasProxima = proximaFase?.estrelas_minimas ?? estrelasMinimasAtual;

  const progressoFasePct = useMemo(() => {
    if (!proximaFase) return 100;
    const faixa = estrelasMinimasProxima - estrelasMinimasAtual;
    if (faixa <= 0) return 100;
    const atualNaFaixa = Math.max(0, estrelasTotais - estrelasMinimasAtual);
    return Math.min(100, Math.round((atualNaFaixa / faixa) * 100));
  }, [proximaFase, estrelasMinimasAtual, estrelasMinimasProxima, estrelasTotais]);

  // Filtro de conquistas
  const conquistasFiltradas = useMemo(() => {
    return catalogo.filter((c) => {
      const estaDesbloqueada = mapDesbloqueadas.has(c.codigo);
      if (apenasDesbloqueadas && !estaDesbloqueada) return false;
      return true;
    });
  }, [catalogo, mapDesbloqueadas, apenasDesbloqueadas]);

  const totalDesbloqueadas = mapDesbloqueadas.size;
  const totalCatalogo = catalogo.length || 22;

  const carregando =
    carregandoGamificacao || carregandoFases || carregandoCatalogo || carregandoDesbloqueadas;

  return (
    <div className="space-y-5 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Conquistas & Fases</h1>
          <p className="text-xs text-texto-3">Evolua sua carreira, ganhe estrelas e suba de fase</p>
        </div>
        <button
          type="button"
          onClick={() => avaliarConquistas()}
          disabled={avaliando}
          className="p-2 rounded-lg bg-bg-2 border border-line/60 hover:border-laranja-500/50 text-texto-3 hover:text-texto-1 transition-all disabled:opacity-50"
          title="Verificar novas conquistas"
        >
          <RefreshCw className={`size-4 ${avaliando ? 'animate-spin text-laranja-400' : ''}`} />
        </button>
      </div>

      {/* Card da Fase Atual & Progresso de Estrelas */}
      {carregando ? (
        <Skeleton className="h-44 w-full rounded-xl" />
      ) : (
        <Card
          variante="destaque"
          className="p-5 space-y-4 relative overflow-hidden shadow-neon cursor-pointer"
          onClick={() => setModalFaseAberto(true)}
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider"
                  style={{
                    backgroundColor: `${faseAtual.cor || '#FF7A00'}25`,
                    color: faseAtual.cor || '#FF7A00',
                    border: `1px solid ${faseAtual.cor || '#FF7A00'}60`,
                  }}
                >
                  Fase {faseAtual.numero} de 7
                </span>
                <span className="text-xs font-semibold text-texto-3">Toque para detalhes</span>
              </div>
              <h2 className="text-2xl font-black text-texto-1 tracking-tight">
                {faseAtual.nome}
              </h2>
              <p className="text-xs text-texto-3">
                {faseAtual.numero === 7
                  ? 'Você atingiu o grau máximo de respeito e maestria!'
                  : 'Acumule mais estrelas para desbloquear a próxima fase!'}
              </p>
            </div>

            {/* Total de Estrelas ⭐ */}
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-1/80 border border-amber-500/40 rounded-xl shadow-[0_0_12px_rgba(245,158,11,0.2)]">
                <Star className="size-5 fill-amber-400 text-amber-400" />
                <span className="text-xl font-black font-mono text-texto-1">{estrelasTotais}</span>
              </div>
              <span className="text-[10px] text-texto-3 font-semibold mt-1">Estrelas acumuladas</span>
            </div>
          </div>

          {/* Barra de Progresso até a próxima fase */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-medium text-texto-3">
              <span>
                {proximaFase ? (
                  <>
                    Próxima fase: <strong className="text-texto-1">{proximaFase.nome}</strong>
                  </>
                ) : (
                  <span className="text-laranja-400 font-bold">Nível Máximo Atingido! 🏆</span>
                )}
              </span>
              <span>
                {proximaFase ? (
                  <>
                    Faltam{' '}
                    <strong className="text-amber-400 font-mono">
                      {Math.max(0, estrelasMinimasProxima - estrelasTotais)} ⭐
                    </strong>
                  </>
                ) : (
                  'Lenda Viva'
                )}
              </span>
            </div>

            <div className="relative h-2.5 w-full bg-bg-3 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-laranja-500 via-amber-400 to-laranja-400 rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,122,0,0.5)]"
                style={{ width: `${progressoFasePct}%` }}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Grid de Sequência (Streak 🔥) e Resumo */}
      <div className="grid grid-cols-2 gap-3">
        {/* Streak Atual */}
        <Card className="p-4 bg-bg-2 border-line/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 shrink-0">
            <Flame className="size-6 text-orange-500 animate-pulse" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-texto-3 uppercase tracking-wider block">
              Sequência
            </span>
            <p className="text-lg font-black font-mono text-texto-1">
              {gamificacao?.sequencia_atual ?? 0}{' '}
              <span className="text-xs font-medium text-texto-3">dias</span>
            </p>
            <span className="text-[10px] text-texto-3 block truncate">
              Recorde: {gamificacao?.maior_sequencia ?? 0} dias
            </span>
          </div>
        </Card>

        {/* Total de Conquistas */}
        <Card className="p-4 bg-bg-2 border-line/60 flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 shrink-0">
            <Trophy className="size-6 text-amber-400" />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-bold text-texto-3 uppercase tracking-wider block">
              Conquistas
            </span>
            <p className="text-lg font-black font-mono text-texto-1">
              {totalDesbloqueadas}{' '}
              <span className="text-xs font-medium text-texto-3">/ {totalCatalogo}</span>
            </p>
            <span className="text-[10px] text-texto-3 block truncate">
              {Math.round((totalDesbloqueadas / Math.max(1, totalCatalogo)) * 100)}% concluído
            </span>
          </div>
        </Card>
      </div>

      {/* Filtros e Abas */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs font-bold text-texto-3 uppercase tracking-wider">
          Catálogo Oficial (22 Conquistas)
        </span>
        <label className="flex items-center gap-1.5 text-xs text-texto-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={apenasDesbloqueadas}
            onChange={(e) => setApenasDesbloqueadas(e.target.checked)}
            className="accent-laranja-500 rounded"
          />
          <span>Apenas desbloqueadas</span>
        </label>
      </div>

      {/* Lista / Grid de Conquistas */}
      {carregando ? (
        <div className="space-y-2.5">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : conquistasFiltradas.length === 0 ? (
        <Card className="text-center py-10 space-y-2 bg-bg-2 border-line/60">
          <Trophy className="size-8 text-texto-3 mx-auto" />
          <p className="text-xs text-texto-3">Nenhuma conquista encontrada neste filtro.</p>
        </Card>
      ) : (
        <div className="space-y-2.5">
          {conquistasFiltradas.map((c) => {
            const desbloqueada = mapDesbloqueadas.get(c.codigo);
            const isDesbloqueada = !!desbloqueada;

            return (
              <Card
                key={c.codigo}
                className={`p-3.5 transition-all flex items-start gap-3.5 ${
                  isDesbloqueada
                    ? 'bg-bg-2 border-amber-500/30 hover:border-amber-500/60 shadow-[0_0_12px_rgba(245,158,11,0.08)]'
                    : 'bg-bg-2/50 border-line/40 opacity-70 hover:opacity-90'
                }`}
              >
                {/* Ícone da Conquista */}
                <div
                  className={`p-2.5 rounded-xl shrink-0 border ${
                    isDesbloqueada
                      ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                      : 'bg-bg-3 border-line/60 text-texto-3'
                  }`}
                >
                  {isDesbloqueada ? (
                    <Award className="size-5" />
                  ) : (
                    <Lock className="size-5 text-texto-3/80" />
                  )}
                </div>

                {/* Detalhes */}
                <div className="flex-1 min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-texto-1 truncate">{c.titulo}</span>
                    {isDesbloqueada && (
                      <span className="flex items-center gap-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/30">
                        <CheckCircle2 className="size-3" /> Desbloqueada
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-texto-3 leading-relaxed">{c.descricao}</p>

                  {/* Informações de Recompensa */}
                  <div className="flex items-center gap-3 pt-1 text-[11px] text-texto-3">
                    <span className="flex items-center gap-1 font-bold text-amber-400 font-mono">
                      <Star className="size-3 fill-amber-400" /> +{c.estrelas_bonus} ⭐
                    </span>
                    {desbloqueada?.desbloqueadaEm && (
                      <span className="text-[10px] text-texto-3">
                        Desbloqueada em{' '}
                        {new Date(desbloqueada.desbloqueadaEm).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de Detalhes da Fase */}
      <ModalMudancaFase
        aberto={modalFaseAberto}
        aoFechar={() => setModalFaseAberto(false)}
        faseNova={faseAtual}
      />
    </div>
  );
};
