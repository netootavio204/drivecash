# Relatório de Auditoria Inicial — DriveCash v2 (Fase V2.1)

> **Data:** 18 de outubro de 2026  
> **Status da Fase V2.1:** Concluída com sucesso (Rede de segurança armada)  
> **Tag Git de segurança:** `pre-v2`  
> **Branch de trabalho:** `v2-atualizacao` / `v2-fase-1-auditoria`

---

## 1. Mapa Real do Sistema (Código e Banco de Dados)

### 1.1 Arquitetura e Frontend
- **Framework:** React 18 + Vite 8 + TypeScript 6 + Tailwind CSS v4.
- **Gerenciador de Estado do Servidor:** TanStack React Query v5.
- **Roteamento:** React Router v7.
- **Mobile / APK:** Capacitor v7 integrado no diretório `APK/`.
  - App ID: `com.metadriver.app`
  - Nome: Meta Driver / DriveCash
  - Versão atual: `versionName "1.1.0"`, `versionCode 3`
  - Keystore existente e preservada para atualização na Fase V2.6.

### 1.2 Banco de Dados Real (Supabase)
O banco foi construído através das migrações `0001` a `0007`:
- **Tabelas principais:** `profiles`, `configuracoes`, `veiculos`, `plataformas`, `categorias`, `caixas`, `dias_trabalho`, `transferencias`, `prioridades`, `lancamentos`, `metas`, `meta_ciclos`, `fases`, `conquistas_catalogo`, `conquistas_usuario`, `gamificacao_usuario`.
- **Constraint `lancamentos.origem`:** `CHECK (origem IN ('manual','resumo_dia','deposito_manutencao','ajuste_abertura','conferencia','prioridade','transferencia','sistema'))`.
- **Constraint `lancamentos.meio_pagamento`:** Atualizada pela migração `0007` para aceitar `dinheiro`, `pix`, `cartao`, `saldo_app`, `outro` (ou nulo).
- **Views existentes:** `vw_resumo_dia` e `vw_saldo_caixas` (ambas com `security_invoker = true`).
- **Funções / RPCs:** `rpc_abrir_dia`, `rpc_fechar_dia`, `rpc_reabrir_dia`, `rpc_atualizar_metas`, `rpc_avaliar_conquistas`, `rpc_pagar_prioridade`, `fn_valor_metrica`, `fn_limites_periodo`.
- **Segurança (RLS):** Ativa em 100% das tabelas. Nenhuma credencial `service_role` exposta no código frontend (apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`).

---

## 2. Diagnóstico dos Defeitos Conhecidos

### 2.1 BUG-01 — Barras de Progresso das Metas Não Marcam
Durante a auditoria foram investigadas as hipóteses H1 a H9. Foram comprovadas as seguintes causas principais:
1. **Condição de corrida na invalidação de cache (H4):** No hook `useCriarLancamento` e `useCriarLancamentosEmLote` em `src/features/lancamentos/api.ts`, a chamada `void supabase.rpc('rpc_atualizar_metas')` é disparada de forma assíncrona enquanto o `queryClient.invalidateQueries` executa instantaneamente. O frontend solicita os dados antes que o servidor termine o recálculo, renderizando os valores anteriores desatualizados.
2. **Ausência de atualização na edição e exclusão (H4):** Os hooks `useEditarLancamento` e `useExcluirLancamento` **não chamavam** `rpc_atualizar_metas`, fazendo com que alterações ou exclusões não refletissem nas metas.
3. **Arredondamento e ausência de largura mínima (H2/H3):** O cálculo `Math.round((valorAlcancado / valorAlvo) * 100)` zera qualquer progresso menor que 0,5% (ex: R$ 0,50 ou R$ 1,00 de uma meta de R$ 300,00 resulta em 0%). Não havia `min-width` visual para indicar que o motorista já começou a rodar.
4. **Ciclo inexistente:** Se o dia é iniciado sem meta previamente calculada, `meta_ciclos` retorna vazio até que o motorista visite a aba de metas.

**Solução para a Fase V2.2:**
- Barra com cálculo contínuo (com casas decimais ou largura mínima de 2% para valores > 0);
- Sincronização garantida (`await`) e invalidação ordenada das queries;
- Barra de metas no topo e no Dashboard refletindo imediatamente qualquer lançamento.

### 2.2 BUG-02 — Divisão de Ganho e Duplicação de Corridas
- **Como está hoje no código (`EntradaRapidaSheet.tsx`):**
  Quando o motorista escolhe "Dividido", o sistema chama `criarLote` inserindo **dois registros separados** na tabela `lancamentos`:
  - 1º registro: Valor do passageiro (com `qtd_corridas = qtdCorridas`);
  - 2º registro: Valor retido no app (com `qtd_corridas = 0`).
- **Problema no histórico:**
  Antes da migração 0007, os pedaços eram inseridos com `qtd_corridas = 1` em ambos, inflando a contagem de corridas. Além disso, como são dois registros avulsos sem vínculo relacional de parentesco (`partes`), qualquer edição posterior ou exclusão avulsa quebra a coerência financeira.

---

## 3. Consulta de Auditoria de Corridas Divididas no Histórico

Para identificar no seu banco de dados se existem lançamentos duplicados gerados no mesmo segundo por divisão antiga, execute esta consulta segura (somente leitura) no **SQL Editor do painel Supabase**:

```sql
-- Identifica corridas divididas em múltiplos lançamentos no mesmo segundo
select user_id, dia_id, plataforma_id,
       date_trunc('second', criado_em) as criado_seg,
       count(*)                as pedacos,
       sum(valor_centavos)     as total_centavos,
       sum(qtd_corridas)       as corridas_contadas
from public.lancamentos
where tipo = 'entrada' and excluido_em is null and origem = 'manual'
group by user_id, dia_id, plataforma_id, date_trunc('second', criado_em)
having count(*) > 1
order by criado_seg desc;
```

---

## 4. Rede de Segurança Implementada

1. **Tag Git `pre-v2` criada:** Permite voltar exatamente ao estado inicial a qualquer instante com 1 comando.
2. **Branch `v2-atualizacao` e `v2-fase-1-auditoria` criadas:** Nenhum trabalho é feito diretamente na branch principal.
3. **Migração `0101_flags_e_backup.sql` preparada:**
   - Adiciona coluna `recursos` na tabela `configuracoes` com todas as flags desligadas por padrão:
     `{"intervalo": false, "locais": false, "partes": false, "taxas": false, "pdf": false}`;
   - Cria as tabelas de auditoria `v2_snapshot_antes` e `v2_snapshot_antes_caixas` protegidas por RLS.
4. **Hook seguro `useRecursos` implementado:** Protege a interface contra falhas caso a migração ainda não tenha sido aplicada no banco.
5. **Suíte de Testes:** 43 testes executados e 100% aprovados (`vitest run`).

---

## 5. Como o Motorista Pode Fazer o Backup Hoje

Como você utiliza o Supabase Gratuito, a forma mais rápida e segura de guardar seu backup é:
1. Acesse o **painel do Supabase** do seu projeto;
2. Vá em **Database** -> **Backups** (ou exporte as tabelas `lancamentos`, `dias_trabalho` e `caixas` em formato CSV/SQL);
3. Guarde o arquivo em **2 locais seguros** (ex: pen drive e nuvem privada Google Drive/OneDrive).
