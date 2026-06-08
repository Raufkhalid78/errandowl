-- Migration 006: Phase 2 Features
-- Implements Advanced Reviews, Recurring Bookings, and Skill Badges

-- 1. Advanced Reviews
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS rating_punctuality INTEGER CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
  ADD COLUMN IF NOT EXISTS rating_quality INTEGER CHECK (rating_quality >= 1 AND rating_quality <= 5),
  ADD COLUMN IF NOT EXISTS rating_communication INTEGER CHECK (rating_communication >= 1 AND rating_communication <= 5),
  ADD COLUMN IF NOT EXISTS tasker_reply TEXT;

-- 2. Recurring Bookings
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT DEFAULT 'none' CHECK (recurrence_pattern IN ('none', 'weekly', 'biweekly', 'monthly'));

-- 3. Skill Verification Badges
ALTER TABLE public.tasker_profiles
  ADD COLUMN IF NOT EXISTS verified_skills TEXT[] DEFAULT '{}';
