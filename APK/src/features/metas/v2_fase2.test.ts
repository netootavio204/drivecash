import { describe, it, expect } from 'vitest';
import { calcularTempoLiquido } from '@/features/dia/api';
import type { PausaJornada } from '@/features/dia/api';

describe('Fase V2.2 - Correções de Metas e Intervalos', () => {
  it('Caso 1: Meta diária R$ 300,00 com receita R$ 30,00 exibe 10,0%', () => {
    const alvo = 30000;
    const alcancado = 3000;
    const pct = (alcancado / alvo) * 100;
    const formatado = pct.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    expect(formatado).toBe('10,0');
    // Largura na barra (escala até 130% do Ouro)
    const pctBarra = (pct / 130) * 100;
    expect(pctBarra).toBeCloseTo(7.69, 1);
  });

  it('Caso 2: Receita pequena R$ 0,50 garante largura mínima visível de 2% e exibe 0,2%', () => {
    const alvo = 30000;
    const alcancado = 50; // R$ 0,50
    const pct = (alcancado / alvo) * 100;
    const formatado = pct.toLocaleString('pt-BR', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    });

    expect(formatado).toBe('0,2');

    // Comportamento corrigido da BarraMetaV2:
    const pctBarra = (pct / 130) * 100;
    const larguraMinima = alcancado > 0 ? Math.max(2, Math.min(100, pctBarra)) : 0;
    expect(larguraMinima).toBe(2); // Garante que não fica invisível
  });

  it('Caso 3: calcularTempoLiquido desconta os intervalos corretamente', () => {
    const agora = Date.now();
    const abertoEm = new Date(agora - 5 * 60 * 60 * 1000).toISOString(); // 5 horas atrás (300 min)
    const pausas: PausaJornada[] = [
      {
        inicio: new Date(agora - 3 * 60 * 60 * 1000).toISOString(),
        fim: new Date(agora - 2 * 60 * 60 * 1000 - 15 * 60 * 1000).toISOString(), // exatamente 45 min (das 3h às 2h15 atrás)
        motivo: 'refeicao',
      },
    ];

    const diaMock: any = {
      aberto_em: abertoEm,
      fechado_em: null,
      resumo: { pausas },
    };

    const resultado = calcularTempoLiquido(diaMock);
    expect(resultado.minutosTotais).toBe(300);
    expect(resultado.minutosPausa).toBe(45);
    expect(resultado.minutosLiquidos).toBe(255);
    expect(resultado.horasFormatadas).toBe('4h15');
  });

  it('Caso 4: Dia sem pausas tem tempo líquido igual ao tempo total', () => {
    const agora = Date.now();
    const abertoEm = new Date(agora - 2 * 60 * 60 * 1000).toISOString(); // 2 horas (120 min)

    const diaMock: any = {
      aberto_em: abertoEm,
      fechado_em: null,
      resumo: {},
    };

    const resultado = calcularTempoLiquido(diaMock);
    expect(resultado.minutosTotais).toBe(120);
    expect(resultado.minutosPausa).toBe(0);
    expect(resultado.minutosLiquidos).toBe(120);
    expect(resultado.horasFormatadas).toBe('2h00');
  });
});
