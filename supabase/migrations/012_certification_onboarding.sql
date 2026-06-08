-- Migration 012: Add Certification Upload for Tasker Verification
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS certificate_url TEXT;
