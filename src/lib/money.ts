/**
 * Dinheiro — PRD RN-01
 * - Todo valor é INTEIRO em centavos (R$ 12,34 = 1234). Nunca float.
 * - Exibição em pt-BR / BRL.
 * - Máscara "estilo banco": o usuário digita só números e a vírgula anda.
 */

/** Valor máximo de um lançamento: R$ 1.000.000,00 (em centavos). */
export const VALOR_MAXIMO_CENTAVOS = 100_000_000;

const formatador = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Garante que o valor seja um inteiro seguro (centavos). */
export function ehCentavosValido(valor: unknown): valor is number {
  return typeof valor === 'number' && Number.isSafeInteger(valor);
}

function assegurarInteiro(centavos: number): void {
  if (!Number.isSafeInteger(centavos)) {
    throw new TypeError(`Valor monetário deve ser inteiro em centavos. Recebido: ${centavos}`);
  }
}

export type OpcoesFormato = {
  /** Mostra "+" em positivos e "−" (sinal de menos tipográfico) em negativos. */
  comSinal?: boolean;
  /** Oculta "R$ " (ex.: dentro de campos que já mostram o prefixo). */
  semSimbolo?: boolean;
};

/**
 * Formata centavos como moeda brasileira.
 * `formatarMoeda(123456)` → `"R$ 1.234,56"`
 */
export function formatarMoeda(centavos: number, opcoes: OpcoesFormato = {}): string {
  assegurarInteiro(centavos);
  const absoluto = Math.abs(centavos);
  // Divisão apenas para exibição; o valor de domínio permanece inteiro.
  let texto = formatador
    .format(absoluto / 100)
    .replace(/\u00a0/g, ' ')
    .replace(/\u202f/g, ' ');

  if (opcoes.semSimbolo) texto = texto.replace(/^R\$\s?/, '');

  if (centavos < 0) return `${opcoes.comSinal ? '−' : '-'}${texto}`;
  if (opcoes.comSinal && centavos > 0) return `+${texto}`;
  return texto;
}

/**
 * Lê um texto em formato brasileiro e devolve centavos.
 * `lerMoeda("1.234,56")` → `123456` · `lerMoeda("R$ 12")` → `1200`
 * Retorna `null` se o texto não for um valor válido.
 */
export function lerMoeda(texto: string): number | null {
  if (typeof texto !== 'string') return null;
  let limpo = texto.trim().replace(/\s|\u00a0|R\$/g, '');
  if (limpo === '') return null;

  let negativo = false;
  if (/^[-−]/.test(limpo)) {
    negativo = true;
    limpo = limpo.slice(1);
  }

  // Formato pt-BR: "." separa milhar, "," separa centavos.
  if (!/^\d{1,3}(\.\d{3})*(,\d{1,2})?$|^\d+(,\d{1,2})?$/.test(limpo)) return null;

  const [inteiros, decimais = ''] = limpo.replace(/\./g, '').split(',');
  const centavos = Number(inteiros) * 100 + Number(decimais.padEnd(2, '0'));
  if (!Number.isSafeInteger(centavos)) return null;
  return negativo ? -centavos : centavos;
}

/**
 * Máscara estilo banco: converte a sequência de dígitos digitados em centavos.
 * `"1"` → 1 · `"12"` → 12 · `"12345"` → 12345 (R$ 123,45)
 */
export function digitosParaCentavos(digitos: string, maximo = VALOR_MAXIMO_CENTAVOS): number {
  const somenteDigitos = digitos.replace(/\D/g, '').replace(/^0+/, '');
  if (somenteDigitos === '') return 0;
  const valor = Number(somenteDigitos);
  if (!Number.isSafeInteger(valor)) return maximo;
  return Math.min(valor, maximo);
}

/** Acrescenta um dígito à direita (a vírgula "anda"). Ignora se passar do máximo. */
export function adicionarDigito(
  centavos: number,
  digito: number,
  maximo = VALOR_MAXIMO_CENTAVOS,
): number {
  assegurarInteiro(centavos);
  if (!Number.isInteger(digito) || digito < 0 || digito > 9) return centavos;
  const novo = centavos * 10 + digito;
  return novo > maximo ? centavos : novo;
}

/** Remove o último dígito digitado. */
export function apagarDigito(centavos: number): number {
  assegurarInteiro(centavos);
  return Math.trunc(centavos / 10);
}

/**
 * Tecla "," do teclado numérico: transforma o que foi digitado em reais inteiros.
 * Ex.: digitou "32" (R$ 0,32) e tocou "," → R$ 32,00.
 */
export function virgulaParaReais(centavos: number, maximo = VALOR_MAXIMO_CENTAVOS): number {
  assegurarInteiro(centavos);
  const novo = centavos * 100;
  return novo > maximo ? centavos : novo;
}

/** Percentual sobre dinheiro, arredondado para o centavo mais próximo (RN-01). */
export function percentualDe(centavos: number, percentual: number): number {
  assegurarInteiro(centavos);
  return Math.round((centavos * percentual) / 100);
}

/** Valida valor de lançamento: > 0 e ≤ R$ 1.000.000,00 (RN-01). */
export function validarValorLancamento(centavos: number): { ok: true } | { ok: false; erro: string } {
  if (!ehCentavosValido(centavos)) return { ok: false, erro: 'Valor inválido.' };
  if (centavos <= 0) return { ok: false, erro: 'Digite um valor maior que zero.' };
  if (centavos > VALOR_MAXIMO_CENTAVOS)
    return { ok: false, erro: 'O valor máximo é R$ 1.000.000,00.' };
  return { ok: true };
}
