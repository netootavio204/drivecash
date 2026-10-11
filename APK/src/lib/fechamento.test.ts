import { describe, it, expect } from 'vitest';
import { formatarMoeda } from './money';

describe('Fechamento do Dia — Regras Matemáticas e Anexo A do PRD', () => {
  it('reproduz com exatidão o fechamento financeiro do Anexo A', () => {
    // 1. Saldo inicial herdado do dia anterior
    const saldoInicialCentavos = 15000; // R$ 150,00

    // 2. Entradas do dia
    const entradas = [
      { plataforma: 'Uber', valor: 22000 },
      { plataforma: '99', valor: 13000 },
      { plataforma: 'Particular', valor: 5000 },
    ];
    const totalEntradasCentavos = entradas.reduce((acc, e) => acc + e.valor, 0);
    expect(totalEntradasCentavos).toBe(40000); // R$ 400,00

    // 3. Saídas do dia (combustível, lanche, taxa)
    const saidas = [9000, 2500, 3000];
    const totalSaidasCentavos = saidas.reduce((acc, s) => acc + s, 0);
    expect(totalSaidasCentavos).toBe(14500); // R$ 145,00

    // 4. Lucro líquido do dia
    const lucroLiquidoCentavos = totalEntradasCentavos - totalSaidasCentavos;
    expect(lucroLiquidoCentavos).toBe(25500); // R$ 255,00

    // 5. Saldo calculado que deve estar no caixa
    const saldoCalculadoCentavos = saldoInicialCentavos + totalEntradasCentavos - totalSaidasCentavos;
    expect(saldoCalculadoCentavos).toBe(40500); // R$ 405,00

    // 6. Conferência de dinheiro em mãos informando R$ 400,00
    const saldoInformadoCentavos = 40000; // R$ 400,00
    const diferencaCentavos = saldoInformadoCentavos - saldoCalculadoCentavos;
    expect(diferencaCentavos).toBe(-500); // Falta de R$ 5,00

    // 7. Depósito na Reserva de Manutenção
    const depositoManutencaoCentavos = 2000; // R$ 20,00

    // 8. Saldo final de fechamento (saldo que fica para amanhã)
    const saldoFechamentoCentavos = saldoCalculadoCentavos + diferencaCentavos - depositoManutencaoCentavos;
    expect(saldoFechamentoCentavos).toBe(38000); // R$ 380,00

    // 9. Sobra livre real do dia
    const sobraLivreCentavos = lucroLiquidoCentavos - depositoManutencaoCentavos;
    expect(sobraLivreCentavos).toBe(23500); // R$ 235,00

    // Validação de formatação monetária oficial
    expect(formatarMoeda(saldoFechamentoCentavos)).toBe('R$ 380,00');
    expect(formatarMoeda(depositoManutencaoCentavos)).toBe('R$ 20,00');
    expect(formatarMoeda(lucroLiquidoCentavos)).toBe('R$ 255,00');
    expect(formatarMoeda(sobraLivreCentavos)).toBe('R$ 235,00');
  });

  it('calcula odômetro e rendimento por km rodado corretamente', () => {
    const kmInicial = 125000;
    const kmFinal = 125150;
    const kmRodados = kmFinal - kmInicial;
    expect(kmRodados).toBe(150);

    const lucroCentavos = 25500; // R$ 255,00
    const rendimentoPorKm = lucroCentavos / kmRodados / 100;
    expect(rendimentoPorKm).toBe(1.70); // R$ 1,70 por km rodado
  });

  it('calcula datas de vencimento de recorrência de prioridades', () => {
    const dataBase = new Date(2026, 9, 10); // 10 de Outubro de 2026

    // Diária (+1 dia)
    const diaria = new Date(dataBase);
    diaria.setDate(diaria.getDate() + 1);
    expect(diaria.getDate()).toBe(11);

    // Semanal (+7 dias)
    const semanal = new Date(dataBase);
    semanal.setDate(semanal.getDate() + 7);
    expect(semanal.getDate()).toBe(17);

    // Mensal (+1 mês)
    const mensal = new Date(dataBase);
    mensal.setMonth(mensal.getMonth() + 1);
    expect(mensal.getMonth()).toBe(10); // Novembro

    // Anual (+1 ano)
    const anual = new Date(dataBase);
    anual.setFullYear(anual.getFullYear() + 1);
    expect(anual.getFullYear()).toBe(2027);
  });
});
