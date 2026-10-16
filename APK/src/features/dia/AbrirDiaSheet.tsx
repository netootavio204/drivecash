import React, { useState } from 'react';
import { Sheet } from '@/components/ui/Sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MoneyInput } from '@/components/ui/MoneyInput';
import { Card } from '@/components/ui/Card';
import { useAbrirDia } from './api';
import { useSaldoPrincipal } from '@/features/caixa/api';
import { formatarMoeda } from '@/lib/money';
import { dataHojeISO } from '@/lib/datas';
import { traduzirErro } from '@/lib/erros';
import { toast } from '@/components/ui/Toast';
import { Clock, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface AbrirDiaSheetProps {
  aberto: boolean;
  aoFechar: () => void;
}

export const AbrirDiaSheet: React.FC<AbrirDiaSheetProps> = ({ aberto, aoFechar }) => {
  const { saldoCentavos, isLoading: carregandoSaldo } = useSaldoPrincipal();
  const { mutateAsync: abrirDia, isPending } = useAbrirDia();

  const [kmInicial, setKmInicial] = useState<string>('');
  const [dataReferencia, setDataReferencia] = useState<string>(dataHojeISO());
  const [horarioInicio, setHorarioInicio] = useState<string>(
    new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  );
  const [editarDataHora, setEditarDataHora] = useState<boolean>(false);
  const [ajustandoSaldo, setAjustandoSaldo] = useState<boolean>(false);
  const [saldoPersonalizado, setSaldoPersonalizado] = useState<number>(saldoCentavos);
  const [erroMsg, setErroMsg] = useState<string | null>(null);

  const handleConfirmar = async () => {
    setErroMsg(null);
    try {
      const dataRef = dataReferencia || dataHojeISO();
      const km = kmInicial.trim() ? parseInt(kmInicial, 10) : null;
      const saldoParaAbrir = ajustandoSaldo ? saldoPersonalizado : saldoCentavos;

      const [hora, min] = (horarioInicio || '00:00').split(':');
      const abertoEmData = new Date(`${dataRef}T${hora.padStart(2, '0')}:${min ? min.padStart(2, '0') : '00'}:00`);
      const abertoEmISO = !isNaN(abertoEmData.getTime()) ? abertoEmData.toISOString() : undefined;

      await abrirDia({
        dataReferencia: dataRef,
        kmInicial: km,
        saldoConfirmadoCentavos: saldoParaAbrir,
        abertoEm: abertoEmISO,
      });

      // Efeito de confetes ao bater ponto
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#FF2D2D', '#FF7A00', '#FFC83D'],
        });
      } catch {
        // silencioso
      }

      const horaExibicao = horarioInicio || new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      toast.sucesso(`Ponto registrado às ${horaExibicao} (${dataRef}). Bom trabalho!`);
      aoFechar();
    } catch (err) {
      console.error('[Meta Driver] Erro ao abrir dia:', err);
      setErroMsg(traduzirErro(err));
    }
  };

  return (
    <Sheet
      aberto={aberto}
      aoFechar={aoFechar}
      titulo="Bater ponto — Abrir dia"
      descricao="Inicie seu expediente e acompanhe seus ganhos em tempo real."
    >
      <div className="flex flex-col gap-5 pt-2">
        {erroMsg && (
          <div className="p-3 rounded-md bg-negativo/10 border border-negativo/30 text-negativo text-xs flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span>{erroMsg}</span>
          </div>
        )}

        {/* Card do Saldo Acumulado */}
        <Card variante="destaque" className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-texto-2">
            <span className="font-semibold uppercase tracking-wide">Seu caixa acumulado</span>
            <button
              type="button"
              onClick={() => {
                setSaldoPersonalizado(saldoCentavos);
                setAjustandoSaldo(!ajustandoSaldo);
              }}
              className="text-laranja-400 hover:text-laranja-300 font-bold transition-colors underline"
            >
              {ajustandoSaldo ? 'Cancelar ajuste' : 'Ajustar valor'}
            </button>
          </div>

          {ajustandoSaldo ? (
            <div className="mt-2">
              <MoneyInput
                rotulo="Novo valor inicial do caixa"
                valor={saldoPersonalizado}
                onValorChange={setSaldoPersonalizado}
              />
            </div>
          ) : (
            <div className="numero text-3xl font-extrabold text-texto-1">
              {carregandoSaldo ? 'Carregando...' : formatarMoeda(saldoCentavos)}
            </div>
          )}
          <p className="text-[11px] text-texto-3">
            O dinheiro que sobrou do seu último dia de trabalho está seguro aqui.
          </p>
        </Card>

        {/* Km Inicial (Opcional) */}
        <div className="flex flex-col gap-1.5">
          <Input
            rotulo="Km inicial do odômetro (opcional)"
            type="number"
            value={kmInicial}
            onChange={(e) => setKmInicial(e.target.value)}
            ajuda="Pode deixar em branco se não quiser marcar agora."
          />
        </div>

        {/* Data e Horário (Automático ou Retroativo) */}
        <div className="p-3 rounded-md bg-bg-2 border border-line/60 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-texto-2 flex items-center gap-1.5">
              <Clock className="size-3.5 text-laranja-400" />
              Início: {dataReferencia === dataHojeISO() ? 'Hoje' : dataReferencia} às {horarioInicio}
            </span>
            <button
              type="button"
              onClick={() => setEditarDataHora(!editarDataHora)}
              className="text-laranja-400 hover:text-laranja-300 font-bold transition-colors underline text-xs"
            >
              {editarDataHora ? 'Ocultar ajuste' : 'Alterar data/hora'}
            </button>
          </div>

          {editarDataHora && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-line/40">
              <Input
                rotulo="Data de início"
                type="date"
                value={dataReferencia}
                onChange={(e) => setDataReferencia(e.target.value)}
              />
              <Input
                rotulo="Horário de início"
                type="time"
                value={horarioInicio}
                onChange={(e) => setHorarioInicio(e.target.value)}
              />
              {dataReferencia !== dataHojeISO() && (
                <div className="col-span-2 text-[11px] text-amber-400 font-medium">
                  ⚠️ Atenção: você está abrindo o dia com uma data retroativa ({dataReferencia}).
                </div>
              )}
            </div>
          )}
        </div>

        {/* Botão de Ação Principal */}
        <div className="flex flex-col gap-2 mt-3">
          <Button
            variante="primario"
            tamanho="lg"
            bloco
            className="shadow-neon"
            icone={<Clock className="size-5" />}
            onClick={handleConfirmar}
            carregando={isPending}
          >
            Bater ponto — Abrir dia
          </Button>

          <Button variante="fantasma" bloco onClick={aoFechar}>
            Voltar
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
