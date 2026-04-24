-- Backfill tasker_profiles for existing users who signed up as 'tasker'
-- but didn't get a tasker_profile row because of the onboarding bug.

INSERT INTO public.tasker_profiles (profile_id, city, active, hourly_rate, categories)
SELECT id, city, true, 1000, '{}'::text[]
FROM public.profiles
WHERE role = 'tasker'
AND id NOT IN (SELECT profile_id FROM public.tasker_profiles);
