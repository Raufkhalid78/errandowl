-- Add pricing_mode to tasker_profiles
ALTER TABLE public.tasker_profiles ADD COLUMN IF NOT EXISTS pricing_mode TEXT DEFAULT 'hourly' CHECK (pricing_mode IN ('hourly', 'fixed'));
