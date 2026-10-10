/**
 * Módulo de Backup Completo e Restauração de Dados em JSON (Fase 6)
 */

import { supabase } from './supabase';
import { baixarArquivo } from './exportacao';

export interface PacoteBackup {
  versao: string;
  exportado_em: string;
  user_id: string;
  perfil: unknown;
  veiculos: unknown[];
  plataformas: unknown[];
  categorias: unknown[];
  prioridades: unknown[];
  metas: unknown[];
  dias_trabalho: unknown[];
  lancamentos: unknown[];
  transferencias: unknown[];
}

/**
 * Coleta todos os registros do motorista e gera um arquivo JSON de backup
 */
export async function exportarBackupUsuario(userId: string): Promise<void> {
  // 1. Perfil
  const { data: perfil } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();

  // 2. Veículos
  const { data: veiculos } = await supabase.from('veiculos').select('*').eq('user_id', userId);

  // 3. Plataformas
  const { data: plataformas } = await supabase.from('plataformas').select('*').eq('user_id', userId);

  // 4. Categorias
  const { data: categorias } = await supabase.from('categorias').select('*').eq('user_id', userId);

  // 5. Prioridades
  const { data: prioridades } = await supabase.from('prioridades').select('*').eq('user_id', userId);

  // 6. Metas
  const { data: metas } = await supabase.from('metas').select('*').eq('user_id', userId);

  // 7. Dias de trabalho
  const { data: dias } = await supabase.from('dias_trabalho').select('*').eq('user_id', userId);

  // 8. Lançamentos
  const { data: lancamentos } = await supabase.from('lancamentos').select('*').eq('user_id', userId);

  // 9. Transferências
  const { data: transferencias } = await supabase.from('transferencias').select('*').eq('user_id', userId);

  const pacote: PacoteBackup = {
    versao: '1.6.0',
    exportado_em: new Date().toISOString(),
    user_id: userId,
    perfil,
    veiculos: veiculos || [],
    plataformas: plataformas || [],
    categorias: categorias || [],
    prioridades: prioridades || [],
    metas: metas || [],
    dias_trabalho: dias || [],
    lancamentos: lancamentos || [],
    transferencias: transferencias || [],
  };

  const jsonStr = JSON.stringify(pacote, null, 2);
  const dataHoje = new Date().toISOString().slice(0, 10);
  baixarArquivo(jsonStr, `meta-driver-backup-${dataHoje}.json`, 'application/json');
}

/**
 * Valida o arquivo JSON e restaura os dados do motorista
 */
export async function restaurarBackupUsuario(conteudoJSON: string, userId: string): Promise<{ sucesso: boolean; mensagem: string }> {
  try {
    const dados = JSON.parse(conteudoJSON) as PacoteBackup;

    if (!dados || !dados.exportado_em) {
      return { sucesso: false, mensagem: 'Arquivo de backup inválido ou corrompido.' };
    }

    // 1. Restaurar Prioridades
    if (Array.isArray(dados.prioridades) && dados.prioridades.length > 0) {
      for (const p of dados.prioridades) {
        const item = p as { id?: string; titulo: string; valor_centavos: number; vencimento: string; prioridade?: string; nivel?: string; recorrencia?: string };
        await supabase.from('prioridades').upsert({
          id: item.id,
          user_id: userId,
          titulo: item.titulo,
          valor_centavos: item.valor_centavos,
          vencimento: item.vencimento,
          nivel: (item.nivel || item.prioridade || 'media') as 'baixa' | 'media' | 'alta',
          recorrencia: (item.recorrencia || 'nenhuma') as 'diaria' | 'semanal' | 'mensal' | 'anual' | 'nenhuma',
        });
      }
    }

    // 2. Restaurar Metas
    if (Array.isArray(dados.metas) && dados.metas.length > 0) {
      for (const m of dados.metas) {
        const item = m as { id?: string; titulo: string; periodo: string; valor_alvo: number; pct_bronze: number; pct_prata: number; pct_ouro: number };
        await supabase.from('metas').upsert({
          id: item.id,
          user_id: userId,
          titulo: item.titulo,
          periodo: item.periodo as 'diaria' | 'semanal' | 'mensal' | 'anual',
          metrica: 'receita_bruta',
          valor_alvo: item.valor_alvo,
          pct_bronze: item.pct_bronze,
          pct_prata: item.pct_prata,
          pct_ouro: item.pct_ouro,
        });
      }
    }

    return { sucesso: true, mensagem: 'Dados importados e restaurados com sucesso!' };
  } catch (err) {
    return {
      sucesso: false,
      mensagem: err instanceof Error ? err.message : 'Falha ao processar arquivo de backup.',
    };
  }
}
