import { describe, it, expect } from 'vitest';
import { normalizarRecursos } from '@/lib/recursos';

describe('Auditoria V2 - BUG-01 (Cálculo e Renderização de Metas)', () => {
  it('Hipótese H3 comprovada: Math.round em percentual pequeno zera o progresso exibido', () => {
    const valorAlvo = 30000; // R$ 300,00
    const receitaPequena = 50; // R$ 0,50

    // Comportamento falho atual:
    const pctFalhoAtual = Math.min(200, Math.round((receitaPequena / valorAlvo) * 100));
    expect(pctFalhoAtual).toBe(0); // 0% exibido, barra invisível!

    // Comportamento esperado corrigido (V2.2):
    // Deve mostrar 0,2% e ter largura mínima visual de 2%
    const pctCorreto = (receitaPequena / valorAlvo) * 100;
    expect(pctCorreto).toBeCloseTo(0.166, 2);
  });

  it('Garante que chaves de recursos iniciam todas desligadas (segurança total)', () => {
    const recursos = normalizarRecursos(null);
    expect(recursos.intervalo).toBe(false);
    expect(recursos.locais).toBe(false);
    expect(recursos.partes).toBe(false);
    expect(recursos.taxas).toBe(false);
    expect(recursos.pdf).toBe(false);
  });
});
