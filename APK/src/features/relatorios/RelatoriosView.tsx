import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Estados';
import { useHistoricoDias, type DiaHistoricoComResumo } from '@/features/historico/api';
import { formatarMoeda } from '@/lib/money';
import { exportarRelatorioMD, exportarDiasCSV, imprimirRelatorioPDF } from '@/lib/exportacao';
import {
  TrendingUp,
  Download,
  Printer,
  FileText,
  Clock,
  Car,
  Calendar,
  Sparkles,
  Trophy,
} from 'lucide-react';

type PeriodoRelatorio = 'semana' | 'mes' | 'ano' | 'tudo';

export const RelatoriosView: React.FC = () => {
  const [periodo, setPeriodo] = useState<PeriodoRelatorio>('mes');

  const { data: dias = [], isLoading } = useHistoricoDias();

  // Filtro de dias conforme o período escolhido
  const diasFiltrados = useMemo(() => {
    const agora = new Date();

    return dias.filter((d) => {
      if (periodo === 'tudo') return true;

      const dataDia = new Date(d.data_referencia + 'T12:00:00');

      if (periodo === 'semana') {
        const seteDiasAtras = new Date(agora);
        seteDiasAtras.setDate(agora.getDate() - 7);
        return dataDia >= seteDiasAtras;
      }

      if (periodo === 'mes') {
        return (
          dataDia.getFullYear() === agora.getFullYear() &&
          dataDia.getMonth() === agora.getMonth()
        );
      }

      if (periodo === 'ano') {
        return dataDia.getFullYear() === agora.getFullYear();
      }

      return true;
    });
  }, [dias, periodo]);

  // Agregações
  const totais = useMemo(() => {
    let receita = 0;
    let despesas = 0;
    let corridas = 0;
    let km = 0;
    let minutosOnline = 0;

    for (const d of diasFiltrados) {
      receita += d.receita_centavos;
      despesas += d.despesas_centavos;
      corridas += d.corridas;
      if (d.km_final && d.km_inicial) {
        km += Math.max(0, d.km_final - d.km_inicial);
      }
      minutosOnline += d.minutos_online || 0;
    }

    const lucro = receita - despesas;
    const horasOnline = minutosOnline / 60;
    const rendimentoHora = horasOnline > 0 ? Math.round(lucro / horasOnline) : 0;
    const rendimentoKmCentavos = km > 0 ? Math.round(lucro / km) : 0;
    const margemLucro = receita > 0 ? Math.round((lucro / receita) * 100) : 0;

    return {
      receita,
      despesas,
      lucro,
      corridas,
      km,
      horasOnline,
      rendimentoHora,
      rendimentoKmCentavos,
      margemLucro,
      diasRodados: diasFiltrados.length,
    };
  }, [diasFiltrados]);

  // Nome do período para exibição
  const nomePeriodo =
    periodo === 'semana'
      ? 'Últimos 7 dias'
      : periodo === 'mes'
      ? 'Mês Atual'
      : periodo === 'ano'
      ? 'Ano Atual'
      : 'Histórico Completo';

  const handleExportarMD = () => {
    exportarRelatorioMD({
      periodo: nomePeriodo,
      receita: totais.receita,
      despesas: totais.despesas,
      lucro: totais.lucro,
      corridas: totais.corridas,
      kmRodados: totais.km,
      horasOnline: totais.horasOnline,
      dias: diasFiltrados.map((d) => ({
        data_referencia: d.data_referencia,
        status: d.status,
        receita_centavos: d.receita_centavos,
        despesas_centavos: d.despesas_centavos,
        lucro_centavos: d.lucro_centavos,
        km_rodados: d.km_final && d.km_inicial ? d.km_final - d.km_inicial : undefined,
        qtd_corridas: d.corridas,
      })),
    });
  };

  const handleExportarCSV = () => {
    exportarDiasCSV(
      diasFiltrados.map((d) => ({
        data_referencia: d.data_referencia,
        status: d.status,
        receita_centavos: d.receita_centavos,
        despesas_centavos: d.despesas_centavos,
        lucro_centavos: d.lucro_centavos,
        km_rodados: d.km_final && d.km_inicial ? d.km_final - d.km_inicial : undefined,
        qtd_corridas: d.corridas,
      }))
    );
  };

  return (
    <div className="space-y-5 pb-20 print:p-6 print:pb-0">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Relatórios & Rentabilidade</h1>
          <p className="text-xs text-texto-3">Análise financeira de desempenho, horas e quilometragem</p>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2 print:hidden">
          <Button
            variante="secundario"
            className="text-xs h-9 px-2.5"
            onClick={handleExportarCSV}
            icone={<Download className="size-3.5" />}
          >
            CSV
          </Button>
          <Button
            variante="secundario"
            className="text-xs h-9 px-2.5"
            onClick={handleExportarMD}
            icone={<FileText className="size-3.5" />}
          >
            .MD
          </Button>
          <Button
            variante="primario"
            className="text-xs h-9 px-2.5"
            onClick={() => imprimirRelatorioPDF()}
            icone={<Printer className="size-3.5" />}
          >
            Imprimir / PDF
          </Button>
        </div>
      </div>

      {/* Seletor de Período */}
      <div className="flex items-center gap-1.5 p-1 bg-bg-2 rounded-lg border border-line/60 print:hidden">
        {(
          [
            { id: 'semana', rotulo: '7 Dias' },
            { id: 'mes', rotulo: 'Este Mês' },
            { id: 'ano', rotulo: 'Este Ano' },
            { id: 'tudo', rotulo: 'Tudo' },
          ] as const
        ).map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriodo(item.id)}
            className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
              periodo === item.id
                ? 'bg-laranja-500/20 text-laranja-400 border border-laranja-500/50 shadow-sm'
                : 'text-texto-3 hover:text-texto-1'
            }`}
          >
            {item.rotulo}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full rounded-xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
      ) : (
        <>
          {/* Card Destaque: Lucro Líquido */}
          <Card variante="destaque" className="p-5 space-y-4 shadow-neon">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-laranja-400">
                  LUCRO LÍQUIDO ({nomePeriodo.toUpperCase()})
                </span>
                <p className="text-3xl sm:text-4xl font-black font-mono text-texto-1 mt-1">
                  {formatarMoeda(totais.lucro)}
                </p>
                <p className="text-xs text-texto-3 mt-1">
                  Margem de lucro: <strong className="text-positivo">{totais.margemLucro}%</strong> do total bruto
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-laranja-500/20 border border-laranja-500/40 text-laranja-400 text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="size-4" />
                <span>{totais.diasRodados} dias rodados</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-line/60">
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-texto-3 block">Receita Bruta Total</span>
                <p className="font-mono font-bold text-positivo text-base">
                  {formatarMoeda(totais.receita)}
                </p>
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-texto-3 block">Despesas Operacionais</span>
                <p className="font-mono font-bold text-negativo text-base">
                  {formatarMoeda(totais.despesas)}
                </p>
              </div>
            </div>
          </Card>

          {/* Indicadores de Rentabilidade (RN-16) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Lucro por Hora */}
            <Card className="p-3.5 bg-bg-2 border-line/60 space-y-1">
              <span className="text-[11px] font-bold text-texto-3 uppercase tracking-wider block flex items-center gap-1">
                <Clock className="size-3.5 text-laranja-400" /> Ganho por Hora
              </span>
              <p className="text-lg font-black font-mono text-texto-1">
                {formatarMoeda(totais.rendimentoHora)}
                <span className="text-[10px] text-texto-3 font-normal"> /h</span>
              </p>
              <span className="text-[10px] text-texto-3 block">
                {totais.horasOnline.toFixed(1)} horas online
              </span>
            </Card>

            {/* Lucro por Km */}
            <Card className="p-3.5 bg-bg-2 border-line/60 space-y-1">
              <span className="text-[11px] font-bold text-texto-3 uppercase tracking-wider block flex items-center gap-1">
                <Car className="size-3.5 text-amber-400" /> Lucro por Km
              </span>
              <p className="text-lg font-black font-mono text-texto-1">
                {formatarMoeda(totais.rendimentoKmCentavos)}
                <span className="text-[10px] text-texto-3 font-normal"> /km</span>
              </p>
              <span className="text-[10px] text-texto-3 block">{totais.km} km rodados</span>
            </Card>

            {/* Total de Corridas */}
            <Card className="p-3.5 bg-bg-2 border-line/60 space-y-1">
              <span className="text-[11px] font-bold text-texto-3 uppercase tracking-wider block flex items-center gap-1">
                <TrendingUp className="size-3.5 text-emerald-400" /> Total Corridas
              </span>
              <p className="text-lg font-black font-mono text-texto-1">
                {totais.corridas}
                <span className="text-[10px] text-texto-3 font-normal"> viagens</span>
              </p>
              <span className="text-[10px] text-texto-3 block">
                Média:{' '}
                {totais.diasRodados > 0
                  ? Math.round(totais.corridas / totais.diasRodados)
                  : 0}{' '}
                /dia
              </span>
            </Card>

            {/* Média Diária de Lucro */}
            <Card className="p-3.5 bg-bg-2 border-line/60 space-y-1">
              <span className="text-[11px] font-bold text-texto-3 uppercase tracking-wider block flex items-center gap-1">
                <Calendar className="size-3.5 text-blue-400" /> Média Diária
              </span>
              <p className="text-lg font-black font-mono text-texto-1">
                {formatarMoeda(
                  totais.diasRodados > 0
                    ? Math.round(totais.lucro / totais.diasRodados)
                    : 0
                )}
              </p>
              <span className="text-[10px] text-texto-3 block">Líquido por dia trabalhado</span>
            </Card>
          </div>

          {/* Gráfico Visual de Evolução Diária (Barras Proporcionais Modernas) */}
          {diasFiltrados.length > 0 && (
            <GraficoEvolucaoLucro dias={diasFiltrados} />
          )}
        </>
      )}
    </div>
  );
};

function extrairInfoData(dataRef: string) {
  const [ano, mes, dia] = dataRef.split('-').map(Number);
  const data = new Date(ano, mes - 1, dia, 12, 0, 0);
  const diaSemana = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
  const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}`;
  return {
    dia: String(dia).padStart(2, '0'),
    diaSemana,
    dataFormatada,
  };
}

