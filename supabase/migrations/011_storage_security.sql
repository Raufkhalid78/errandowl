-- Migration 011: Storage Security Hardening
-- Drops broad SELECT policies on storage.objects that allow listing files in buckets.

-- 1. Remove public select from chat_attachments (now private and accessed via API proxy)
DROP POLICY IF EXISTS "Public can view chat attachments" ON storage.objects;

-- 2. Remove select policies for public buckets (avatars, portfolios) to prevent listing files.
-- Since these buckets are public, HTTP downloads are allowed directly by Supabase, but catalog listing via DB API is disabled.
DROP POLICY IF EXISTS "Avatar Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Portfolios Public Access" ON storage.objects;
