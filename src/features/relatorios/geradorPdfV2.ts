import { formatarMoeda } from '@/lib/money';

export interface DadosRelatorioPdfV2 {
  dataReferencia: string;
  motoristaNome?: string;
  cidade?: string;
  veiculoInfo?: string;
  plataformaPrincipal?: string;

  // Financeiro
  ganhoBrutoCentavos: number;
  totalTaxasCentavos: number;
  taxaPlataformaCentavos: number;
  taxaMaquininhaCentavos: number;
  taxaEfetivaPct: number;
  ganhoLiquidoCentavos: number;
  despesasOperacionaisCentavos: number;
  lucroLiquidoCentavos: number;
  reservaManutencaoCentavos: number;

  // Rendimento
  corridas: number;
  ticketMedioCentavos: number;
  horasOnline?: number | null;
  minutosPausa?: number;
  horasLiquidas?: number | null;
  ganhoPorHoraLiquidoCentavos?: number | null;
  kmRodados?: number | null;
  lucroPorKmCentavos?: number | null;

  // Saldos por Local
  saldosLocais: Array<{
    nome: string;
    tipo: string;
    saldoCentavos: number;
  }>;

  // Lista de lançamentos
  lancamentos?: Array<{
    hora: string;
    descricao: string;
    tipo: string;
    categoria?: string | null;
    meio?: string | null;
    valorCentavos: number;
  }>;

  observacoes?: string | null;
}

export interface OpcoesRelatorioPdf {
  modo: 'colorido' | 'economico';
  incluirLancamentos: boolean;
}

let pdfMakeCache: any = null;

async function carregarPdfMake() {
  if (pdfMakeCache) return pdfMakeCache;

  const pdfMakeModule = await import('pdfmake/build/pdfmake');
  const vfsFontsModule = await import('pdfmake/build/vfs_fonts');

  const pdfMake = (pdfMakeModule as any).default || pdfMakeModule;
  const vfsFonts = (vfsFontsModule as any).default || vfsFontsModule;

  if (vfsFonts?.pdfMake?.vfs) {
    pdfMake.vfs = vfsFonts.pdfMake.vfs;
  } else if (vfsFonts?.vfs) {
    pdfMake.vfs = vfsFonts.vfs;
  }

  pdfMakeCache = pdfMake;
  return pdfMake;
}

export function formatarDataExtenso(dataStr: string): string {
  try {
    const [ano, mes, dia] = dataStr.split('-').map(Number);
    const d = new Date(ano, mes - 1, dia);
    return d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dataStr;
  }
}

