import { describe, it, expect } from 'vitest';
import { traduzirErro } from './erros';

describe('traduzirErro (PRD 11.3)', () => {
  it('traduz erros de regra de negócio do banco de dados', () => {
    expect(traduzirErro(new Error('DIA_ABERTO_EXISTENTE'))).toBe(
      'Você já tem um dia aberto. Feche-o antes de abrir outro.'
    );
    expect(traduzirErro(new Error('KM_FINAL_INVALIDO'))).toBe(
      'O km final não pode ser menor que o km inicial.'
    );
    expect(traduzirErro(new Error('SALDO_INSUFICIENTE'))).toBe(
      'Saldo insuficiente no caixa de origem.'
    );
    expect(traduzirErro(new Error('APENAS_ULTIMO_DIA'))).toBe(
      'Só é possível reabrir o último dia fechado.'
    );
  });

  it('traduz erros de autenticação do Supabase', () => {
    expect(traduzirErro(new Error('Invalid login credentials'))).toBe(
      'E-mail ou senha incorretos.'
    );
    expect(traduzirErro(new Error('Password should be at least 6 characters'))).toBe(
      'A senha deve ter pelo menos 6 caracteres.'
    );
  });

  it('retorna mensagem genérica para erros desconhecidos', () => {
    expect(traduzirErro(new Error('UNKNOWN_SQL_ERROR'))).toBe(
      'Algo deu errado. Tente de novo em instantes.'
    );
    expect(traduzirErro(null)).toBe('Algo deu errado. Tente de novo em instantes.');
  });
});
