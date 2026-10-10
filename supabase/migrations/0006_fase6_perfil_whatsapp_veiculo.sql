-- Migration 0006: Suporte a WhatsApp no Perfil, Veículo e Mensagens de Suporte

-- 1. Adicionar WhatsApp no perfil do motorista
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp text,
ADD COLUMN IF NOT EXISTS telefone text;

-- 2. Tabela de Mensagens de Suporte / Contato interno
CREATE TABLE IF NOT EXISTS public.suporte_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assunto text NOT NULL,
  mensagem text NOT NULL,
  contato text,
  status text NOT NULL DEFAULT 'pendente',
  criado_em timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.suporte_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Motorista pode enviar mensagens de suporte"
  ON public.suporte_mensagens
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Motorista pode visualizar suas mensagens de suporte"
  ON public.suporte_mensagens
  FOR SELECT
  USING (auth.uid() = user_id);

-- 3. Função RPC para excluir conta com segurança (RN-27)
CREATE OR REPLACE FUNCTION public.rpc_excluir_conta()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'NAO_AUTENTICADO';
  END IF;

  -- Remove o perfil e os relacionamentos cascade
  DELETE FROM public.profiles WHERE id = v_user_id;

  -- Remove da auth.users
  DELETE FROM auth.users WHERE id = v_user_id;

  RETURN true;
END;
$$;
