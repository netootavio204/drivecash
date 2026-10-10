import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { User } from '@supabase/supabase-js';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Garante que o usuário autenticado possua:
 * 1. Linha em public.profiles
 * 2. Linha em public.configuracoes
 * 3. Caixas padrão (principal e manutencao)
 * 4. Plataformas padrão (Uber, 99, inDrive, Particular, Outros)
 * 5. Categorias padrão de receitas e despesas
 *
 * Tudo executado com as permissões do próprio usuário logado (RLS),
 * tornando o app totalmente auto-suficiente sem depender de comandos manuais no SQL Editor do Supabase.
 */
export async function garantirProvisionamentoUsuario(user: User): Promise<Profile | null> {
  if (!user || !user.id) return null;

  try {
    const nomeFallback =
      user.user_metadata?.nome ||
      user.user_metadata?.full_name ||
      user.email?.split('@')[0] ||
      'Motorista';

    // 1. Garantir perfil
    let perfil: Profile | null = null;
    const { data: perfilExistente, error: erroBuscaPerfil } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (erroBuscaPerfil) {
      console.warn('[Meta Driver] Aviso ao verificar perfil:', erroBuscaPerfil.message);
    }

    if (!perfilExistente) {
      const { data: novoPerfil, error: erroCriaPerfil } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          nome: nomeFallback.slice(0, 80),
          fuso_horario: 'America/Sao_Paulo',
          onboarding_concluido: false,
        })
        .select()
        .single();

      if (erroCriaPerfil) {
        console.error('[Meta Driver] Erro ao criar perfil do usuário:', erroCriaPerfil.message);
      } else {
        perfil = novoPerfil;
      }
    } else {
      perfil = perfilExistente;
    }

    // 2. Garantir configurações
    const { data: configExistente } = await supabase
      .from('configuracoes')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!configExistente) {
      await supabase.from('configuracoes').insert({
        user_id: user.id,
        inicio_semana: 1,
        dias_trabalho_semana: 6,
        dias_folga: [],
        manutencao_modo: 'fixo',
        manutencao_valor_centavos: 2000,
        manutencao_percentual: 0,
      });
    }

    // 2.5 Garantir gamificação do usuário
    const { data: gamificacaoExistente } = await supabase
      .from('gamificacao_usuario')
      .select('user_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!gamificacaoExistente) {
      await supabase.from('gamificacao_usuario').insert({
        user_id: user.id,
        estrelas_totais: 0,
        fase_atual: 1,
      });
    }

    // 3. Garantir caixas (principal e manutenção)
    const { data: caixasExistentes } = await supabase
      .from('caixas')
      .select('id, tipo')
      .eq('user_id', user.id);

    const temPrincipal = caixasExistentes?.some((c) => c.tipo === 'principal');
    const temManutencao = caixasExistentes?.some((c) => c.tipo === 'manutencao');

    const caixasParaInserir: Array<{
      user_id: string;
      tipo: 'principal' | 'manutencao';
      nome: string;
      saldo_inicial_centavos: number;
      cor: string;
    }> = [];

    if (!temPrincipal) {
      caixasParaInserir.push({
        user_id: user.id,
        tipo: 'principal',
        nome: 'Caixa do dia',
        saldo_inicial_centavos: 0,
        cor: '#FF7A00',
      });
    }

    if (!temManutencao) {
      caixasParaInserir.push({
        user_id: user.id,
        tipo: 'manutencao',
        nome: 'Caixa Manutenção',
        saldo_inicial_centavos: 0,
        cor: '#22C55E',
      });
    }

    if (caixasParaInserir.length > 0) {
      await supabase.from('caixas').insert(caixasParaInserir);
    }

    // 4. Garantir plataformas
    const { data: plataformasExistentes } = await supabase
      .from('plataformas')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!plataformasExistentes || plataformasExistentes.length === 0) {
      await supabase.from('plataformas').insert([
        { user_id: user.id, nome: 'Uber', cor: '#FFFFFF', ordem: 1 },
        { user_id: user.id, nome: '99', cor: '#FFC83D', ordem: 2 },
        { user_id: user.id, nome: 'inDrive', cor: '#22C55E', ordem: 3 },
        { user_id: user.id, nome: 'Particular', cor: '#FF7A00', ordem: 4 },
        { user_id: user.id, nome: 'Outros', cor: '#B4B4BB', ordem: 5 },
      ]);
    }

    // 5. Garantir categorias
    const { data: categoriasExistentes } = await supabase
      .from('categorias')
      .select('id')
      .eq('user_id', user.id)
      .limit(1);

    if (!categoriasExistentes || categoriasExistentes.length === 0) {
      await supabase.from('categorias').insert([
        { user_id: user.id, tipo: 'entrada', nome: 'Corridas', icone: 'car', natureza: 'operacional', sistema: true, ordem: 1 },
        { user_id: user.id, tipo: 'entrada', nome: 'Gorjeta', icone: 'coins', natureza: 'operacional', sistema: true, ordem: 2 },
        { user_id: user.id, tipo: 'entrada', nome: 'Bônus / Promoção', icone: 'gift', natureza: 'operacional', sistema: true, ordem: 3 },
        { user_id: user.id, tipo: 'entrada', nome: 'Outras receitas', icone: 'plus-circle', natureza: 'operacional', sistema: true, ordem: 4 },
        { user_id: user.id, tipo: 'saida', nome: 'Combustível', icone: 'fuel', natureza: 'operacional', sistema: true, ordem: 1 },
        { user_id: user.id, tipo: 'saida', nome: 'Alimentação', icone: 'utensils', natureza: 'operacional', sistema: true, ordem: 2 },
        { user_id: user.id, tipo: 'saida', nome: 'Crédito no app', icone: 'smartphone', natureza: 'operacional', sistema: true, ordem: 3 },
        { user_id: user.id, tipo: 'saida', nome: 'Manutenção', icone: 'wrench', natureza: 'operacional', sistema: true, ordem: 4 },
        { user_id: user.id, tipo: 'saida', nome: 'Lavagem', icone: 'droplets', natureza: 'operacional', sistema: true, ordem: 5 },
        { user_id: user.id, tipo: 'saida', nome: 'Pedágio / Estacionamento', icone: 'ticket', natureza: 'operacional', sistema: true, ordem: 6 },
        { user_id: user.id, tipo: 'saida', nome: 'Multa', icone: 'alert-triangle', natureza: 'operacional', sistema: true, ordem: 7 },
        { user_id: user.id, tipo: 'saida', nome: 'Outras despesas', icone: 'more-horizontal', natureza: 'operacional', sistema: true, ordem: 8 },
        { user_id: user.id, tipo: 'saida', nome: 'Retirada pessoal', icone: 'wallet', natureza: 'retirada_pessoal', sistema: true, ordem: 9 },
      ]);
    }

    return perfil;
  } catch (err) {
    console.error('[Meta Driver] Erro durante auto-provisionamento do usuário:', err);
    return null;
  }
}
