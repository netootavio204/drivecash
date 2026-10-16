-- Migration 0007: Suporte a 'cartao' no meio_pagamento de lançamentos
-- Permite 'cartao' de forma retrocompatível na tabela de lançamentos.

DO $$
BEGIN
  -- Remove constraint antiga se existir
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'lancamentos_meio_pagamento_check'
  ) THEN
    ALTER TABLE public.lancamentos DROP CONSTRAINT lancamentos_meio_pagamento_check;
  END IF;

  -- Adiciona nova constraint permitindo dinheiro, pix, cartao, saldo_app e outro
  ALTER TABLE public.lancamentos ADD CONSTRAINT lancamentos_meio_pagamento_check 
    CHECK (meio_pagamento IS NULL OR meio_pagamento IN ('dinheiro', 'pix', 'cartao', 'saldo_app', 'outro'));
END $$;
