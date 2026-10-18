export type TipoLocal = 'bolso' | 'app' | 'banco';

export interface BancoCatalogo {
  codigo: string;
  nome: string;
  cor: string;
  ordem: number;
}

export interface LocalDinheiro {
  id: string;
  user_id: string;
  tipo: TipoLocal;
  nome: string;
  banco_codigo?: string | null;
  cor?: string | null;
  saldo_inicial_centavos: number;
  taxa_debito_pct: number;
  taxa_credito_pct: number;
  taxa_pix_pct: number;
  prazo_credito_dias: number;
  ativo: boolean;
  ordem: number;
  criado_em: string;
}

export interface LocalComSaldo extends LocalDinheiro {
  saldo_centavos: number;
}

export interface LocalTransferencia {
  id: string;
  user_id: string;
  local_origem_id: string;
  local_destino_id: string;
  valor_centavos: number;
  taxa_centavos: number;
  dia_id?: string | null;
  data_referencia: string;
  observacao?: string | null;
  excluido_em?: string | null;
  criado_em: string;
  local_origem?: LocalDinheiro;
  local_destino?: LocalDinheiro;
}

export interface ConciliacaoLocais {
  user_id: string;
  total_locais_centavos: number;
  total_caixas_centavos: number;
  diferenca_centavos: number;
}

export interface CriarTransferenciaInput {
  local_origem_id: string;
  local_destino_id: string;
  valor_centavos: number;
  taxa_centavos?: number;
  dia_id?: string | null;
  observacao?: string | null;
}
