/**
 * Textos de interface (pt-BR) — PRD Anexo B.
 * Use `t(textos.chave, { valor: '...' })` para preencher variáveis {assim}.
 */
import { APP_NAME } from './config';

export const textos = {
  app: {
    nome: APP_NAME,
  },

  // ---- Anexo B ----
  dia: {
    abrirTitulo: 'Bom dia! Pronto para rodar?',
    abrirBotao: '⏱ Bater ponto — Abrir dia',
    saldoAcumulado: 'Seu caixa acumulado: {valor}',
    pontoBatido: 'Ponto batido às {hora}. Bom trabalho!',
    esquecido: 'Você esqueceu de fechar o dia {data}. Vamos fechar agora?',
    fechado: 'Dia fechado! Amanhã você começa com {valor}.',
    fecharBotao: 'Fechar o dia',
  },
  lancamento: {
    entradaSalva: '+{valor} no caixa',
    saidaSalva: '−{valor} registrado',
    excluido: 'Lançamento excluído',
    desfazer: 'Desfazer',
  },
  caixa: {
    negativo: 'Seu caixa ficou negativo em {valor}. Falta lançar alguma entrada?',
    conferenciaFalta: 'Faltam {valor} no caixa. Vamos registrar o ajuste?',
    conferenciaSobra: 'Sobraram {valor}. Vamos registrar o ajuste?',
  },
  manutencao: {
    guardar: 'Guardar {valor} para a manutenção hoje?',
    pular: 'Pular hoje',
  },
  metas: {
    bronze: 'Bronze desbloqueado! Você chegou à meta mínima.',
    prata: 'Prata! Meta batida!',
    ouro: 'OURO! Você superou a meta!',
    novaFase: 'Nova fase: {nome}! Continue assim.',
    faltandoPouco: 'Faltam só {valor} para a meta de hoje.',
  },
  vazio: {
    lancamentos: 'Nenhum lançamento ainda. Que tal registrar a primeira corrida?',
    metas: 'Crie sua primeira meta e comece a ganhar medalhas.',
  },
  erro: {
    generico: 'Algo deu errado. Tente de novo em instantes.',
    tentarDeNovo: 'Tentar de novo',
  },
  conta: {
    excluir: 'Isso apaga tudo e não pode ser desfeito. Digite EXCLUIR para confirmar.',
  },

  // ---- Navegação (PRD 8.1) ----
  nav: {
    inicio: 'Início',
    caixa: 'Caixa',
    metas: 'Metas',
    mais: 'Mais',
    novo: 'Novo lançamento',
    entrada: 'Entrada',
    saida: 'Saída',
    lote: 'Lote por plataforma',
    manutencao: 'Caixa Manutenção',
    conquistas: 'Conquistas',
    prioridades: 'Prioridades',
    historico: 'Histórico',
    relatorios: 'Relatórios',
    veiculo: 'Veículo',
    configuracoes: 'Configurações',
    designSystem: 'Design System',
  },

  // ---- Genéricos ----
  comum: {
    salvar: 'Salvar',
    cancelar: 'Cancelar',
    confirmar: 'Confirmar',
    fechar: 'Fechar',
    voltar: 'Voltar',
    continuar: 'Continuar',
    carregando: 'Carregando…',
    emBreve: 'Em breve',
    voltarInicio: 'Voltar ao início',
  },
} as const;

/** Substitui {variaveis} no texto. */
export function t(texto: string, variaveis: Record<string, string | number> = {}): string {
  return texto.replace(/\{(\w+)\}/g, (inteiro, chave: string) =>
    chave in variaveis ? String(variaveis[chave]) : inteiro,
  );
}
