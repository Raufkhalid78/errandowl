-- Migration 004: Feature completions for ErrandOwl
-- Adds missing columns and fixes schema inconsistencies

-- 1. Add portfolio_urls to tasker_profiles (image gallery)
ALTER TABLE public.tasker_profiles 
  ADD COLUMN IF NOT EXISTS portfolio_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS availability_days TEXT[] DEFAULT ARRAY['Mon','Tue','Wed','Thu','Fri'];

-- 2. Fix booking status constraint to include 'confirmed'
-- The UI uses 'confirmed' but schema only had 'accepted'
ALTER TABLE public.bookings 
  DROP CONSTRAINT IF EXISTS bookings_status_check;

ALTER TABLE public.bookings 
  ADD CONSTRAINT bookings_status_check 
  CHECK (status IN ('pending', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled'));

-- 3. Add service_name to bookings for easier display
ALTER TABLE public.bookings 
  ADD COLUMN IF NOT EXISTS service_name TEXT,
  ADD COLUMN IF NOT EXISTS client_name TEXT,
  ADD COLUMN IF NOT EXISTS tasker_name TEXT;

-- 4. Add payout details to profiles (structured)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS payout_details JSONB DEFAULT '{}';

-- 5. Add notification preferences to profiles
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS notify_email BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_push BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS notify_marketing BOOLEAN DEFAULT FALSE;

-- 6. Add avatar_url to profiles (was only avatar in some places)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar TEXT;

-- 7. RLS: Allow taskers to insert their own tasker_profile
DROP POLICY IF EXISTS "Taskers can insert own profile." ON public.tasker_profiles;
CREATE POLICY "Taskers can insert own profile." 
  ON public.tasker_profiles FOR INSERT 
  WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id)
  );

-- 8. RLS: Allow users to insert their own profile (needed for upsert)
DROP POLICY IF EXISTS "Users can insert own profile." ON public.profiles;
CREATE POLICY "Users can insert own profile." 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = auth_id);

-- 9. RLS: Allow admins to update any profile (for verification)
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
CREATE POLICY "Admins can update any profile." 
  ON public.profiles FOR UPDATE 
  USING (
    (SELECT role FROM public.profiles WHERE auth_id = auth.uid()) = 'admin'
  );

-- 10. RLS: Allow admins to manage tasker_profiles
DROP POLICY IF EXISTS "Admins can update any tasker profile." ON public.tasker_profiles;
CREATE POLICY "Admins can update any tasker profile." 
  ON public.tasker_profiles FOR UPDATE 
  USING (
    (SELECT role FROM public.profiles WHERE auth_id = auth.uid()) = 'admin'
  );

-- 11. RLS: Allow taskers to view open jobs (all pending bookings)
DROP POLICY IF EXISTS "Taskers can view open bookings." ON public.bookings;
CREATE POLICY "Taskers can view open bookings." 
  ON public.bookings FOR SELECT 
  USING (
    status = 'pending' AND tasker_id IS NULL
    OR auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id OR id = tasker_id)
    OR (SELECT role FROM public.profiles WHERE auth_id = auth.uid()) = 'admin'
  );

-- 12. Allow clients to update their bookings (for cancellation)
DROP POLICY IF EXISTS "Clients can update own bookings." ON public.bookings;
CREATE POLICY "Clients can update own bookings." 
  ON public.bookings FOR UPDATE 
  USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id)
  );

-- 13. Allow taskers to update bookings assigned to them
DROP POLICY IF EXISTS "Taskers can update assigned bookings." ON public.bookings;
CREATE POLICY "Taskers can update assigned bookings." 
  ON public.bookings FOR UPDATE 
  USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id)
  );

-- 14. Allow admins to manage all bookings
DROP POLICY IF EXISTS "Admins can manage all bookings." ON public.bookings;
CREATE POLICY "Admins can manage all bookings." 
  ON public.bookings FOR ALL 
  USING (
    (SELECT role FROM public.profiles WHERE auth_id = auth.uid()) = 'admin'
  );

-- 15. Storage: avatars bucket — allow public read and authenticated upload
DROP POLICY IF EXISTS "Public can view avatars" ON storage.objects;
CREATE POLICY "Public can view avatars" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatars" ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars" 
  ON storage.objects FOR INSERT 
  TO authenticated
  WITH CHECK (bucket_id = 'avatars');

-- 16. Documents public read (migration 002 made it public bucket)
DROP POLICY IF EXISTS "Public can view documents" ON storage.objects;
CREATE POLICY "Public can view documents" 
  ON storage.objects FOR SELECT 
  USING (bucket_id = 'documents');

-- Update seed settings with support phone
UPDATE public.settings 
SET 
  contact_phone = '+92 300 1234 567',
  contact_email = 'support@errandowl.com.pk',
  office_address = 'Office 402, 4th Floor, Arfa Software Technology Park, Ferozepur Road, Lahore, Pakistan'
WHERE id = 'global';
