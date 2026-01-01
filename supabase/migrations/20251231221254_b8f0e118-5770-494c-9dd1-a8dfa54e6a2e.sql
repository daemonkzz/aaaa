-- Sync Discord IDs for all existing users who have Discord identity but no discord_id in profiles
UPDATE public.profiles p
SET discord_id = ai.identity_data->>'provider_id'
FROM auth.identities ai
WHERE ai.user_id = p.id 
  AND ai.provider = 'discord' 
  AND (p.discord_id IS NULL OR p.discord_id = '');