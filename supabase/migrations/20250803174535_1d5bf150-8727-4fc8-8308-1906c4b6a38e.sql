-- Fix function search path security issue
CREATE OR REPLACE FUNCTION public.generate_anonymous_token()
RETURNS TEXT 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64url');
END;
$$;