export async function gerarDefinicaoPdf(
  dados: DadosRelatorioPdfV2,
  opcoes: OpcoesRelatorioPdf
): Promise<any> {
  const isColorido = opcoes.modo === 'colorido';

  // Cores do tema
  const corFundoCabecalho = isColorido ? '#18181B' : '#F9FAFB';
  const corBorda = isColorido ? '#27272A' : '#E5E7EB';
  const corTextoPrincipal = isColorido ? '#FAFAFA' : '#111827';
  const corTextoSecundario = isColorido ? '#A1A1AA' : '#4B5563';
  const corLaranja = '#FF7A00';
  const corPositivo = '#10B981';
  const corNegativo = '#EF4444';

  const docDefinition: any = {
    pageSize: 'A4',
    pageOrientation: 'portrait',
    pageMargins: [30, 30, 30, 40],
    defaultStyle: {
      fontSize: 9,
      color: corTextoPrincipal,
    },
    header: () => null,
    footer: (currentPage: number, pageCount: number) => ({
      margin: [30, 10, 30, 0],
      columns: [
        {
          text: 'DriveCash • Relatório Oficial de Fechamento de Turno',
          fontSize: 7.5,
          color: corTextoSecundario,
        },
        {
          text: `Página ${currentPage} de ${pageCount}`,
          alignment: 'right',
          fontSize: 7.5,
          color: corTextoSecundario,
        },
      ],
    }),
    content: [
      // 1. Cabeçalho
      {
        table: {
          widths: ['*'],
          body: [
            [
              {
                fillColor: corFundoCabecalho,
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                margin: [12, 10, 12, 10],
                stack: [
                  {
                    columns: [
                      {
                        stack: [
                          {
                            text: 'DRIVECASH',
                            fontSize: 16,
                            bold: true,
                            color: corLaranja,
                            characterSpacing: 1,
                          },
                          {
                            text: 'Fechamento Diário do Motorista',
                            fontSize: 9,
                            color: corTextoSecundario,
                            margin: [0, 2, 0, 0],
                          },
                        ],
                      },
                      {
                        stack: [
                          {
                            text: formatarDataExtenso(dados.dataReferencia).toUpperCase(),
                            alignment: 'right',
                            fontSize: 10,
                            bold: true,
                            color: corTextoPrincipal,
                          },
                          {
                            text: dados.motoristaNome ? `Motorista: ${dados.motoristaNome}` : 'Motorista Parceiro',
                            alignment: 'right',
                            fontSize: 8.5,
                            color: corTextoSecundario,
                            margin: [0, 2, 0, 0],
                          },
                          dados.veiculoInfo
                            ? {
                                text: `Veículo: ${dados.veiculoInfo}`,
                                alignment: 'right',
                                fontSize: 8,
                                color: corTextoSecundario,
                              }
                            : null,
                        ].filter(Boolean),
                      },
                    ],
                  },
                ],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 12],
      },

      // 2. Quadro Resumo dos 6 Números Principais
      {
        text: 'RESUMO FINANCEIRO CONSOLIDADO',
        fontSize: 10,
        bold: true,
        color: corLaranja,
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          widths: ['*', '*', '*'],
          body: [
            [
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#1F2937' : '#FFFFFF',
                margin: [8, 6, 8, 6],
                stack: [
                  { text: 'Faturamento Bruto', fontSize: 8, color: corTextoSecundario },
                  {
                    text: formatarMoeda(dados.ganhoBrutoCentavos),
                    fontSize: 13,
                    bold: true,
                    color: corPositivo,
                    margin: [0, 2, 0, 0],
                  },
                  { text: `${dados.corridas} corridas realizadas`, fontSize: 7, color: corTextoSecundario },
                ],
              },
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#1F2937' : '#FFFFFF',
                margin: [8, 6, 8, 6],
                stack: [
                  {
                    columns: [
                      { text: 'Taxas Totais', fontSize: 8, color: corTextoSecundario },
                      {
                        text: `${dados.taxaEfetivaPct.toFixed(1)}%`,
                        alignment: 'right',
                        fontSize: 7.5,
                        bold: true,
                        color: corNegativo,
                      },
                    ],
                  },
                  {
                    text: `−${formatarMoeda(dados.totalTaxasCentavos)}`,
                    fontSize: 13,
                    bold: true,
                    color: corNegativo,
                    margin: [0, 2, 0, 0],
                  },
                  {
                    text: dados.taxaMaquininhaCentavos > 0
                      ? `99: ${formatarMoeda(dados.taxaPlataformaCentavos)} • Maq: ${formatarMoeda(dados.taxaMaquininhaCentavos)}`
                      : 'Taxas retidas da plataforma',
                    fontSize: 7,
                    color: corTextoSecundario,
                  },
                ],
              },
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#1F2937' : '#FFFFFF',
                margin: [8, 6, 8, 6],
                stack: [
                  { text: 'Ganho Líquido', fontSize: 8, color: corTextoSecundario },
                  {
                    text: formatarMoeda(dados.ganhoLiquidoCentavos),
                    fontSize: 13,
                    bold: true,
                    color: corTextoPrincipal,
                    margin: [0, 2, 0, 0],
                  },
                  { text: 'Bruto menos taxas', fontSize: 7, color: corTextoSecundario },
                ],
              },
            ],
            [
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#1F2937' : '#FFFFFF',
                margin: [8, 6, 8, 6],
                stack: [
                  { text: 'Despesas Operacionais', fontSize: 8, color: corTextoSecundario },
                  {
                    text: `−${formatarMoeda(dados.despesasOperacionaisCentavos)}`,
                    fontSize: 13,
                    bold: true,
                    color: corNegativo,
                    margin: [0, 2, 0, 0],
                  },
                  { text: 'Combustível, lanche, etc.', fontSize: 7, color: corTextoSecundario },
                ],
              },
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#1F2937' : '#FFFFFF',
                margin: [8, 6, 8, 6],
                stack: [
                  { text: 'Reserva de Manutenção', fontSize: 8, color: corTextoSecundario },
                  {
                    text: formatarMoeda(dados.reservaManutencaoCentavos),
                    fontSize: 13,
                    bold: true,
                    color: corPositivo,
                    margin: [0, 2, 0, 0],
                  },
                  { text: 'Guardado para o carro', fontSize: 7, color: corTextoSecundario },
                ],
              },
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#182E24' : '#F0FDF4',
                margin: [8, 6, 8, 6],
                stack: [
                  { text: 'Lucro Líquido Final', fontSize: 8, bold: true, color: corPositivo },
                  {
                    text: formatarMoeda(dados.lucroLiquidoCentavos),
                    fontSize: 14,
                    bold: true,
                    color: corPositivo,
                    margin: [0, 2, 0, 0],
                  },
                  { text: 'Sobrou limpo no bolso', fontSize: 7, color: corTextoSecundario },
                ],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 12],
      },

      // 3. Indicadores de Rendimento e Produtividade
      {
        text: 'PRODUTIVIDADE E RENDIMENTO',
        fontSize: 10,
        bold: true,
        color: corLaranja,
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [
            [
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#18181B' : '#F9FAFB',
                margin: [6, 4, 6, 4],
                stack: [
                  { text: 'Ticket Médio', fontSize: 7.5, color: corTextoSecundario },
                  { text: formatarMoeda(dados.ticketMedioCentavos), fontSize: 10, bold: true },
                ],
              },
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#18181B' : '#F9FAFB',
                margin: [6, 4, 6, 4],
                stack: [
                  { text: 'Horas Líquidas', fontSize: 7.5, color: corTextoSecundario },
                  {
                    text: dados.horasLiquidas ? `${dados.horasLiquidas.toFixed(1)} h` : '—',
                    fontSize: 10,
                    bold: true,
                  },
                ],
              },
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#18181B' : '#F9FAFB',
                margin: [6, 4, 6, 4],
                stack: [
                  { text: 'Ganho Líq. / Hora', fontSize: 7.5, color: corTextoSecundario },
                  {
                    text: dados.ganhoPorHoraLiquidoCentavos
                      ? `${formatarMoeda(dados.ganhoPorHoraLiquidoCentavos)}/h`
                      : '—',
                    fontSize: 10,
                    bold: true,
                    color: corPositivo,
                  },
                ],
              },
              {
                border: [true, true, true, true],
                borderColor: [corBorda, corBorda, corBorda, corBorda],
                fillColor: isColorido ? '#18181B' : '#F9FAFB',
                margin: [6, 4, 6, 4],
                stack: [
                  { text: 'Lucro / KM', fontSize: 7.5, color: corTextoSecundario },
                  {
                    text: dados.lucroPorKmCentavos
                      ? `${formatarMoeda(dados.lucroPorKmCentavos)}/km`
                      : '—',
                    fontSize: 10,
                    bold: true,
                    color: corPositivo,
                  },
                ],
              },
            ],
          ],
        },
        margin: [0, 0, 0, 12],
      },

      // 4. Onde o Dinheiro Ficou (Saldos por Local: Bolso, App 99 e Bancos)
      {
        text: 'SALDOS POR LOCAL (MEU DINHEIRO)',
        fontSize: 10,
        bold: true,
        color: corLaranja,
        margin: [0, 0, 0, 6],
      },
      {
        table: {
          widths: ['*', 100, 120],
          body: [
            [
              { text: 'Local / Conta', bold: true, fontSize: 8, color: corTextoSecundario },
              { text: 'Tipo', bold: true, fontSize: 8, color: corTextoSecundario },
              { text: 'Saldo Atual', bold: true, fontSize: 8, color: corTextoSecundario, alignment: 'right' },
            ],
            ...dados.saldosLocais.map((loc) => [
              { text: loc.nome, bold: true, fontSize: 8.5 },
              {
                text: loc.tipo === 'bolso' ? 'Dinheiro Físico' : loc.tipo === 'app' ? 'Saldo App 99' : 'Conta Bancária',
                fontSize: 8,
                color: corTextoSecundario,
              },
              {
                text: formatarMoeda(loc.saldoCentavos),
                fontSize: 9,
                bold: true,
                alignment: 'right',
                color: loc.saldoCentavos < 0 ? corNegativo : corTextoPrincipal,
              },
            ]),
          ],
        },
        layout: {
          fillColor: (rowIndex: number) => (rowIndex === 0 ? (isColorido ? '#27272A' : '#F3F4F6') : null),
          hLineWidth: () => 0.5,
          vLineWidth: () => 0,
          hLineColor: () => corBorda,
        },
        margin: [0, 0, 0, 12],
      },

      // 5. Lista Detalhada de Lançamentos (se solicitada)
      opcoes.incluirLancamentos && dados.lancamentos && dados.lancamentos.length > 0
        ? [
            {
              text: `LISTA DE LANÇAMENTOS DO TURNO (${dados.lancamentos.length})`,
              fontSize: 10,
              bold: true,
              color: corLaranja,
              margin: [0, 4, 0, 6],
            },
            {
              table: {
                widths: [40, '*', 90, 80],
                body: [
                  [
                    { text: 'Hora', bold: true, fontSize: 7.5, color: corTextoSecundario },
                    { text: 'Descrição', bold: true, fontSize: 7.5, color: corTextoSecundario },
                    { text: 'Meio / Categoria', bold: true, fontSize: 7.5, color: corTextoSecundario },
                    { text: 'Valor (R$)', bold: true, fontSize: 7.5, color: corTextoSecundario, alignment: 'right' },
                  ],
                  ...dados.lancamentos.map((l) => [
                    { text: l.hora, fontSize: 7.5 },
                    { text: l.descricao || 'Lançamento', fontSize: 7.5, bold: l.tipo === 'entrada' },
                    { text: l.meio || l.categoria || '—', fontSize: 7, color: corTextoSecundario },
                    {
                      text: `${l.tipo === 'entrada' ? '+' : '−'}${formatarMoeda(l.valorCentavos)}`,
                      fontSize: 8,
                      bold: true,
                      alignment: 'right',
                      color: l.tipo === 'entrada' ? corPositivo : corNegativo,
                    },
                  ]),
                ],
              },
              layout: {
                fillColor: (rowIndex: number) => (rowIndex === 0 ? (isColorido ? '#27272A' : '#F3F4F6') : null),
                hLineWidth: () => 0.5,
                vLineWidth: () => 0,
                hLineColor: () => corBorda,
              },
              margin: [0, 0, 0, 10],
            },
          ]
        : null,

      // 6. Observações (se houver)
      dados.observacoes
        ? {
            table: {
              widths: ['*'],
              body: [
                [
                  {
                    fillColor: isColorido ? '#1F2937' : '#F9FAFB',
                    border: [true, true, true, true],
                    borderColor: [corBorda, corBorda, corBorda, corBorda],
                    margin: [8, 6, 8, 6],
                    stack: [
                      { text: 'Observações do dia:', fontSize: 7.5, bold: true, color: corTextoSecundario },
                      { text: dados.observacoes, fontSize: 8, margin: [0, 2, 0, 0] },
                    ],
                  },
                ],
              ],
            },
            margin: [0, 0, 0, 10],
          }
        : null,
    ].filter(Boolean),
  };

  return docDefinition;
}

