-- Drop existing trigger and function to recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Recreate the function to extract Discord ID from OAuth provider
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  discord_provider_id text;
BEGIN
  -- Check if user signed up with Discord OAuth
  -- The provider_id is stored in raw_user_meta_data for OAuth users
  discord_provider_id := new.raw_user_meta_data ->> 'provider_id';
  
  -- If provider_id doesn't exist, try to get it from the identities
  -- Discord users have their Discord ID in the identity data
  IF discord_provider_id IS NULL THEN
    SELECT identity_data ->> 'provider_id'
    INTO discord_provider_id
    FROM auth.identities
    WHERE user_id = new.id AND provider = 'discord'
    LIMIT 1;
  END IF;

  -- Also try 'sub' field which sometimes contains the Discord ID
  IF discord_provider_id IS NULL THEN
    discord_provider_id := new.raw_user_meta_data ->> 'sub';
  END IF;

  -- Profil oluştur
  INSERT INTO public.profiles (id, username, avatar_url, discord_id)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', new.raw_user_meta_data ->> 'user_name'),
    new.raw_user_meta_data ->> 'avatar_url',
    discord_provider_id
  );
  
  -- user_roles tablosuna 'user' rolü ekle
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new.id, 'user');
  
  RETURN new;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Also create a function to update discord_id for existing users when they log in
-- This will be called manually or through an edge function after OAuth sign-in
CREATE OR REPLACE FUNCTION public.sync_discord_id_from_identity(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  discord_id_value text;
BEGIN
  -- Get Discord ID from identities table
  SELECT identity_data ->> 'provider_id'
  INTO discord_id_value
  FROM auth.identities
  WHERE user_id = p_user_id AND provider = 'discord'
  LIMIT 1;
  
  -- If not found in provider_id, try 'sub'
  IF discord_id_value IS NULL THEN
    SELECT identity_data ->> 'sub'
    INTO discord_id_value
    FROM auth.identities
    WHERE user_id = p_user_id AND provider = 'discord'
    LIMIT 1;
  END IF;
  
  -- Update profile if we found a Discord ID
  IF discord_id_value IS NOT NULL THEN
    UPDATE public.profiles
    SET discord_id = discord_id_value
    WHERE id = p_user_id AND (discord_id IS NULL OR discord_id != discord_id_value);
    RETURN true;
  END IF;
  
  RETURN false;
END;
$$;