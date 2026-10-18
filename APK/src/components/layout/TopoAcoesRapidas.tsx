import React, { useState, useEffect } from 'react';
import { Coffee, Play, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { toast } from '@/components/ui/Toast';
import { traduzirErro } from '@/lib/erros';
import type { DiaTrabalho } from '@/features/dia/api';
import {
  estaEmPausa,
  calcularMinutosPausa,
  calcularTempoLiquido,
  usePausarDia,
  useRetomarDia,
} from '@/features/dia/api';

export type TopoAcoesRapidasProps = {
  diaAtual: DiaTrabalho | null;
  aoAbrirDia: () => void;
  aoFecharDia: () => void;
};

export type TipoIntervalo = 'descanso' | 'refeicao' | 'abastecimento' | 'outro';

export const TopoAcoesRapidas: React.FC<TopoAcoesRapidasProps> = ({
  diaAtual,
  aoAbrirDia,
  aoFecharDia,
}) => {
  const { mutateAsync: pausarDia, isPending: pausando } = usePausarDia();
  const { mutateAsync: retomarDia, isPending: retomando } = useRetomarDia();

  const [modalIntervaloAberto, setModalIntervaloAberto] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState<TipoIntervalo>('descanso');

  // Relógio do tempo decorrido ao vivo
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 30000); // atualiza a cada 30s
    return () => clearInterval(timer);
  }, []);

  const emPausa = estaEmPausa(diaAtual);
  const minutosPausa = calcularMinutosPausa(diaAtual);
  const tempoInfo = calcularTempoLiquido(diaAtual);

  const handleConfirmarPausa = async () => {
    if (!diaAtual?.id) return;
    try {
      await pausarDia({ diaId: diaAtual.id, motivo: tipoSelecionado });
      setModalIntervaloAberto(false);
      toast.info(`Intervalo iniciado (${tipoSelecionado}). Bom descanso!`);
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  const handleRetomar = async () => {
    if (!diaAtual?.id) return;
    try {
      await retomarDia({ diaId: diaAtual.id });
      toast.sucesso('Rodagem retomada! Boas corridas!');
    } catch (err) {
      toast.erro(traduzirErro(err));
    }
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-bg-1/95 backdrop-blur-md border-b border-line shadow-sm px-3 py-2 pt-[max(0.5rem,env(safe-area-inset-top))]">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {diaAtual ? (
            <>
              {/* Chip de Status do Dia Aberto */}
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold border shrink-0 ${
                    emPausa
                      ? 'bg-amber-500/15 border-amber-500/40 text-amber-400 animate-pulse'
                      : 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                  }`}
                >
                  <span
                    className={`size-2 rounded-full ${
                      emPausa ? 'bg-amber-400' : 'bg-emerald-400 animate-ping'
                    }`}
                  />
                  <span>
                    {emPausa ? 'Em Intervalo' : 'Dia Aberto'} • {tempoInfo.horasFormatadas}
                  </span>
                </span>
                {emPausa && minutosPausa > 0 && (
                  <span className="text-[11px] font-mono text-amber-300/90 hidden sm:inline">
                    ({minutosPausa} min de pausa)
                  </span>
                )}
              </div>

              {/* Botões Rápidos de Ação: Intervalo e Fechar Dia */}
              <div className="flex items-center gap-2 shrink-0">
                {emPausa ? (
                  <button
                    type="button"
                    onClick={handleRetomar}
                    disabled={retomando}
                    className="min-h-[48px] px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    <Play className="size-4 fill-black" />
                    <span>Retomar</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setModalIntervaloAberto(true)}
                    disabled={pausando}
                    className="min-h-[48px] px-3.5 py-2 rounded-xl bg-bg-2 hover:bg-bg-3 border border-amber-500/40 text-amber-400 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  >
                    <Coffee className="size-4" />
                    <span>Intervalo</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={aoFecharDia}
                  className="min-h-[48px] px-3.5 py-2 rounded-xl bg-bg-2 hover:bg-bg-3 border border-line text-texto-1 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer hover:border-laranja-500/50"
                >
                  <CheckCircle className="size-4 text-laranja-400" />
                  <span className="hidden xs:inline">Fechar Dia</span>
                  <span className="xs:hidden">Fechar</span>
                </button>
              </div>
            </>
          ) : (
            /* Chip e Botão com Dia Fechado */
            <div className="w-full flex items-center justify-between">
              <span className="flex items-center gap-2 text-xs font-bold text-texto-3">
                <span className="size-2 rounded-full bg-zinc-600" />
                Dia Fechado
              </span>
              <button
                type="button"
                onClick={aoAbrirDia}
                className="min-h-[48px] px-4 py-2 rounded-xl bg-laranja-500 hover:bg-laranja-400 text-black font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-neon active:scale-95 cursor-pointer"
              >
                <Clock className="size-4" />
                <span>Abrir Dia</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Modal de Escolha do Tipo de Intervalo */}
      <Modal
        aberto={modalIntervaloAberto}
        aoFechar={() => setModalIntervaloAberto(false)}
        titulo="Iniciar Intervalo"
      >
        <div className="space-y-4 py-1">
          <p className="text-xs text-texto-2">
            Selecione o motivo da pausa para o cálculo correto do seu tempo líquido trabalhado:
          </p>

          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'descanso', rotulo: 'Descanso ☕' },
              { id: 'refeicao', rotulo: 'Refeição 🍔' },
              { id: 'abastecimento', rotulo: 'Abastecimento ⛽' },
              { id: 'outro', rotulo: 'Outro ⏱' },
            ].map((opcao) => (
              <button
                key={opcao.id}
                type="button"
                onClick={() => setTipoSelecionado(opcao.id as TipoIntervalo)}
                className={`min-h-[48px] p-2.5 rounded-xl border text-xs font-bold text-left transition-all ${
                  tipoSelecionado === opcao.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow-sm'
                    : 'bg-bg-2 border-line text-texto-2 hover:border-amber-500/40'
                }`}
              >
                {opcao.rotulo}
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button
              variante="fantasma"
              onClick={() => setModalIntervaloAberto(false)}
            >
              Cancelar
            </Button>
            <Button
              variante="primario"
              onClick={handleConfirmarPausa}
              carregando={pausando}
              className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold"
            >
              Iniciar Pausa
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
