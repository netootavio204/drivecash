import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Estados';
import { useHistoricoDias } from '@/features/historico/api';
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

          {/* Gráfico Visual de Evolução Diária (Barras SVG Nativas) */}
          {diasFiltrados.length > 0 && (
            <Card className="p-4 bg-bg-2 border-line/60 space-y-3">
              <h3 className="font-bold text-sm text-texto-1">Evolução do Lucro por Dia</h3>

              <div className="h-40 w-full flex items-end gap-2 pt-4 pb-2 px-1 overflow-x-auto no-scrollbar">
                {(() => {
                  const maxLucro = Math.max(
                    1,
                    ...diasFiltrados.map((d) => Math.max(0, d.lucro_centavos))
                  );

                  return diasFiltrados.slice(-14).map((d) => {
                    const alturaPct = Math.max(8, Math.round((Math.max(0, d.lucro_centavos) / maxLucro) * 100));

                    return (
                      <div
                        key={d.id}
                        className="flex-1 min-w-[32px] flex flex-col items-center gap-1.5 h-full justify-end group"
                        title={`${d.data_referencia}: ${formatarMoeda(d.lucro_centavos)}`}
                      >
                        <div
                          className="w-full rounded-t-md bg-gradient-to-t from-laranja-500 to-amber-400 transition-all group-hover:brightness-125"
                          style={{ height: `${alturaPct}%` }}
                        />
                        <span className="text-[9px] text-texto-3 font-mono truncate">
                          {d.data_referencia.slice(8, 10)}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
