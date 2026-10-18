import { describe, it, expect } from 'vitest';
import {
  gerarDefinicaoPdf,
  formatarDataExtenso,
  type DadosRelatorioPdfV2,
  type OpcoesRelatorioPdf,
} from './geradorPdfV2';
import { formatarMoeda } from '../../lib/money';

describe('Fase V2.6 — Relatório do Dia em PDF', () => {
  const dadosMock: DadosRelatorioPdfV2 = {
    dataReferencia: '2026-10-18',
    motoristaNome: 'Otávio Neto',
    cidade: 'São Paulo - SP',
    veiculoInfo: 'Chevrolet Onix Plus',
    ganhoBrutoCentavos: 35000, // R$ 350,00
    totalTaxasCentavos: 5250, // R$ 52,50 (15%)
    taxaPlataformaCentavos: 4750, // R$ 47,50
    taxaMaquininhaCentavos: 500, // R$ 5,00
    taxaEfetivaPct: 15.0,
    ganhoLiquidoCentavos: 29750, // R$ 297,50
    despesasOperacionaisCentavos: 7000, // R$ 70,00 (combustível/alimentação)
    lucroLiquidoCentavos: 22750, // R$ 227,50
    reservaManutencaoCentavos: 2000, // R$ 20,00
    corridas: 14,
    ticketMedioCentavos: 2500, // R$ 25,00
    horasOnline: 8.5,
    minutosPausa: 45,
    horasLiquidas: 7.75,
    ganhoPorHoraLiquidoCentavos: 3838, // R$ 38,38/h
    kmRodados: 165,
    lucroPorKmCentavos: 138, // R$ 1,38/km
    saldosLocais: [
      { nome: 'Bolso', tipo: 'bolso', saldoCentavos: 8500 },
      { nome: 'App 99', tipo: 'app', saldoCentavos: 12000 },
      { nome: 'Banco Inter', tipo: 'banco', saldoCentavos: 9250 },
    ],
    lancamentos: [
      {
        hora: '08:30',
        descricao: 'Corrida Centro → Jardins',
        tipo: 'entrada',
        categoria: 'Corrida',
        meio: 'app',
        valorCentavos: 3200,
      },
      {
        hora: '12:15',
        descricao: 'Almoço Restaurante',
        tipo: 'saida',
        categoria: 'Alimentação',
        meio: 'debito',
        valorCentavos: 2500,
      },
    ],
    observacoes: 'Dia produtivo, chuva fraca no fim da tarde.',
  };

  it('formata data por extenso em português do Brasil', () => {
    const extenso = formatarDataExtenso('2026-10-18');
    expect(extenso.toLowerCase()).toContain('outubro');
    expect(extenso).toContain('2026');
  });

  it('gera estrutura de PDF no modo colorido com as seções principais', async () => {
    const opcoes: OpcoesRelatorioPdf = {
      modo: 'colorido',
      incluirLancamentos: true,
    };

    const docDef = await gerarDefinicaoPdf(dadosMock, opcoes);

    expect(docDef).toBeDefined();
    expect(docDef.pageSize).toBe('A4');
    expect(docDef.content).toBeInstanceOf(Array);
    expect(docDef.content.length).toBeGreaterThan(3);

    // Converte conteúdo em string para validações de integridade
    const docStr = JSON.stringify(docDef);
    expect(docStr).toContain('DRIVECASH');
    expect(docStr).toContain('Otávio Neto');
    expect(docStr).toContain('RESUMO FINANCEIRO CONSOLIDADO');
    expect(docStr).toContain('PRODUTIVIDADE E RENDIMENTO');
    expect(docStr).toContain('SALDOS POR LOCAL');
    expect(docStr).toContain('LISTA DE LANÇAMENTOS DO TURNO');
    expect(docStr).toContain('Observações do dia:');
  });

  it('gera estrutura de PDF no modo econômico sem lista de lançamentos quando desmarcado', async () => {
    const opcoes: OpcoesRelatorioPdf = {
      modo: 'economico',
      incluirLancamentos: false,
    };

    const docDef = await gerarDefinicaoPdf(dadosMock, opcoes);
    const docStr = JSON.stringify(docDef);

    expect(docDef).toBeDefined();
    expect(docStr).toContain('RESUMO FINANCEIRO CONSOLIDADO');
    expect(docStr).not.toContain('LISTA DE LANÇAMENTOS DO TURNO');
  });

  it('contém os valores financeiros exatos no PDF', async () => {
    const opcoes: OpcoesRelatorioPdf = {
      modo: 'colorido',
      incluirLancamentos: true,
    };

    const docDef = await gerarDefinicaoPdf(dadosMock, opcoes);
    const docStr = JSON.stringify(docDef);

    // Valida valores formatados em moeda
    expect(docStr).toContain(formatarMoeda(35000)); // Faturamento Bruto
    expect(docStr).toContain('15.0%'); // Taxa Efetiva %
    expect(docStr).toContain(formatarMoeda(29750)); // Ganho Líquido
    expect(docStr).toContain(formatarMoeda(22750)); // Lucro Líquido
  });
});
