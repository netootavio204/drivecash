import { describe, it, expect } from 'vitest';

describe('Fase V2.5 — Taxas, Ganho Líquido e Fechamento V2', () => {
  it('calcula ganho líquido e taxa efetiva % corretamente', () => {
    const ganhoBrutoCentavos = 30000; // R$ 300,00
    const taxaPlataformaCentavos = 4500; // R$ 45,00 (15%)
    const taxaMaquininhaCentavos = 500; // R$ 5,00

    const totalTaxas = taxaPlataformaCentavos + taxaMaquininhaCentavos; // R$ 50,00
    const ganhoLiquido = ganhoBrutoCentavos - totalTaxas; // R$ 250,00
    const taxaEfetivaPct = (totalTaxas * 100) / ganhoBrutoCentavos; // 16.666...%

    expect(ganhoLiquido).toBe(25000);
    expect(Number(taxaEfetivaPct.toFixed(2))).toBe(16.67);
  });

  it('calcula ganho por hora líquido descontando minutos de pausa/intervalos', () => {
    const ganhoLiquidoCentavos = 24000; // R$ 240,00 líquido
    const minutosBrutos = 540; // 9 horas de expediente
    const minutosPausa = 60; // 1 hora de almoço/descanso

    const minutosLiquidos = Math.max(0, minutosBrutos - minutosPausa); // 480 min = 8 horas
    const horasLiquidas = minutosLiquidos / 60; // 8 horas
    const ganhoPorHoraCentavos = Math.round(ganhoLiquidoCentavos / horasLiquidas);

    expect(minutosLiquidos).toBe(480);
    expect(horasLiquidas).toBe(8);
    expect(ganhoPorHoraCentavos).toBe(3000); // R$ 30,00 / hora líquida
  });

  it('calcula lucro por KM rodado com base no odômetro', () => {
    const lucroLiquidoCentavos = 18000; // R$ 180,00 de lucro
    const kmInicial = 100000;
    const kmFinal = 100150;
    const kmRodados = kmFinal - kmInicial; // 150 km

    const lucroPorKmCentavos = Math.round(lucroLiquidoCentavos / kmRodados);

    expect(kmRodados).toBe(150);
    expect(lucroPorKmCentavos).toBe(120); // R$ 1,20 / km
  });

  it('reproduz com precisão matemática o Caso A.1 do PRD V2', () => {
    // Corrida de R$ 30,00
    const valorCorrida = 3000; // R$ 30,00
    const parteCupom = 1000; // R$ 10,00 no App 99
    const parteDinheiro = 800; // R$ 8,00 no Bolso
    const partePix = 700; // R$ 7,00 no Inter
    const parteDebito = 500; // R$ 5,00 no Mercado Pago
    const taxaMaquininhaPct = 2.0; // 2%
    const taxaDebito = Math.round((parteDebito * taxaMaquininhaPct) / 100); // R$ 0,10
    const taxa99 = 600; // R$ 6,00

    expect(parteCupom + parteDinheiro + partePix + parteDebito).toBe(valorCorrida);
    expect(taxaDebito).toBe(10); // R$ 0,10

    // Saldos gerados por local:
    const saldoBolso = parteDinheiro; // +8,00
    const saldoInter = partePix; // +7,00
    const saldoMercadoPago = parteDebito - taxaDebito; // +4,90
    const saldoApp99 = parteCupom - taxa99; // +4,00

    const totalLiquidoRecebido = saldoBolso + saldoInter + saldoMercadoPago + saldoApp99;
    expect(saldoBolso).toBe(800);
    expect(saldoInter).toBe(700);
    expect(saldoMercadoPago).toBe(490);
    expect(saldoApp99).toBe(400);
    expect(totalLiquidoRecebido).toBe(2390); // R$ 23,90 líquido!
  });

  it('detecta sobras e faltas na conferência de saldo do bolso no fechamento', () => {
    const saldoCalculado = 8500; // R$ 85,00 calculado pelo sistema

    // Caso 1: Bateu exato
    const informadoExato = 8500;
    const difExato = informadoExato - saldoCalculado;
    expect(difExato).toBe(0);

    // Caso 2: Sobra de R$ 5,00
    const informadoSobra = 9000;
    const difSobra = informadoSobra - saldoCalculado;
    expect(difSobra).toBe(500);

    // Caso 3: Falta de R$ 10,00
    const informadoFalta = 7500;
    const difFalta = informadoFalta - saldoCalculado;
    expect(difFalta).toBe(-1000);
  });
});
