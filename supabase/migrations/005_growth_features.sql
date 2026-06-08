-- Migration 005: Growth Features (Phase 1)
-- Implements File Sharing in Chat, Tipping, and Favorite Taskers

-- 1. Create chat_attachments bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('chat_attachments', 'chat_attachments', true) 
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for chat_attachments
DROP POLICY IF EXISTS "Public can view chat attachments" ON storage.objects;
CREATE POLICY "Public can view chat attachments" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'chat_attachments');

DROP POLICY IF EXISTS "Authenticated users can upload chat attachments" ON storage.objects;
CREATE POLICY "Authenticated users can upload chat attachments" 
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'chat_attachments');

-- 2. Add attachment_url to messages
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS attachment_url TEXT;
  
-- Make text column nullable since messages might just be an image
ALTER TABLE public.messages
  ALTER COLUMN text DROP NOT NULL;

-- 3. Add tipping to bookings and payments
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(12,2) DEFAULT 0;

ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS tip_amount DECIMAL(12,2) DEFAULT 0;

-- 4. Create favorite_taskers table
CREATE TABLE IF NOT EXISTS public.favorite_taskers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(client_id, tasker_id)
);

-- Enable RLS on favorite_taskers
ALTER TABLE public.favorite_taskers ENABLE ROW LEVEL SECURITY;

-- RLS Policies for favorite_taskers
DROP POLICY IF EXISTS "Clients can view their own favorites" ON public.favorite_taskers;
CREATE POLICY "Clients can view their own favorites" 
    ON public.favorite_taskers FOR SELECT 
    USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id));

DROP POLICY IF EXISTS "Clients can insert their own favorites" ON public.favorite_taskers;
CREATE POLICY "Clients can insert their own favorites" 
    ON public.favorite_taskers FOR INSERT 
    WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id));

DROP POLICY IF EXISTS "Clients can delete their own favorites" ON public.favorite_taskers;
CREATE POLICY "Clients can delete their own favorites" 
    ON public.favorite_taskers FOR DELETE 
    USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id));
