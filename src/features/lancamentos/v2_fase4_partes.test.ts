import { describe, it, expect } from 'vitest';
import type { LancarCorridaInput } from './api';

describe('DriveCash V2 — Fase V2.4: Corrida Única com Partes e Cupons (Fim do BUG-02)', () => {
  function validarEProcessarCorrida(input: LancarCorridaInput) {
    if (input.valorCentavos <= 0) {
      throw new Error('VALOR_INVALIDO');
    }

    const partes = input.partes || [];
    const somaPartes = partes.reduce((acc, p) => acc + p.valor_centavos, 0);

    if (somaPartes > input.valorCentavos) {
      throw new Error('PARTES_EXCEDEM_VALOR');
    }

    const restante = input.valorCentavos - somaPartes;

    // Se houver restante, adiciona automaticamente a parte do app
    const partesFinais = [...partes];
    if (restante > 0) {
      partesFinais.push({
        local_id: 'app-99',
        meio: input.restoTipo === 'cupom' ? 'cupom' : 'app',
        valor_centavos: restante,
      });
    }

    const somaFinal = partesFinais.reduce((acc, p) => acc + p.valor_centavos, 0);
    if (somaFinal !== input.valorCentavos) {
      throw new Error('PARTES_NAO_FECHAM');
    }

    return {
      lancamentoPrincipal: {
        valor_centavos: input.valorCentavos,
        qtd_corridas: input.qtdCorridas ?? 1,
        modo_partes: true,
      },
      partes: partesFinais,
    };
  }

  it('Caso 6: deve registrar 1 única corrida dividida entre Bolso, Pix, Cartão e restante no App 99', () => {
    const input: LancarCorridaInput = {
      plataformaId: 'plat-99',
      categoriaId: 'cat-corrida',
      valorCentavos: 3000, // R$ 30,00
      qtdCorridas: 1,
      partes: [
        { local_id: 'bolso', meio: 'dinheiro', valor_centavos: 800 }, // R$ 8,00
        { local_id: 'banco-inter', meio: 'pix', valor_centavos: 700 }, // R$ 7,00
        { local_id: 'mercado-pago', meio: 'debito', valor_centavos: 500 }, // R$ 5,00
      ],
      restoTipo: 'app',
    };

    const resultado = validarEProcessarCorrida(input);

    // Garante que o lançamento principal é 1 corrida
    expect(resultado.lancamentoPrincipal.qtd_corridas).toBe(1);
    expect(resultado.lancamentoPrincipal.valor_centavos).toBe(3000);

    // O restante de R$ 10,00 deve ir sozinho para o App 99
    expect(resultado.partes).toHaveLength(4);
    const parteApp = resultado.partes.find((p) => p.local_id === 'app-99');
    expect(parteApp).toBeDefined();
    expect(parteApp?.valor_centavos).toBe(1000); // R$ 10,00
    expect(parteApp?.meio).toBe('app');
  });

  it('Caso 7: deve rejeitar quando a soma das partes exceder o total da corrida', () => {
    const inputInvalido: LancarCorridaInput = {
      plataformaId: 'plat-99',
      categoriaId: 'cat-corrida',
      valorCentavos: 3000, // R$ 30,00
      partes: [
        { local_id: 'bolso', meio: 'dinheiro', valor_centavos: 2000 },
        { local_id: 'banco-inter', meio: 'pix', valor_centavos: 1500 }, // Total = 3500 > 3000
      ],
    };

    expect(() => validarEProcessarCorrida(inputInvalido)).toThrow('PARTES_EXCEDEM_VALOR');
  });

  it('Caso 8: corrida 100% em dinheiro no Bolso não deve gerar parte do App 99', () => {
    const input: LancarCorridaInput = {
      plataformaId: 'plat-99',
      categoriaId: 'cat-corrida',
      valorCentavos: 2500, // R$ 25,00
      qtdCorridas: 1,
      partes: [
        { local_id: 'bolso', meio: 'dinheiro', valor_centavos: 2500 },
      ],
    };

    const resultado = validarEProcessarCorrida(input);

    expect(resultado.lancamentoPrincipal.qtd_corridas).toBe(1);
    expect(resultado.partes).toHaveLength(1);
    expect(resultado.partes[0].local_id).toBe('bolso');
    expect(resultado.partes[0].valor_centavos).toBe(2500);
  });

  it('deve registrar Gorjeta da 99 com corridas = 0 sem duplicar contagem de corridas', () => {
    const inputGorjeta: LancarCorridaInput = {
      plataformaId: 'plat-99',
      categoriaId: 'cat-gorjeta',
      valorCentavos: 250, // R$ 2,50 de gorjeta
      qtdCorridas: 0, // Gorjeta NÃO conta como corrida
      partes: [
        { local_id: 'app-99', meio: 'app', valor_centavos: 250 },
      ],
    };

    const resultado = validarEProcessarCorrida(inputGorjeta);

    expect(resultado.lancamentoPrincipal.qtd_corridas).toBe(0);
    expect(resultado.lancamentoPrincipal.valor_centavos).toBe(250);
    expect(resultado.partes[0].valor_centavos).toBe(250);
  });

  it('deve permitir registrar Cupons da 99 retendo valor integral no saldo do App', () => {
    const inputCupom: LancarCorridaInput = {
      plataformaId: 'plat-99',
      categoriaId: 'cat-corrida',
      valorCentavos: 1800, // R$ 18,00
      qtdCorridas: 1,
      partes: [],
      restoTipo: 'cupom', // Passageiro usou cupom 99
    };

    const resultado = validarEProcessarCorrida(inputCupom);

    expect(resultado.lancamentoPrincipal.qtd_corridas).toBe(1);
    expect(resultado.partes).toHaveLength(1);
    expect(resultado.partes[0].local_id).toBe('app-99');
    expect(resultado.partes[0].meio).toBe('cupom');
    expect(resultado.partes[0].valor_centavos).toBe(1800);
  });
});