/** Gera o PDF como Blob local */
export async function gerarBlobPdfV2(
  dados: DadosRelatorioPdfV2,
  opcoes: OpcoesRelatorioPdf
): Promise<Blob> {
  const pdfMake = await carregarPdfMake();
  const docDef = await gerarDefinicaoPdf(dados, opcoes);

  return new Promise((resolve, reject) => {
    try {
      const pdfDocGenerator = pdfMake.createPdf(docDef);
      pdfDocGenerator.getBlob((blob: Blob) => {
        resolve(blob);
      });
    } catch (e) {
      reject(e);
    }
  });
}

/** Dispara o Download do PDF no Navegador */
export async function baixarRelatorioPdfV2(
  dados: DadosRelatorioPdfV2,
  opcoes: OpcoesRelatorioPdf
): Promise<void> {
  const blob = await gerarBlobPdfV2(dados, opcoes);
  const nomeArquivo = `DriveCash_Relatorio_${dados.dataReferencia}.pdf`;

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = nomeArquivo;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/** Compartilha o PDF via Web Share API ou Capacitor Share no celular */
export async function compartilharRelatorioPdfV2(
  dados: DadosRelatorioPdfV2,
  opcoes: OpcoesRelatorioPdf
): Promise<void> {
  const blob = await gerarBlobPdfV2(dados, opcoes);
  const nomeArquivo = `DriveCash_Relatorio_${dados.dataReferencia}.pdf`;
  const arquivo = new File([blob], nomeArquivo, { type: 'application/pdf' });

  // 1. Tenta Capacitor Share se estiver rodando no APK Android
  const cap = (window as any).Capacitor;
  if (cap?.Plugins?.Share && cap?.Plugins?.Filesystem) {
    try {
      const Share = cap.Plugins.Share;
      const Filesystem = cap.Plugins.Filesystem;

      // Converte blob para base64
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const res = reader.result as string;
          resolve(res.split(',')[1]);
        };
        reader.readAsDataURL(blob);
      });

      const base64Data = await base64Promise;
      const salvo = await Filesystem.writeFile({
        path: nomeArquivo,
        data: base64Data,
        directory: 'CACHE',
      });

      await Share.share({
        title: `Relatório DriveCash — ${dados.dataReferencia}`,
        text: `Relatório de fechamento do dia ${dados.dataReferencia}`,
        url: salvo.uri,
        dialogTitle: 'Compartilhar Relatório em PDF',
      });
      return;
    } catch (err) {
      console.warn('[DriveCash] Compartilhamento via Capacitor falhou, tentando Web Share:', err);
    }
  }

  // 2. Web Share API nativa do navegador
  if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
    await navigator.share({
      title: `Relatório DriveCash — ${dados.dataReferencia}`,
      text: `Relatório de fechamento do dia ${dados.dataReferencia}`,
      files: [arquivo],
    });
    return;
  }

  // 3. Fallback: faz o download
  baixarRelatorioPdfV2(dados, opcoes);
}

/** Dispara a impressão do PDF */
export async function imprimirRelatorioPdfV2(
  dados: DadosRelatorioPdfV2,
  opcoes: OpcoesRelatorioPdf
): Promise<void> {
  const blob = await gerarBlobPdfV2(dados, opcoes);
  const url = URL.createObjectURL(blob);

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.src = url;

  document.body.appendChild(iframe);
  iframe.onload = () => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      window.open(url, '_blank');
    }
  };
}