function formatarValorCurto(centavos: number) {
  const reais = centavos / 100;
  if (Math.abs(reais) >= 1000) {
    return `R$ ${(reais / 1000).toFixed(1)}k`;
  }
  return `R$ ${reais.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

interface GraficoEvolucaoProps {
  dias: DiaHistoricoComResumo[];
}

function GraficoEvolucaoLucro({ dias }: GraficoEvolucaoProps) {
  // Ordena cronologicamente do dia mais antigo ao mais recente
  const diasOrdenados = useMemo(() => {
    return [...dias].sort((a, b) => a.data_referencia.localeCompare(b.data_referencia));
  }, [dias]);

  if (diasOrdenados.length === 0) return null;

  // Encontra o maior lucro positivo para servir de teto da escala
  const maiorLucro = Math.max(1, ...diasOrdenados.map((d) => d.lucro_centavos));
  const diaMaiorLucro = diasOrdenados.find((d) => d.lucro_centavos === maiorLucro);

  // O teto recebe folga de 25% para que o rótulo com o valor fique folgado em cima da barra
  const tetoEscala = Math.max(maiorLucro * 1.25, 1000);

  // Se forem poucos dias (<= 5), centralizamos com bom espaçamento. Se forem mais, alinhamos com scroll
  const centralizar = diasOrdenados.length <= 5;

  return (
    <Card className="p-4 sm:p-5 bg-bg-2 border-line/60 space-y-4">
      {/* Cabeçalho do Gráfico */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line/40 pb-3">
        <div>
          <h3 className="font-bold text-sm text-texto-1">Evolução do Lucro por Dia</h3>
          <p className="text-[11px] text-texto-3">
            Histórico diário líquido apurado no período
          </p>
        </div>

        {diaMaiorLucro && diaMaiorLucro.lucro_centavos > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold self-start sm:self-auto">
            <Trophy className="size-3.5 shrink-0 text-amber-400" />
            <span>
              Melhor dia:{' '}
              <strong className="text-texto-1 font-mono">
                {formatarMoeda(diaMaiorLucro.lucro_centavos)}
              </strong>{' '}
              ({extrairInfoData(diaMaiorLucro.data_referencia).dataFormatada})
            </span>
          </div>
        )}
      </div>

      {/* Área do Gráfico */}
      <div className="relative pt-6 pb-2">
        {/* Linhas de Grade de Fundo */}
        <div className="absolute inset-x-0 top-6 bottom-14 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-line flex items-center justify-between">
            <span className="text-[9px] font-mono text-texto-3 -mt-3">
              {formatarValorCurto(tetoEscala)}
            </span>
          </div>
          <div className="border-b border-dashed border-line flex items-center justify-between">
            <span className="text-[9px] font-mono text-texto-3 -mt-3">
              {formatarValorCurto(Math.round(tetoEscala / 2))}
            </span>
          </div>
          <div className="border-b border-line" />
        </div>

        {/* Trilho de Barras */}
        <div
          className={`h-48 w-full flex items-end gap-3 sm:gap-5 overflow-x-auto no-scrollbar px-2 relative z-10 ${
            centralizar ? 'justify-center' : 'justify-start'
          }`}
        >
          {diasOrdenados.map((d) => {
            const ehPositivo = d.lucro_centavos > 0;
            const ehNegativo = d.lucro_centavos < 0;

            // Altura relativa em % baseada no teto com folga
            const pct = ehPositivo
              ? Math.min(85, Math.max(8, Math.round((d.lucro_centavos / tetoEscala) * 100)))
              : ehNegativo
              ? Math.min(40, Math.max(8, Math.round((Math.abs(d.lucro_centavos) / tetoEscala) * 100)))
              : 3;

            const infoData = extrairInfoData(d.data_referencia);
            const ehMelhorDia = d.id === diaMaiorLucro?.id && ehPositivo;

            return (
              <div
                key={d.id}
                className="w-14 sm:w-16 shrink-0 flex flex-col items-center justify-end h-full relative group"
              >
                {/* Tooltip flutuante no Hover / Focus */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30 min-w-[140px]">
                  <div className="bg-bg-1 border border-line/80 rounded-lg p-2 shadow-xl text-center space-y-1 backdrop-blur-md">
                    <span className="text-[10px] font-bold text-texto-2 block border-b border-line/40 pb-0.5">
                      {infoData.dataFormatada} ({infoData.diaSemana})
                    </span>
                    <p
                      className={`text-xs font-mono font-black ${
                        ehPositivo ? 'text-positivo' : ehNegativo ? 'text-negativo' : 'text-texto-2'
                      }`}
                    >
                      {formatarMoeda(d.lucro_centavos)}
                    </p>
                    <div className="text-[9px] text-texto-3 flex justify-between gap-2 pt-0.5 font-mono">
                      <span>Rec: {formatarMoeda(d.receita_centavos)}</span>
                      <span>Desp: {formatarMoeda(d.despesas_centavos)}</span>
                    </div>
                    {d.corridas > 0 && (
                      <span className="text-[9px] text-texto-3 block">
                        {d.corridas} viagens realizadas
                      </span>
                    )}
                  </div>
                  <div className="w-2 h-2 bg-bg-1 border-r border-b border-line/80 rotate-45 -mt-1" />
                </div>

                {/* Coluna Visual da Barra */}
                <div className="w-full flex flex-col items-center justify-end flex-1 pb-1">
                  {/* Valor monetário flutuando sobre a barra */}
                  <span
                    className={`text-[10px] font-mono font-bold truncate max-w-full px-0.5 mb-1 transition-transform group-hover:scale-110 ${
                      ehMelhorDia
                        ? 'text-amber-300 font-black'
                        : ehPositivo
                        ? 'text-texto-1'
                        : ehNegativo
                        ? 'text-negativo'
                        : 'text-texto-3'
                    }`}
                  >
                    {formatarValorCurto(d.lucro_centavos)}
                  </span>

                  {/* A Barra com Largura Controlada e Gradiente */}
                  <div
                    style={{ height: `${pct}%` }}
                    className={`w-7 sm:w-8 max-w-[32px] rounded-t-md transition-all duration-300 group-hover:brightness-125 ${
                      ehPositivo
                        ? ehMelhorDia
                          ? 'bg-gradient-to-t from-laranja-600 via-laranja-500 to-amber-300 shadow-[0_0_12px_rgba(255,160,0,0.35)]'
                          : 'bg-gradient-to-t from-laranja-600 to-amber-400 shadow-[0_0_8px_rgba(255,122,0,0.2)]'
                        : ehNegativo
                        ? 'bg-gradient-to-t from-vermelho-600 to-vermelho-400 shadow-[0_0_8px_rgba(239,68,68,0.25)]'
                        : 'bg-line/60 rounded-sm'
                    }`}
                  />
                </div>

                {/* Eixo X: Data e Dia da Semana */}
                <div className="pt-2 border-t border-line/80 w-full flex flex-col items-center">
                  <span className="text-xs font-black font-mono text-texto-1 group-hover:text-laranja-400 transition-colors">
                    {infoData.dia}
                  </span>
                  <span className="text-[10px] text-texto-3 font-semibold uppercase">
                    {infoData.diaSemana}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
