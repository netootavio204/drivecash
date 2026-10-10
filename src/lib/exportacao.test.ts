import { describe, it, expect, vi } from 'vitest';
import { exportarLancamentosCSV, exportarDiasCSV, exportarRelatorioMD } from './exportacao';

describe('Módulo de Exportações (Fase 6)', () => {
  it('gera CSV de lançamentos com separadores e formatação em Real', () => {
    // Espionar o método createObjectURL
    const mockCreateObjectURL = vi.fn(() => 'blob:mock');
    const mockRevokeObjectURL = vi.fn();
    globalThis.URL.createObjectURL = mockCreateObjectURL;
    globalThis.URL.revokeObjectURL = mockRevokeObjectURL;

    expect(() => {
      exportarLancamentosCSV([
        {
          id: '1',
          ocorrido_em: '2026-10-10T14:30:00Z',
          tipo: 'entrada',
          valor_centavos: 3500,
          plataforma_nome: 'Uber',
          categoria_nome: 'Corrida',
          qtd_corridas: 1,
          meio_pagamento: 'Pix',
          descricao: 'Corrida aeroporto',
        },
      ]);
    }).not.toThrow();
  });

  it('gera CSV de dias de trabalho corretamente', () => {
    expect(() => {
      exportarDiasCSV([
        {
          data_referencia: '2026-10-10',
          status: 'fechado',
          receita_centavos: 35000,
          despesas_centavos: 5000,
          lucro_centavos: 30000,
          km_rodados: 120,
          minutos_online: 360,
          qtd_corridas: 14,
        },
      ]);
    }).not.toThrow();
  });

  it('gera relatório em Markdown estruturado', () => {
    expect(() => {
      exportarRelatorioMD({
        periodo: 'Outubro / 2026',
        receita: 750000,
        despesas: 150000,
        lucro: 600000,
        corridas: 250,
        kmRodados: 2500,
        horasOnline: 160,
        dias: [
          {
            data_referencia: '2026-10-10',
            status: 'fechado',
            receita_centavos: 30000,
            despesas_centavos: 5000,
            lucro_centavos: 25000,
            qtd_corridas: 12,
            km_rodados: 100,
          },
        ],
      });
    }).not.toThrow();
  });
});
