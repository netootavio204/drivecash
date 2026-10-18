/**
 * Recursos e Chaves Liga/Desliga da V2 (DriveCash)
 * Permite ligar ou desligar novas funcionalidades sem quebrar o sistema existente.
 */

export type RecursosV2 = {
  intervalo: boolean;
  locais: boolean;
  partes: boolean;
  taxas: boolean;
  pdf: boolean;
};

export const RECURSOS_PADRAO: RecursosV2 = {
  intervalo: false,
  locais: false,
  partes: false,
  taxas: false,
  pdf: false,
};

/**
 * Normaliza os recursos do usuário com fallback seguro
 */
export function normalizarRecursos(recursosDb?: unknown): RecursosV2 {
  if (!recursosDb || typeof recursosDb !== 'object') {
    return { ...RECURSOS_PADRAO };
  }

  const rec = recursosDb as Partial<RecursosV2>;

  return {
    intervalo: Boolean(rec.intervalo),
    locais: Boolean(rec.locais),
    partes: Boolean(rec.partes),
    taxas: Boolean(rec.taxas),
    pdf: Boolean(rec.pdf),
  };
}
