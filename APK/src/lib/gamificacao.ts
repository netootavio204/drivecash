/**
 * Funções de regras de negócio de Gamificação (Fase 5)
 */

export type NivelMedalha = 'nenhum' | 'bronze' | 'prata' | 'ouro';

export interface ParametrosMedalha {
  valorAlcancado: number;
  valorAlvo: number;
  pctBronze?: number;
  pctPrata?: number;
  pctOuro?: number;
}

/**
 * Calcula o nível da medalha baseado no progresso atingido.
 * Padrão: 70% Bronze, 100% Prata, 130% Ouro
 */
export function calcularNivelMedalha({
  valorAlcancado,
  valorAlvo,
  pctBronze = 70,
  pctPrata = 100,
  pctOuro = 130,
}: ParametrosMedalha): NivelMedalha {
  if (valorAlvo <= 0) return 'nenhum';

  const valorBronze = Math.round((valorAlvo * pctBronze) / 100);
  const valorPrata = Math.round((valorAlvo * pctPrata) / 100);
  const valorOuro = Math.round((valorAlvo * pctOuro) / 100);

  if (valorAlcancado >= valorOuro) {
    return 'ouro';
  }
  if (valorAlcancado >= valorPrata) {
    return 'prata';
  }
  if (valorAlcancado >= valorBronze) {
    return 'bronze';
  }
  return 'nenhum';
}

/**
 * Retorna as estrelas acumuladas de uma medalha:
 * - Bronze: 1 estrela
 * - Prata: 3 estrelas (1 + 2)
 * - Ouro: 5 estrelas (3 + 2)
 */
export function calcularEstrelasPorMedalha(nivel: NivelMedalha): number {
  switch (nivel) {
    case 'ouro':
      return 5;
    case 'prata':
      return 3;
    case 'bronze':
      return 1;
    default:
      return 0;
  }
}

/**
 * Calcula a meta mínima diária sugerida pelas prioridades (RN-25).
 * Divide o montante total de contas pendentes pela quantidade de dias de trabalho esperados no mês (padrão: 25 dias / 6 dias por semana).
 */
export function calcularMetaMinimaSugerida(
  totalContasPendentesCentavos: number,
  diasTrabalhoMes: number = 25
): number {
  if (totalContasPendentesCentavos <= 0 || diasTrabalhoMes <= 0) {
    return 0;
  }
  return Math.ceil(totalContasPendentesCentavos / diasTrabalhoMes);
}

/**
 * Calcula a porcentagem concluída em relação ao alvo (limitada visualmente).
 */
export function calcularPercentualMeta(valorAlcancado: number, valorAlvo: number): number {
  if (valorAlvo <= 0) return 0;
  return Math.round((valorAlcancado / valorAlvo) * 100);
}
