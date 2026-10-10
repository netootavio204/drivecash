export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type TipoCaixa = 'principal' | 'manutencao' | 'personalizado';
export type TipoLancamento =
  | 'entrada'
  | 'saida'
  | 'transferencia_entrada'
  | 'transferencia_saida'
  | 'ajuste_entrada'
  | 'ajuste_saida';
export type StatusDia = 'aberto' | 'fechado';
export type PeriodoMeta = 'diaria' | 'semanal' | 'mensal' | 'anual';
export type MetricaMeta =
  | 'receita_bruta'
  | 'lucro_liquido'
  | 'corridas'
  | 'dias_trabalhados'
  | 'reserva_manutencao'
  | 'km_rodados'
  | 'minutos_online';
export type NivelMedalha = 'nenhum' | 'bronze' | 'prata' | 'ouro';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          nome: string;
          avatar_url: string | null;
          fuso_horario: string;
          onboarding_concluido: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id: string;
          nome: string;
          avatar_url?: string | null;
          fuso_horario?: string;
          onboarding_concluido?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          nome?: string;
          avatar_url?: string | null;
          fuso_horario?: string;
          onboarding_concluido?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      configuracoes: {
        Row: {
          user_id: string;
          inicio_semana: number;
          dias_trabalho_semana: number;
          dias_folga: number[];
          manutencao_modo: 'fixo' | 'percentual' | 'desativado';
          manutencao_valor_centavos: number;
          manutencao_percentual: number;
          efeitos_ativos: boolean;
          som_ativo: boolean;
          vibracao_ativa: boolean;
          lembretes: Json;
          atualizado_em: string;
        };
        Insert: {
          user_id: string;
          inicio_semana?: number;
          dias_trabalho_semana?: number;
          dias_folga?: number[];
          manutencao_modo?: 'fixo' | 'percentual' | 'desativado';
          manutencao_valor_centavos?: number;
          manutencao_percentual?: number;
          efeitos_ativos?: boolean;
          som_ativo?: boolean;
          vibracao_ativa?: boolean;
          lembretes?: Json;
          atualizado_em?: string;
        };
        Update: {
          user_id?: string;
          inicio_semana?: number;
          dias_trabalho_semana?: number;
          dias_folga?: number[];
          manutencao_modo?: 'fixo' | 'percentual' | 'desativado';
          manutencao_valor_centavos?: number;
          manutencao_percentual?: number;
          efeitos_ativos?: boolean;
          som_ativo?: boolean;
          vibracao_ativa?: boolean;
          lembretes?: Json;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      veiculos: {
        Row: {
          id: string;
          user_id: string;
          apelido: string;
          marca: string | null;
          modelo: string | null;
          ano: number | null;
          placa: string | null;
          combustivel: string | null;
          km_atual: number | null;
          ativo: boolean;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          apelido: string;
          marca?: string | null;
          modelo?: string | null;
          ano?: number | null;
          placa?: string | null;
          combustivel?: string | null;
          km_atual?: number | null;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          apelido?: string;
          marca?: string | null;
          modelo?: string | null;
          ano?: number | null;
          placa?: string | null;
          combustivel?: string | null;
          km_atual?: number | null;
          ativo?: boolean;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      plataformas: {
        Row: {
          id: string;
          user_id: string;
          nome: string;
          cor: string;
          icone: string | null;
          ordem: number;
          ativa: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nome: string;
          cor?: string;
          icone?: string | null;
          ordem?: number;
          ativa?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nome?: string;
          cor?: string;
          icone?: string | null;
          ordem?: number;
          ativa?: boolean;
          criado_em?: string;
        };
        Relationships: [];
      };
      categorias: {
        Row: {
          id: string;
          user_id: string;
          tipo: 'entrada' | 'saida';
          nome: string;
          icone: string | null;
          cor: string | null;
          natureza: 'operacional' | 'retirada_pessoal';
          sistema: boolean;
          ativa: boolean;
          ordem: number;
          criado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tipo: 'entrada' | 'saida';
          nome: string;
          icone?: string | null;
          cor?: string | null;
          natureza?: 'operacional' | 'retirada_pessoal';
          sistema?: boolean;
          ativa?: boolean;
          ordem?: number;
          criado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tipo?: 'entrada' | 'saida';
          nome?: string;
          icone?: string | null;
          cor?: string | null;
          natureza?: 'operacional' | 'retirada_pessoal';
          sistema?: boolean;
          ativa?: boolean;
          ordem?: number;
          criado_em?: string;
        };
        Relationships: [];
      };
      caixas: {
        Row: {
          id: string;
          user_id: string;
          tipo: TipoCaixa;
          nome: string;
          saldo_inicial_centavos: number;
          meta_saldo_centavos: number | null;
          cor: string | null;
          ativo: boolean;
          criado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          tipo: TipoCaixa;
          nome: string;
          saldo_inicial_centavos?: number;
          meta_saldo_centavos?: number | null;
          cor?: string | null;
          ativo?: boolean;
          criado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          tipo?: TipoCaixa;
          nome?: string;
          saldo_inicial_centavos?: number;
          meta_saldo_centavos?: number | null;
          cor?: string | null;
          ativo?: boolean;
          criado_em?: string;
        };
        Relationships: [];
      };
      dias_trabalho: {
        Row: {
          id: string;
          user_id: string;
          data_referencia: string;
          status: StatusDia;
          aberto_em: string;
          fechado_em: string | null;
          saldo_abertura_centavos: number;
          saldo_calculado_centavos: number | null;
          saldo_informado_centavos: number | null;
          saldo_fechamento_centavos: number | null;
          diferenca_conferencia_centavos: number;
          reserva_manutencao_centavos: number;
          veiculo_id: string | null;
          km_inicial: number | null;
          km_final: number | null;
          minutos_online: number | null;
          observacoes: string | null;
          resumo: Json | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          data_referencia: string;
          status?: StatusDia;
          aberto_em?: string;
          fechado_em?: string | null;
          saldo_abertura_centavos: number;
          saldo_calculado_centavos?: number | null;
          saldo_informado_centavos?: number | null;
          saldo_fechamento_centavos?: number | null;
          diferenca_conferencia_centavos?: number;
          reserva_manutencao_centavos?: number;
          veiculo_id?: string | null;
          km_inicial?: number | null;
          km_final?: number | null;
          minutos_online?: number | null;
          observacoes?: string | null;
          resumo?: Json | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          data_referencia?: string;
          status?: StatusDia;
          aberto_em?: string;
          fechado_em?: string | null;
          saldo_abertura_centavos?: number;
          saldo_calculado_centavos?: number | null;
          saldo_informado_centavos?: number | null;
          saldo_fechamento_centavos?: number | null;
          diferenca_conferencia_centavos?: number;
          reserva_manutencao_centavos?: number;
          veiculo_id?: string | null;
          km_inicial?: number | null;
          km_final?: number | null;
          minutos_online?: number | null;
          observacoes?: string | null;
          resumo?: Json | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      lancamentos: {
        Row: {
          id: string;
          user_id: string;
          caixa_id: string;
          dia_id: string | null;
          tipo: TipoLancamento;
          valor_centavos: number;
          categoria_id: string | null;
          plataforma_id: string | null;
          descricao: string | null;
          qtd_corridas: number;
          km: number | null;
          duracao_min: number | null;
          meio_pagamento: string | null;
          ocorrido_em: string;
          data_referencia: string;
          origem: string;
          transferencia_id: string | null;
          prioridade_id: string | null;
          excluido_em: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          caixa_id: string;
          dia_id?: string | null;
          tipo: TipoLancamento;
          valor_centavos: number;
          categoria_id?: string | null;
          plataforma_id?: string | null;
          descricao?: string | null;
          qtd_corridas?: number;
          km?: number | null;
          duracao_min?: number | null;
          meio_pagamento?: string | null;
          ocorrido_em?: string;
          data_referencia?: string;
          origem?: string;
          transferencia_id?: string | null;
          prioridade_id?: string | null;
          excluido_em?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          caixa_id?: string;
          dia_id?: string | null;
          tipo?: TipoLancamento;
          valor_centavos?: number;
          categoria_id?: string | null;
          plataforma_id?: string | null;
          descricao?: string | null;
          qtd_corridas?: number;
          km?: number | null;
          duracao_min?: number | null;
          meio_pagamento?: string | null;
          ocorrido_em?: string;
          data_referencia?: string;
          origem?: string;
          transferencia_id?: string | null;
          prioridade_id?: string | null;
          excluido_em?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      transferencias: {
        Row: {
          id: string;
          user_id: string;
          caixa_origem_id: string;
          caixa_destino_id: string;
          valor_centavos: number;
          dia_id: string | null;
          observacao: string | null;
          excluido_em: string | null;
          criado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          caixa_origem_id: string;
          caixa_destino_id: string;
          valor_centavos: number;
          dia_id?: string | null;
          observacao?: string | null;
          excluido_em?: string | null;
          criado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          caixa_origem_id?: string;
          caixa_destino_id?: string;
          valor_centavos?: number;
          dia_id?: string | null;
          observacao?: string | null;
          excluido_em?: string | null;
          criado_em?: string;
        };
        Relationships: [];
      };
      prioridades: {
        Row: {
          id: string;
          user_id: string;
          titulo: string;
          valor_centavos: number;
          vencimento: string;
          nivel: 'alta' | 'media' | 'baixa';
          recorrencia: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
          status: 'pendente' | 'pago' | 'cancelada';
          observacao: string | null;
          pago_em: string | null;
          lancamento_id: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          titulo: string;
          valor_centavos: number;
          vencimento: string;
          nivel?: 'alta' | 'media' | 'baixa';
          recorrencia?: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
          status?: 'pendente' | 'pago' | 'cancelada';
          observacao?: string | null;
          pago_em?: string | null;
          lancamento_id?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          titulo?: string;
          valor_centavos?: number;
          vencimento?: string;
          nivel?: 'alta' | 'media' | 'baixa';
          recorrencia?: 'nenhuma' | 'diaria' | 'semanal' | 'mensal' | 'anual';
          status?: 'pendente' | 'pago' | 'cancelada';
          observacao?: string | null;
          pago_em?: string | null;
          lancamento_id?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      metas: {
        Row: {
          id: string;
          user_id: string;
          titulo: string;
          periodo: PeriodoMeta;
          metrica: MetricaMeta;
          valor_alvo: number;
          pct_bronze: number;
          pct_prata: number;
          pct_ouro: number;
          recorrente: boolean;
          ativa: boolean;
          inicio: string | null;
          fim: string | null;
          criado_em: string;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          titulo: string;
          periodo: PeriodoMeta;
          metrica: MetricaMeta;
          valor_alvo: number;
          pct_bronze?: number;
          pct_prata?: number;
          pct_ouro?: number;
          recorrente?: boolean;
          ativa?: boolean;
          inicio?: string | null;
          fim?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          titulo?: string;
          periodo?: PeriodoMeta;
          metrica?: MetricaMeta;
          valor_alvo?: number;
          pct_bronze?: number;
          pct_prata?: number;
          pct_ouro?: number;
          recorrente?: boolean;
          ativa?: boolean;
          inicio?: string | null;
          fim?: string | null;
          criado_em?: string;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      meta_ciclos: {
        Row: {
          id: string;
          meta_id: string;
          user_id: string;
          periodo_inicio: string;
          periodo_fim: string;
          valor_alvo_snapshot: number;
          pct_bronze: number;
          pct_prata: number;
          pct_ouro: number;
          valor_alcancado: number;
          nivel_atual: NivelMedalha;
          nivel_maximo: NivelMedalha;
          estrelas_ganhas: number;
          status: 'em_andamento' | 'consolidado';
          consolidado_em: string | null;
          atualizado_em: string;
        };
        Insert: {
          id?: string;
          meta_id: string;
          user_id: string;
          periodo_inicio: string;
          periodo_fim: string;
          valor_alvo_snapshot: number;
          pct_bronze: number;
          pct_prata: number;
          pct_ouro: number;
          valor_alcancado?: number;
          nivel_atual?: NivelMedalha;
          nivel_maximo?: NivelMedalha;
          estrelas_ganhas?: number;
          status?: 'em_andamento' | 'consolidado';
          consolidado_em?: string | null;
          atualizado_em?: string;
        };
        Update: {
          id?: string;
          meta_id?: string;
          user_id?: string;
          periodo_inicio?: string;
          periodo_fim?: string;
          valor_alvo_snapshot?: number;
          pct_bronze?: number;
          pct_prata?: number;
          pct_ouro?: number;
          valor_alcancado?: number;
          nivel_atual?: NivelMedalha;
          nivel_maximo?: NivelMedalha;
          estrelas_ganhas?: number;
          status?: 'em_andamento' | 'consolidado';
          consolidado_em?: string | null;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      fases: {
        Row: {
          numero: number;
          nome: string;
          estrelas_minimas: number;
          cor: string | null;
        };
        Insert: {
          numero: number;
          nome: string;
          estrelas_minimas: number;
          cor?: string | null;
        };
        Update: {
          numero?: number;
          nome?: string;
          estrelas_minimas?: number;
          cor?: string | null;
        };
        Relationships: [];
      };
      conquistas_catalogo: {
        Row: {
          codigo: string;
          titulo: string;
          descricao: string;
          icone: string | null;
          estrelas_bonus: number;
          ordem: number;
        };
        Insert: {
          codigo: string;
          titulo: string;
          descricao: string;
          icone?: string | null;
          estrelas_bonus?: number;
          ordem?: number;
        };
        Update: {
          codigo?: string;
          titulo?: string;
          descricao?: string;
          icone?: string | null;
          estrelas_bonus?: number;
          ordem?: number;
        };
        Relationships: [];
      };
      conquistas_usuario: {
        Row: {
          id: string;
          user_id: string;
          codigo: string;
          desbloqueada_em: string;
          contexto: Json | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          codigo: string;
          desbloqueada_em?: string;
          contexto?: Json | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          codigo?: string;
          desbloqueada_em?: string;
          contexto?: Json | null;
        };
        Relationships: [];
      };
      gamificacao_usuario: {
        Row: {
          user_id: string;
          estrelas_totais: number;
          fase_atual: number;
          sequencia_atual: number;
          maior_sequencia: number;
          atualizado_em: string;
        };
        Insert: {
          user_id: string;
          estrelas_totais?: number;
          fase_atual?: number;
          sequencia_atual?: number;
          maior_sequencia?: number;
          atualizado_em?: string;
        };
        Update: {
          user_id?: string;
          estrelas_totais?: number;
          fase_atual?: number;
          sequencia_atual?: number;
          maior_sequencia?: number;
          atualizado_em?: string;
        };
        Relationships: [];
      };
      auditoria: {
        Row: {
          id: number;
          user_id: string;
          tabela: string;
          registro_id: string | null;
          acao: string;
          antes: Json | null;
          depois: Json | null;
          criado_em: string;
        };
        Insert: {
          id?: never;
          user_id: string;
          tabela: string;
          registro_id?: string | null;
          acao: string;
          antes?: Json | null;
          depois?: Json | null;
          criado_em?: string;
        };
        Update: {
          id?: never;
          user_id?: string;
          tabela?: string;
          registro_id?: string | null;
          acao?: string;
          antes?: Json | null;
          depois?: Json | null;
          criado_em?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      vw_saldo_caixas: {
        Row: {
          caixa_id: string;
          user_id: string;
          tipo: TipoCaixa;
          nome: string;
          saldo_centavos: number;
        };
        Relationships: [];
      };
      vw_resumo_dia: {
        Row: {
          dia_id: string;
          user_id: string;
          data_referencia: string;
          receita_centavos: number;
          corridas: number;
          despesas_centavos: number;
          despesas_reserva_centavos: number;
          retiradas_centavos: number;
          reserva_centavos: number;
          ajustes_centavos: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      rpc_abrir_dia: {
        Args: {
          p_data_referencia: string;
          p_km_inicial?: number | null;
          p_saldo_confirmado_centavos?: number | null;
        };
        Returns: Database['public']['Tables']['dias_trabalho']['Row'];
      };
      rpc_fechar_dia: {
        Args: {
          p_dia_id: string;
          p_saldo_informado_centavos?: number | null;
          p_deposito_manutencao_centavos?: number;
          p_km_final?: number | null;
          p_minutos_online?: number | null;
          p_observacoes?: string | null;
        };
        Returns: Database['public']['Tables']['dias_trabalho']['Row'];
      };
      rpc_reabrir_dia: {
        Args: {
          p_dia_id: string;
        };
        Returns: Database['public']['Tables']['dias_trabalho']['Row'];
      };
      rpc_transferir: {
        Args: {
          p_origem: string;
          p_destino: string;
          p_valor_centavos: number;
          p_observacao?: string | null;
          p_dia_id?: string | null;
          p_origem_lancamento?: string;
        };
        Returns: string;
      };
      rpc_pagar_prioridade: {
        Args: {
          p_prioridade_id: string;
          p_caixa_id: string;
          p_categoria_id: string;
        };
        Returns: string;
      };
      rpc_atualizar_metas: {
        Args: {
          p_ref?: string | null;
        };
        Returns: {
          o_meta_id: string;
          o_ciclo_id: string;
          o_periodo: string;
          o_nivel_anterior: string;
          o_nivel_novo: string;
          o_estrelas: number;
        }[];
      };
    };
    Enums: {
      tipo_caixa: TipoCaixa;
      tipo_lancamento: TipoLancamento;
      status_dia: StatusDia;
      periodo_meta: PeriodoMeta;
      metrica_meta: MetricaMeta;
      nivel_medalha: NivelMedalha;
    };
    CompositeTypes: Record<string, never>;
  };
}
