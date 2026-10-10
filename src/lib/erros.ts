/**
 * Mapeamento e tradução de mensagens de erro para linguagem amigável em português (PRD 11.3)
 */

const ERROS_MAPA: Record<string, string> = {
  NAO_AUTENTICADO: 'Sua sessão expirou. Entre novamente.',
  DIA_ABERTO_EXISTENTE: 'Você já tem um dia aberto. Feche-o antes de abrir outro.',
  DIA_JA_EXISTE_NESTA_DATA: 'Já existe um dia nesta data. Quer reabri-lo?',
  DIA_NAO_ENCONTRADO: 'Não encontramos esse dia.',
  DIA_JA_FECHADO: 'Este dia já foi fechado.',
  DIA_FECHADO: 'Este dia está fechado. Reabra o último dia para editar.',
  DIA_NAO_ESTA_FECHADO: 'Este dia ainda está aberto.',
  APENAS_ULTIMO_DIA: 'Só é possível reabrir o último dia fechado.',
  KM_FINAL_INVALIDO: 'O km final não pode ser menor que o km inicial.',
  SALDO_INSUFICIENTE: 'Saldo insuficiente no caixa de origem.',
  CAIXAS_IGUAIS: 'Escolha caixas diferentes.',
  CAIXA_INVALIDO: 'Caixa inválido.',
  VALOR_INVALIDO: 'Informe um valor maior que zero.',
  PRIORIDADE_NAO_ENCONTRADA: 'Prioridade não encontrada.',
  PRIORIDADE_JA_PAGA: 'Esta prioridade já foi marcada como paga.',
  // Erros comuns do Supabase Auth
  'Invalid login credentials': 'E-mail ou senha incorretos.',
  'User already registered': 'Este e-mail já possui uma conta cadastrada.',
  'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
  'Email not confirmed': 'Por favor, confirme seu e-mail antes de entrar.',
};

export function traduzirErro(erro: unknown): string {
  if (!erro) return 'Algo deu errado. Tente de novo em instantes.';

  let mensagemOriginal = '';

  if (typeof erro === 'string') {
    mensagemOriginal = erro;
  } else if (erro instanceof Error) {
    mensagemOriginal = erro.message;
  } else if (typeof erro === 'object' && erro !== null && 'message' in erro) {
    mensagemOriginal = String((erro as { message: unknown }).message);
  }

  // Verifica códigos exatos
  for (const [chave, traducao] of Object.entries(ERROS_MAPA)) {
    if (mensagemOriginal.includes(chave)) {
      return traducao;
    }
  }

  // Erro de tabela ou RPC não encontrada no Supabase
  if (
    mensagemOriginal.includes('PGRST202') ||
    mensagemOriginal.includes('PGRST205') ||
    mensagemOriginal.includes('schema cache')
  ) {
    return 'O banco de dados ainda não foi inicializado. Copie e execute o arquivo supabase/FULL_SETUP.sql no SQL Editor do Supabase.';
  }

  // Erro de integridade de perfil ou caixas
  if (
    mensagemOriginal.includes('profiles') ||
    mensagemOriginal.includes('foreign key constraint') ||
    mensagemOriginal.includes('dias_trabalho_user_id_fkey') ||
    mensagemOriginal.includes('caixa_id')
  ) {
    return 'Configurando caixas do seu perfil... Por favor, clique novamente em Bater Ponto.';
  }

  // Se for erro de rede/conexão
  if (mensagemOriginal.toLowerCase().includes('failed to fetch') || mensagemOriginal.toLowerCase().includes('network')) {
    return 'Sem conexão com a internet. Verifique seu sinal.';
  }

  return 'Algo deu errado. Tente de novo em instantes.';
}
