/**
 * Configurações gerais do app.
 * Para trocar o nome do app, altere APENAS `APP_NAME` aqui.
 */
export const APP_NAME = 'Meta Driver';

export const APP_DESCRICAO = 'O caixa e as metas do motorista de aplicativo.';

/** Fuso horário padrão (PRD RN-02). */
export const FUSO_PADRAO = 'America/Sao_Paulo';

/** Locale e moeda (PRD RN-01). */
export const LOCALE = 'pt-BR';
export const MOEDA = 'BRL';

/** Caminhos do logo (gerados a partir da imagem do dono). */
export const LOGO = {
  pequeno: '/logo-96.png',
  medio: '/logo-192.png',
  grande: '/logo-512.png',
} as const;
