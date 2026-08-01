-- Dispute evidence bucket
insert into storage.buckets (id, name, public) values ('disputes', 'disputes', false)
on conflict (id) do nothing;

CREATE POLICY "Users upload own dispute evidence" ON storage.objects FOR INSERT WITH CHECK
  (bucket_id = 'disputes' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Booking parties and admins view dispute evidence files" ON storage.objects FOR SELECT
  USING (bucket_id = 'disputes' AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email')
  ));

-- Completion photos bucket
insert into storage.buckets (id, name, public) values ('completion_photos', 'completion_photos', true)
on conflict (id) do nothing;

CREATE POLICY "Public read completion photos" ON storage.objects FOR SELECT USING (bucket_id = 'completion_photos');

CREATE POLICY "Booking parties upload completion photos" ON storage.objects FOR INSERT WITH CHECK
  (bucket_id = 'completion_photos' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add completion_photo_urls column to bookings table
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS completion_photo_urls TEXT[] DEFAULT '{}';
