import { describe, it, expect } from 'vitest';
import {
  dataReferencia,
  formatarData,
  formatarHora,
  intervaloDaSemana,
  diasDaSemana,
  saudacao,
} from './datas';

describe('datas.ts — Fuso e Datas (RN-02)', () => {
  it('gera data_referencia no formato yyyy-MM-dd', () => {
    const data = new Date('2026-10-10T15:30:00Z');
    const ref = dataReferencia(data);
    expect(ref).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('formata data e hora no fuso de São Paulo', () => {
    // 2026-10-10 15:00 UTC = 12:00 em SP (UTC-3)
    const data = new Date('2026-10-10T15:00:00Z');
    expect(formatarData(data, 'dd/MM/yyyy')).toBe('10/10/2026');
    expect(formatarHora(data)).toBe('12:00');
  });

  it('calcula o intervalo da semana iniciando na segunda-feira', () => {
    const data = new Date('2026-10-09T12:00:00Z'); // Sexta-feira
    const intervalo = intervaloDaSemana(data, 'segunda');
    expect(intervalo.inicio).toBe('2026-10-05'); // Segunda-feira
    expect(intervalo.fim).toBe('2026-10-11'); // Domingo
  });

  it('retorna os 7 dias da semana', () => {
    const data = new Date('2026-10-09T12:00:00Z');
    const dias = diasDaSemana(data, 'segunda');
    expect(dias).toHaveLength(7);
    expect(dias[0]).toBe('2026-10-05');
    expect(dias[6]).toBe('2026-10-11');
  });

  it('retorna saudação de acordo com a hora', () => {
    expect(saudacao(new Date('2026-10-10T11:00:00Z'))).toBe('Bom dia'); // 08:00 em SP
    expect(saudacao(new Date('2026-10-10T18:00:00Z'))).toBe('Boa tarde'); // 15:00 em SP
    expect(saudacao(new Date('2026-10-10T23:30:00Z'))).toBe('Boa noite'); // 20:30 em SP
  });
});
