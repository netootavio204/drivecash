import { describe, it, expect } from 'vitest';
import {
  formatarMoeda,
  lerMoeda,
  digitosParaCentavos,
  adicionarDigito,
  apagarDigito,
  virgulaParaReais,
  percentualDe,
  validarValorLancamento,
  VALOR_MAXIMO_CENTAVOS,
} from './money';

describe('money.ts — Cálculos Monetários em Centavos (RN-01)', () => {
  it('formata centavos para pt-BR / BRL corretamente', () => {
    expect(formatarMoeda(123456)).toBe('R$ 1.234,56');
    expect(formatarMoeda(0)).toBe('R$ 0,00');
    expect(formatarMoeda(1)).toBe('R$ 0,01');
    expect(formatarMoeda(100)).toBe('R$ 1,00');
    expect(formatarMoeda(5000)).toBe('R$ 50,00');
  });

  it('formata com sinal tipográfico quando solicitado', () => {
    expect(formatarMoeda(2500, { comSinal: true })).toBe('+R$ 25,00');
    expect(formatarMoeda(-3000, { comSinal: true })).toBe('−R$ 30,00');
  });

  it('lê textos em moeda brasileira e converte para centavos inteiros', () => {
    expect(lerMoeda('1.234,56')).toBe(123456);
    expect(lerMoeda('R$ 1234,56')).toBe(123456);
    expect(lerMoeda('0,50')).toBe(50);
    expect(lerMoeda('100')).toBe(10000);
    expect(lerMoeda('-50,00')).toBe(-5000);
    expect(lerMoeda('invalido')).toBeNull();
    expect(lerMoeda('')).toBeNull();
  });

  it('máscara estilo banco: dígitos para centavos inteiros', () => {
    expect(digitosParaCentavos('1')).toBe(1); // R$ 0,01
    expect(digitosParaCentavos('12')).toBe(12); // R$ 0,12
    expect(digitosParaCentavos('123')).toBe(123); // R$ 1,23
    expect(digitosParaCentavos('12345')).toBe(12345); // R$ 123,45
    expect(digitosParaCentavos('00050')).toBe(50);
  });

  it('adiciona dígitos deslocando a vírgula', () => {
    let valor = 0;
    valor = adicionarDigito(valor, 1);
    expect(valor).toBe(1); // R$ 0,01
    valor = adicionarDigito(valor, 2);
    expect(valor).toBe(12); // R$ 0,12
    valor = adicionarDigito(valor, 3);
    expect(valor).toBe(123); // R$ 1,23
  });

  it('apaga o último dígito corretamente', () => {
    expect(apagarDigito(12345)).toBe(1234);
    expect(apagarDigito(1234)).toBe(123);
    expect(apagarDigito(12)).toBe(1);
    expect(apagarDigito(1)).toBe(0);
    expect(apagarDigito(0)).toBe(0);
  });

  it('converte centavos em reais ao tocar na vírgula', () => {
    expect(virgulaParaReais(32)).toBe(3200); // 32 centavos -> R$ 32,00
    expect(virgulaParaReais(150)).toBe(15000); // R$ 150,00
  });

  it('calcula percentuais arredondando para o centavo mais próximo', () => {
    expect(percentualDe(10000, 10)).toBe(1000); // 10% de R$ 100 = R$ 10
    expect(percentualDe(3333, 10)).toBe(333); // 10% de R$ 33,33 = R$ 3,33 (333,3 -> 333)
  });

  it('valida valor do lançamento conforme RN-01 (> 0 e <= 1.000.000,00)', () => {
    expect(validarValorLancamento(100)).toEqual({ ok: true });
    expect(validarValorLancamento(0)).toEqual({ ok: false, erro: 'Digite um valor maior que zero.' });
    expect(validarValorLancamento(-50)).toEqual({ ok: false, erro: 'Digite um valor maior que zero.' });
    expect(validarValorLancamento(VALOR_MAXIMO_CENTAVOS + 1)).toEqual({
      ok: false,
      erro: 'O valor máximo é R$ 1.000.000,00.',
    });
  });
});
