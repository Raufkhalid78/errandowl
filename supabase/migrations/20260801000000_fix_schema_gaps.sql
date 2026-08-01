-- 1.1 Add missing columns
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid'
  CHECK (payment_status IN ('unpaid', 'paid', 'refunded'));

ALTER TABLE public.payments ADD COLUMN IF NOT EXISTS provider_ref TEXT;

ALTER TABLE public.payment_webhook_logs
  ADD COLUMN IF NOT EXISTS booking_id UUID REFERENCES public.bookings(id),
  ADD COLUMN IF NOT EXISTS status TEXT,
  ADD COLUMN IF NOT EXISTS error_message TEXT,
  ALTER COLUMN event_type DROP NOT NULL;

-- 1.2 Fix public_profiles view — drop auth_id
DROP VIEW IF EXISTS public.public_profiles;
CREATE VIEW public.public_profiles
WITH (security_invoker = false) AS
SELECT
  p.id,
  p.name,
  p.avatar AS avatar_url,
  p.city,
  p.location,
  p.bio,
  p.is_verified,
  p.cnic_status,
  p.role,
  p.registered_at
FROM public.profiles p;

-- 1.2.1 Fix Referral Leaderboard join
-- We need to add a real foreign key from referral_codes.profile_id to profiles.id so that PostgREST can embed.
ALTER TABLE public.referral_codes
  DROP CONSTRAINT IF EXISTS referral_codes_profile_id_fkey,
  ADD CONSTRAINT referral_codes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 1.3 Add missing RLS policies
-- SOS events
CREATE POLICY "Users can trigger own SOS" ON public.sos_events FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));
CREATE POLICY "Users view own SOS events" ON public.sos_events FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id)
    OR EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admins manage SOS" ON public.sos_events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- SOS contacts
CREATE POLICY "Users manage own SOS contacts" ON public.sos_contacts FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));

-- Referral codes
CREATE POLICY "Users manage own referral code" ON public.referral_codes FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));
CREATE POLICY "Public can view referral codes for leaderboard" ON public.referral_codes FOR SELECT
  USING (true);

-- Promo codes
CREATE POLICY "Anyone can validate a promo code" ON public.promo_codes FOR SELECT USING (true);
CREATE POLICY "Admins manage promo codes" ON public.promo_codes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- Job bids — accept/reject
CREATE POLICY "Clients can update bids on their bookings" ON public.job_bids FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id IN (SELECT client_id FROM public.bookings WHERE id = booking_id)));

-- Messages — mark read
CREATE POLICY "Recipients can mark messages read" ON public.messages FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = receiver_id));

-- Reviews — admin reply
CREATE POLICY "Admins can reply to reviews" ON public.reviews FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- Admin audit log
CREATE POLICY "Admins can view audit logs" ON public.admin_audit_logs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- 1.4 Recreate storage buckets and policies
insert into storage.buckets (id, name, public) values
  ('documents', 'documents', false),
  ('avatars', 'avatars', true),
  ('portfolios', 'portfolios', true),
  ('chat_attachments', 'chat_attachments', false)
on conflict (id) do nothing;

CREATE POLICY "Owners can manage own documents" ON storage.objects FOR ALL
  USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT
  USING (bucket_id = 'documents' AND EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Public read avatars" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Owners manage own avatar" ON storage.objects FOR INSERT WITH CHECK
  (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Owners update own avatar" ON storage.objects FOR UPDATE USING
  (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Public read portfolios" ON storage.objects FOR SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "Taskers manage own portfolio files" ON storage.objects FOR ALL USING
  (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Chat participants access attachments" ON storage.objects FOR SELECT USING
  (bucket_id = 'chat_attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users upload own chat attachments" ON storage.objects FOR INSERT WITH CHECK
  (bucket_id = 'chat_attachments' AND auth.uid()::text = (storage.foldername(name))[1]);
