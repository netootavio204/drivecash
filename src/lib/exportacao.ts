/**
 * Módulo de Exportações (CSV, Markdown, Impressão/PDF) e Backup JSON (Fase 6)
 */

import { formatarMoeda } from './money';

export interface LancamentoExportavel {
  id: string;
  ocorrido_em: string;
  tipo: string;
  valor_centavos: number;
  plataforma_nome?: string;
  categoria_nome?: string;
  descricao?: string;
  qtd_corridas?: number;
  meio_pagamento?: string;
}

export interface DiaExportavel {
  data_referencia: string;
  status: string;
  receita_centavos: number;
  despesas_centavos: number;
  lucro_centavos: number;
  km_rodados?: number;
  minutos_online?: number;
  qtd_corridas?: number;
}

/**
 * Faz o download de um arquivo no navegador do cliente
 */
export function baixarArquivo(conteudo: string, nomeArquivo: string, tipoMime: string) {
  const blob = new Blob([conteudo], { type: tipoMime });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = nomeArquivo;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exporta lançamentos para CSV com UTF-8 BOM (abre sem erros de acentuação no Excel)
 */
export function exportarLancamentosCSV(lancamentos: LancamentoExportavel[]) {
  const cabecalho = [
    'Data/Hora',
    'Tipo',
    'Valor (R$)',
    'Plataforma',
    'Categoria',
    'Qtd Corridas',
    'Meio de Pagamento',
    'Descrição',
  ];

  const linhas = lancamentos.map((item) => [
    new Date(item.ocorrido_em).toLocaleString('pt-BR'),
    item.tipo === 'entrada' ? 'Entrada (+)' : 'Saída (-)',
    (item.valor_centavos / 100).toFixed(2).replace('.', ','),
    `"${(item.plataforma_nome || '').replace(/"/g, '""')}"`,
    `"${(item.categoria_nome || '').replace(/"/g, '""')}"`,
    item.qtd_corridas ?? 0,
    item.meio_pagamento || 'Outro',
    `"${(item.descricao || '').replace(/"/g, '""')}"`,
  ]);

  // \uFEFF força o Excel a reconhecer UTF-8
  const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\r\n');
  const dataHoje = new Date().toISOString().slice(0, 10);
  baixarArquivo(csvContent, `meta-driver-lancamentos-${dataHoje}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta resumo dos dias rodados para CSV
 */
export function exportarDiasCSV(dias: DiaExportavel[]) {
  const cabecalho = [
    'Data',
    'Status',
    'Receita Bruta (R$)',
    'Despesas (R$)',
    'Lucro Líquido (R$)',
    'Km Rodados',
    'Horas Trabalhadas',
    'Total de Corridas',
  ];

  const linhas = dias.map((d) => [
    d.data_referencia,
    d.status === 'fechado' ? 'Fechado' : 'Aberto',
    (d.receita_centavos / 100).toFixed(2).replace('.', ','),
    (d.despesas_centavos / 100).toFixed(2).replace('.', ','),
    (d.lucro_centavos / 100).toFixed(2).replace('.', ','),
    d.km_rodados ?? 0,
    d.minutos_online ? (d.minutos_online / 60).toFixed(1).replace('.', ',') : '0',
    d.qtd_corridas ?? 0,
  ]);

  const csvContent = '\uFEFF' + [cabecalho.join(';'), ...linhas.map((l) => l.join(';'))].join('\r\n');
  const dataHoje = new Date().toISOString().slice(0, 10);
  baixarArquivo(csvContent, `meta-driver-dias-trabalho-${dataHoje}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta dados de relatório em formato Markdown (.MD)
 */
export function exportarRelatorioMD({
  periodo,
  receita,
  despesas,
  lucro,
  corridas,
  kmRodados,
  horasOnline,
  dias,
}: {
  periodo: string;
  receita: number;
  despesas: number;
  lucro: number;
  corridas: number;
  kmRodados: number;
  horasOnline: number;
  dias: DiaExportavel[];
}) {
  const dataGeracao = new Date().toLocaleDateString('pt-BR');
  const margem = receita > 0 ? Math.round((lucro / receita) * 100) : 0;
  const rendimentoHora = horasOnline > 0 ? Math.round(lucro / horasOnline) : 0;
  const rendimentoKm = kmRodados > 0 ? (lucro / 100 / kmRodados).toFixed(2) : '0,00';

  let md = `# Relatório Financeiro — Meta Driver 🚗💨\n\n`;
  md += `> Período: **${periodo}** | Gerado em: ${dataGeracao}\n\n`;
  md += `## 📊 Resumo Consolidado\n\n`;
  md += `- **Receita Bruta:** ${formatarMoeda(receita)}\n`;
  md += `- **Despesas Operacionais:** ${formatarMoeda(despesas)}\n`;
  md += `- **Lucro Líquido:** **${formatarMoeda(lucro)}** (Margem: ${margem}%)\n`;
  md += `- **Total de Corridas:** ${corridas}\n`;
  md += `- **Km Rodados:** ${kmRodados} km\n`;
  md += `- **Horas Trabalhadas:** ${horasOnline.toFixed(1)} h\n`;
  md += `- **Rendimento por Hora:** ${formatarMoeda(rendimentoHora)}/hora\n`;
  md += `- **Lucro por Km:** R$ ${rendimentoKm}/km\n\n`;

  md += `## 📅 Dias de Trabalho no Período\n\n`;
  md += `| Data | Receita | Despesas | Lucro Líquido | Corridas | Km |\n`;
  md += `|---|---|---|---|---|---|\n`;

  for (const d of dias) {
    md += `| ${d.data_referencia} | ${formatarMoeda(d.receita_centavos)} | ${formatarMoeda(d.despesas_centavos)} | ${formatarMoeda(d.lucro_centavos)} | ${d.qtd_corridas ?? 0} | ${d.km_rodados ?? 0} |\n`;
  }

  md += `\n---\n*Gerado automaticamente pelo aplicativo Meta Driver.*\n`;

  const dataHoje = new Date().toISOString().slice(0, 10);
  baixarArquivo(md, `meta-driver-relatorio-${dataHoje}.md`, 'text/markdown;charset=utf-8;');
}

/**
 * Dispara impressão nativa do relatório para gerar PDF completo
 */
export function imprimirRelatorioPDF() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
