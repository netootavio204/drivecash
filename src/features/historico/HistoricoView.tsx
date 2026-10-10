import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Skeleton } from '@/components/ui/Estados';
import { useHistoricoDias, useDetalheDia, type DiaHistoricoComResumo } from './api';
import { formatarMoeda } from '@/lib/money';
import { formatarDataCurta } from '@/lib/datas';
import { exportarDiasCSV } from '@/lib/exportacao';
import {
  Calendar as CalendarIcon,
  List,
  ChevronLeft,
  ChevronRight,
  Download,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react';

export const HistoricoView: React.FC = () => {
  const [modoVisualizacao, setModoVisualizacao] = useState<'lista' | 'calendario'>('lista');
  const [mesAtual, setMesAtual] = useState<Date>(() => new Date());
  const [diaSelecionadoId, setDiaSelecionadoId] = useState<string | null>(null);

  const { data: dias = [], isLoading: carregandoDias } = useHistoricoDias();
  const { data: detalhe, isLoading: carregandoDetalhe } = useDetalheDia(diaSelecionadoId);

  // Mapeamento de dias por data YYYY-MM-DD
  const mapDiasPorData = useMemo(() => {
    const map = new Map<string, DiaHistoricoComResumo>();
    for (const d of dias) {
      map.set(d.data_referencia, d);
    }
    return map;
  }, [dias]);

  // Navegação do calendário
  const anoMes = useMemo(() => {
    return {
      ano: mesAtual.getFullYear(),
      mes: mesAtual.getMonth(),
      nomeMes: mesAtual.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  }, [mesAtual]);

  const diasDoMesCalendario = useMemo(() => {
    const primeiroDia = new Date(anoMes.ano, anoMes.mes, 1);
    const ultimoDia = new Date(anoMes.ano, anoMes.mes + 1, 0);

    const lista = [];
    const diaSemanaInicio = primeiroDia.getDay(); // 0 = Domingo

    // Espaços vazios antes do dia 1
    for (let i = 0; i < diaSemanaInicio; i++) {
      lista.push({ vazio: true, key: `empty-${i}` });
    }

    // Dias do mês
    for (let d = 1; d <= ultimoDia.getDate(); d++) {
      const dataStr = `${anoMes.ano}-${String(anoMes.mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dadosDia = mapDiasPorData.get(dataStr);
      lista.push({
        vazio: false,
        diaNumero: d,
        dataStr,
        dadosDia,
        key: dataStr,
      });
    }

    return lista;
  }, [anoMes, mapDiasPorData]);

  const handleMesAnterior = () => {
    setMesAtual(new Date(anoMes.ano, anoMes.mes - 1, 1));
  };

  const handleProximoMes = () => {
    setMesAtual(new Date(anoMes.ano, anoMes.mes + 1, 1));
  };

  const handleExportarDias = () => {
    exportarDiasCSV(
      dias.map((d) => ({
        data_referencia: d.data_referencia,
        status: d.status,
        receita_centavos: d.receita_centavos,
        despesas_centavos: d.despesas_centavos,
        lucro_centavos: d.lucro_centavos,
        km_rodados: d.km_final && d.km_inicial ? Math.max(0, d.km_final - d.km_inicial) : undefined,
        minutos_online: d.minutos_online || undefined,
        qtd_corridas: d.corridas,
      }))
    );
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-texto-1">Histórico</h1>
          <p className="text-xs text-texto-3">Consulte todos os dias rodados e seus resultados</p>
        </div>
        <Button
          variante="secundario"
          className="text-xs h-9 px-3 shrink-0"
          icone={<Download className="size-4" />}
          onClick={handleExportarDias}
        >
          Exportar CSV
        </Button>
      </div>

      {/* Seletor Lista x Calendário */}
      <div className="flex items-center gap-1.5 p-1 bg-bg-2 rounded-lg border border-line/60">
        <button
          type="button"
          onClick={() => setModoVisualizacao('lista')}
          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
            modoVisualizacao === 'lista'
              ? 'bg-laranja-500/20 text-laranja-400 border border-laranja-500/50 shadow-sm'
              : 'text-texto-3 hover:text-texto-1'
          }`}
        >
          <List className="size-4" /> Lista de Dias
        </button>
        <button
          type="button"
          onClick={() => setModoVisualizacao('calendario')}
          className={`flex-1 py-2 text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-all ${
            modoVisualizacao === 'calendario'
              ? 'bg-laranja-500/20 text-laranja-400 border border-laranja-500/50 shadow-sm'
              : 'text-texto-3 hover:text-texto-1'
          }`}
        >
          <CalendarIcon className="size-4" /> Calendário Mensal
        </button>
      </div>

      {/* Conteúdo: Lista ou Calendário */}
      {carregandoDias ? (
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      ) : modoVisualizacao === 'lista' ? (
        /* VISÃO LISTA */
        dias.length === 0 ? (
          <Card className="text-center py-12 space-y-2 bg-bg-2 border-line/60">
            <CalendarIcon className="size-10 text-texto-3 mx-auto" />
            <h3 className="font-bold text-base text-texto-1">Nenhum dia rodado ainda</h3>
            <p className="text-xs text-texto-3">
              Abra seu primeiro dia na tela inicial para começar a registrar sua jornada!
            </p>
          </Card>
        ) : (
          <div className="space-y-2.5">
            {dias.map((d) => {
              const km = d.km_final && d.km_inicial ? Math.max(0, d.km_final - d.km_inicial) : null;
              const lucroPositivo = d.lucro_centavos >= 0;

              return (
                <Card
                  key={d.id}
                  className="p-4 bg-bg-2 border-line/60 hover:border-laranja-500/50 transition-all cursor-pointer space-y-2"
                  onClick={() => setDiaSelecionadoId(d.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-sm text-texto-1">
                        {formatarDataCurta(new Date(d.data_referencia + 'T12:00:00'))}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                          d.status === 'aberto'
                            ? 'bg-laranja-500/20 text-laranja-400 border border-laranja-500/40'
                            : 'bg-bg-3 text-texto-3'
                        }`}
                      >
                        {d.status === 'aberto' ? 'Em andamento' : 'Fechado'}
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`font-mono font-black text-base ${
                          lucroPositivo ? 'text-positivo' : 'text-negativo'
                        }`}
                      >
                        {formatarMoeda(d.lucro_centavos)}
                      </span>
                      <span className="text-[10px] text-texto-3 block">Lucro líquido</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-texto-3 pt-1 border-t border-line/40">
                    <div className="flex items-center gap-3">
                      <span>
                        Receita: <strong className="text-texto-1">{formatarMoeda(d.receita_centavos)}</strong>
                      </span>
                      <span>
                        Despesas: <strong className="text-negativo">{formatarMoeda(d.despesas_centavos)}</strong>
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      {km && <span>{km} km</span>}
                      {d.corridas > 0 && <span>{d.corridas} corridas</span>}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )
      ) : (
        /* VISÃO CALENDÁRIO MENSAL */
        <Card className="p-4 bg-bg-2 border-line/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm text-texto-1 capitalize">{anoMes.nomeMes}</h3>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleMesAnterior}
                className="p-1.5 rounded-lg bg-bg-3 hover:text-texto-1 text-texto-3 transition-colors"
                title="Mês anterior"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={handleProximoMes}
                className="p-1.5 rounded-lg bg-bg-3 hover:text-texto-1 text-texto-3 transition-colors"
                title="Próximo mês"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>

          {/* Cabeçalho dos dias da semana */}
          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-texto-3">
            <span>Dom</span>
            <span>Seg</span>
            <span>Ter</span>
            <span>Qua</span>
            <span>Qui</span>
            <span>Sex</span>
            <span>Sáb</span>
          </div>

          {/* Células dos dias */}
          <div className="grid grid-cols-7 gap-1.5">
            {diasDoMesCalendario.map((item) => {
              if (item.vazio) {
                return <div key={item.key} className="h-14 rounded-lg bg-bg-3/30" />;
              }

              const dia = item.dadosDia;
              const rodou = !!dia;
              const lucro = dia?.lucro_centavos ?? 0;

              return (
                <button
                  key={item.key}
                  type="button"
                  disabled={!rodou}
                  onClick={() => dia && setDiaSelecionadoId(dia.id)}
                  className={`h-14 p-1 rounded-lg border text-left flex flex-col justify-between transition-all ${
                    rodou
                      ? lucro > 0
                        ? 'bg-emerald-500/15 border-emerald-500/30 hover:border-emerald-500/70'
                        : 'bg-red-500/15 border-red-500/30 hover:border-red-500/70'
                      : 'bg-bg-3/50 border-line/30 opacity-60'
                  }`}
                >
                  <span className="text-[11px] font-bold text-texto-2">{item.diaNumero}</span>
                  {rodou && (
                    <span
                      className={`text-[9px] font-mono font-black truncate ${
                        lucro > 0 ? 'text-emerald-400' : 'text-negativo'
                      }`}
                    >
                      {formatarMoeda(lucro)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>
      )}

      {/* Modal de Detalhe do Dia (Somente Leitura) */}
      <Modal
        aberto={!!diaSelecionadoId}
        aoFechar={() => setDiaSelecionadoId(null)}
        titulo={`Detalhes do Dia — ${
          detalhe?.dia.data_referencia ? formatarDataCurta(new Date(detalhe.dia.data_referencia + 'T12:00:00')) : ''
        }`}
        descricao="Resumo completo das corridas, despesas e horas deste dia."
        rodape={
          <Button variante="secundario" bloco onClick={() => setDiaSelecionadoId(null)}>
            Fechar
          </Button>
        }
      >
        {carregandoDetalhe || !detalhe ? (
          <div className="space-y-3 py-4">
            <Skeleton className="h-20 w-full rounded-md" />
            <Skeleton className="h-32 w-full rounded-md" />
          </div>
        ) : (
          <div className="space-y-4 text-xs">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 bg-bg-3 rounded-lg border border-line/40">
                <span className="text-texto-3 block text-[10px]">Receita</span>
                <span className="font-mono font-bold text-positivo">
                  {formatarMoeda(detalhe.receita)}
                </span>
              </div>
              <div className="p-2.5 bg-bg-3 rounded-lg border border-line/40">
                <span className="text-texto-3 block text-[10px]">Despesas</span>
                <span className="font-mono font-bold text-negativo">
                  {formatarMoeda(detalhe.despesas)}
                </span>
              </div>
              <div className="p-2.5 bg-bg-3 rounded-lg border border-line/40">
                <span className="text-texto-3 block text-[10px]">Lucro Líquido</span>
                <span className="font-mono font-black text-laranja-400">
                  {formatarMoeda(detalhe.lucro)}
                </span>
              </div>
            </div>

            {/* Informações Operacionais */}
            <div className="p-3 bg-bg-2 rounded-lg border border-line/40 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-texto-3">Horário de abertura:</span>
                <span className="font-semibold text-texto-1">
                  {new Date(detalhe.dia.aberto_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              {detalhe.dia.fechado_em && (
                <div className="flex justify-between">
                  <span className="text-texto-3">Horário de fechamento:</span>
                  <span className="font-semibold text-texto-1">
                    {new Date(detalhe.dia.fechado_em).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}
              {detalhe.dia.km_inicial && detalhe.dia.km_final && (
                <div className="flex justify-between">
                  <span className="text-texto-3">Km rodados:</span>
                  <span className="font-semibold text-texto-1">
                    {detalhe.dia.km_final - detalhe.dia.km_inicial} km (odômetro: {detalhe.dia.km_inicial} → {detalhe.dia.km_final})
                  </span>
                </div>
              )}
              {detalhe.dia.observacoes && (
                <div className="pt-1 border-t border-line/30 text-texto-2 italic">
                  &ldquo;{detalhe.dia.observacoes}&rdquo;
                </div>
              )}
            </div>

            {/* Lista de Lançamentos do Dia */}
            <div className="space-y-2">
              <span className="font-bold text-texto-2 uppercase tracking-wide text-[11px]">
                Lançamentos ({detalhe.lancamentos.length})
              </span>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 divide-y divide-line/30">
                {detalhe.lancamentos.length === 0 ? (
                  <p className="text-texto-3 py-2 text-center">Nenhum lançamento registrado.</p>
                ) : (
                  detalhe.lancamentos.map((l) => (
                    <div key={l.id} className="pt-1.5 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {l.tipo === 'entrada' ? (
                          <ArrowUpRight className="size-3.5 text-positivo" />
                        ) : (
                          <ArrowDownLeft className="size-3.5 text-negativo" />
                        )}
                        <span className="font-medium text-texto-1">
                          {l.plataformas?.nome || l.categorias?.nome || l.descricao || 'Lançamento'}
                        </span>
                      </div>
                      <span
                        className={`font-mono font-bold ${
                          l.tipo === 'entrada' ? 'text-positivo' : 'text-negativo'
                        }`}
                      >
                        {l.tipo === 'entrada' ? '+' : '−'}
                        {formatarMoeda(l.valor_centavos)}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
