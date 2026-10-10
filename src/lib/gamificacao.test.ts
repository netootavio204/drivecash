import { describe, it, expect } from 'vitest';
import {
  calcularNivelMedalha,
  calcularEstrelasPorMedalha,
  calcularMetaMinimaSugerida,
  calcularPercentualMeta,
} from './gamificacao';

describe('Gamificação & Metas (Fase 5)', () => {
  describe('calcularNivelMedalha', () => {
    const alvo = 30000; // R$ 300,00

    it('retorna "nenhum" quando o valor alcançado for abaixo de 70% (Bronze)', () => {
      // 69% de 300 = 207
      const nivel = calcularNivelMedalha({
        valorAlcancado: 20000,
        valorAlvo: alvo,
      });
      expect(nivel).toBe('nenhum');
    });

    it('retorna "bronze" ao atingir exatamente ou superar 70%', () => {
      // 70% de 300 = 210
      const nivel1 = calcularNivelMedalha({
        valorAlcancado: 21000,
        valorAlvo: alvo,
      });
      expect(nivel1).toBe('bronze');

      const nivel2 = calcularNivelMedalha({
        valorAlcancado: 29999,
        valorAlvo: alvo,
      });
      expect(nivel2).toBe('bronze');
    });

    it('retorna "prata" ao atingir a meta (100%)', () => {
      const nivel1 = calcularNivelMedalha({
        valorAlcancado: 30000,
        valorAlvo: alvo,
      });
      expect(nivel1).toBe('prata');

      const nivel2 = calcularNivelMedalha({
        valorAlcancado: 38000,
        valorAlvo: alvo,
      });
      expect(nivel2).toBe('prata');
    });

    it('retorna "ouro" ao superar a meta em 130% ou mais', () => {
      // 130% de 300 = 390
      const nivel1 = calcularNivelMedalha({
        valorAlcancado: 39000,
        valorAlvo: alvo,
      });
      expect(nivel1).toBe('ouro');

      const nivel2 = calcularNivelMedalha({
        valorAlcancado: 50000,
        valorAlvo: alvo,
      });
      expect(nivel2).toBe('ouro');
    });

    it('respeita percentuais customizados de marcos', () => {
      const nivel = calcularNivelMedalha({
        valorAlcancado: 8000,
        valorAlvo: 10000,
        pctBronze: 50,
        pctPrata: 80,
        pctOuro: 120,
      });
      expect(nivel).toBe('prata');
    });
  });

  describe('calcularEstrelasPorMedalha', () => {
    it('atribui 0 estrelas para nenhum', () => {
      expect(calcularEstrelasPorMedalha('nenhum')).toBe(0);
    });

    it('atribui 1 estrela para Bronze', () => {
      expect(calcularEstrelasPorMedalha('bronze')).toBe(1);
    });

    it('atribui 3 estrelas para Prata', () => {
      expect(calcularEstrelasPorMedalha('prata')).toBe(3);
    });

    it('atribui 5 estrelas para Ouro', () => {
      expect(calcularEstrelasPorMedalha('ouro')).toBe(5);
    });
  });

  describe('calcularMetaMinimaSugerida (RN-25)', () => {
    it('divide corretamente o total de contas pendentes por 25 dias de trabalho', () => {
      // R$ 2.500,00 de contas pendentes / 25 dias = R$ 100,00/dia
      const metaMin = calcularMetaMinimaSugerida(250000, 25);
      expect(metaMin).toBe(10000);
    });

    it('arredonda para cima em divisões inexatas para cobrir todo o custo', () => {
      // R$ 2.501,00 de contas pendentes / 25 = 100,04 -> arredonda para 100,05 (centavos)
      const metaMin = calcularMetaMinimaSugerida(250100, 25);
      expect(metaMin).toBe(10004);
    });

    it('retorna 0 quando não há contas pendentes', () => {
      expect(calcularMetaMinimaSugerida(0, 25)).toBe(0);
      expect(calcularMetaMinimaSugerida(-500, 25)).toBe(0);
    });
  });

  describe('calcularPercentualMeta', () => {
    it('calcula a porcentagem corretamente', () => {
      expect(calcularPercentualMeta(15000, 30000)).toBe(50);
      expect(calcularPercentualMeta(30000, 30000)).toBe(100);
      expect(calcularPercentualMeta(39000, 30000)).toBe(130);
    });

    it('retorna 0 quando o alvo for zero ou negativo', () => {
      expect(calcularPercentualMeta(1000, 0)).toBe(0);
    });
  });
});
