-- Phase 1: ErrandOwl Pakistan Production Schema

-- Cleanup existing (WARNING: Destructive if data exists)
DROP TABLE IF EXISTS public.promo_codes CASCADE;
DROP TABLE IF EXISTS public.admins CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.reviews CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.tasker_profiles CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.categories CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 1. Profiles (synced with Auth)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    avatar_url TEXT,
    location TEXT,
    city TEXT,
    bio TEXT,
    role TEXT DEFAULT 'client' CHECK (role IN ('client', 'tasker', 'admin')),
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'ur')),
    is_verified BOOLEAN DEFAULT FALSE,
    cnic_url TEXT,
    cnic_status TEXT DEFAULT 'pending' CHECK (cnic_status IN ('pending', 'approved', 'rejected')),
    payout_method TEXT,
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    icon TEXT,
    description_en TEXT,
    description_ur TEXT,
    active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Services
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    description_en TEXT,
    description_ur TEXT,
    base_rate DECIMAL(12,2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tasker Profiles
CREATE TABLE public.tasker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    hourly_rate DECIMAL(12,2),
    fixed_rate DECIMAL(12,2),
    rating_avg DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    skills TEXT[],
    categories TEXT[], -- Array of category IDs
    city TEXT,
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    availability JSONB,
    elite BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id),
    tasker_id UUID REFERENCES public.profiles(id), -- Null if open job
    category_id TEXT REFERENCES public.categories(id),
    description TEXT,
    location TEXT,
    city TEXT,
    date DATE,
    time TIME,
    estimated_hours INTEGER DEFAULT 1,
    pricing_mode TEXT DEFAULT 'hourly' CHECK (pricing_mode IN ('hourly', 'fixed')),
    quoted_rate DECIMAL(12,2),
    total_cost DECIMAL(12,2),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
    payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    client_id UUID REFERENCES public.profiles(id),
    tasker_id UUID REFERENCES public.profiles(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Messages
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id),
    text TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    body TEXT,
    data JSONB,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id),
    amount DECIMAL(12,2) NOT NULL,
    method TEXT,
    provider_ref TEXT,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Global Settings
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    site_name TEXT DEFAULT 'ErrandOwl Pakistan',
    currency TEXT DEFAULT 'PKR',
    pricing_mode TEXT DEFAULT 'hourly' CHECK (pricing_mode IN ('hourly', 'fixed')),
    service_fee_percent DECIMAL(5,2) DEFAULT 10,
    min_rate DECIMAL(12,2) DEFAULT 300,
    max_rate DECIMAL(12,2) DEFAULT 5000,
    contact_email TEXT,
    contact_phone TEXT,
    office_address TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Admins
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. Promo Codes
CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_type TEXT CHECK (discount_type IN ('fixed', 'percentage')),
    discount_value DECIMAL(12,2),
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES

-- Profiles
CREATE POLICY "Public profiles are viewable by everyone." ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON public.profiles FOR UPDATE USING (auth.uid() = auth_id);

-- Categories & Services (Public Read)
CREATE POLICY "Categories are viewable by everyone." ON public.categories FOR SELECT USING (true);
CREATE POLICY "Services are viewable by everyone." ON public.services FOR SELECT USING (true);

-- Tasker Profiles
CREATE POLICY "Tasker profiles are viewable by everyone." ON public.tasker_profiles FOR SELECT USING (true);
CREATE POLICY "Taskers can update own profile." ON public.tasker_profiles FOR UPDATE USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id)
);

-- Bookings
CREATE POLICY "Users can view their own bookings." ON public.bookings FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id OR id = tasker_id)
    OR (SELECT role FROM public.profiles WHERE auth_id = auth.uid()) = 'admin'
    OR (SELECT email FROM public.admins WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())) IS NOT NULL
);
CREATE POLICY "Clients can create bookings." ON public.bookings FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id)
);

-- Messages
CREATE POLICY "Participants can view messages." ON public.messages FOR SELECT USING (
    auth.uid() IN (
        SELECT auth_id FROM public.profiles 
        WHERE id IN (SELECT client_id FROM public.bookings WHERE id = booking_id)
        OR id IN (SELECT tasker_id FROM public.bookings WHERE id = booking_id)
    )
);
CREATE POLICY "Participants can send messages." ON public.messages FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = sender_id)
);

-- Settings (Admin only write)
CREATE POLICY "Settings are viewable by everyone." ON public.settings FOR SELECT USING (true);

-- TRIGGERS

-- 1. Sync profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, name, email, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'role', 'client')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Update tasker rating on review
CREATE OR REPLACE FUNCTION public.update_tasker_rating()
RETURNS trigger AS $$
BEGIN
  UPDATE public.tasker_profiles
  SET 
    rating_avg = (SELECT AVG(rating)::DECIMAL(3,2) FROM public.reviews WHERE tasker_id = NEW.tasker_id),
    review_count = (SELECT COUNT(*) FROM public.reviews WHERE tasker_id = NEW.tasker_id)
  WHERE profile_id = NEW.tasker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_insert
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.update_tasker_rating();

-- 2.5 Notify on message insert
CREATE OR REPLACE FUNCTION public.notify_on_message()
RETURNS trigger AS $$
DECLARE
  recipient_id UUID;
BEGIN
  -- Determine the recipient (the person in the booking who is NOT the sender)
  SELECT CASE 
    WHEN client_id = NEW.sender_id THEN tasker_id 
    ELSE client_id 
  END INTO recipient_id
  FROM public.bookings
  WHERE id = NEW.booking_id;

  IF recipient_id IS NOT NULL THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      recipient_id,
      'new_message',
      'New Message',
      'You have a new message regarding your booking.',
      jsonb_build_object('booking_id', NEW.booking_id, 'message_id', NEW.id)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_insert
  AFTER INSERT ON public.messages
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_message();

-- 3. Auto-notify on booking status change
CREATE OR REPLACE FUNCTION public.notify_on_booking_status()
RETURNS trigger AS $$
BEGIN
  IF (OLD.status IS DISTINCT FROM NEW.status) THEN
    INSERT INTO public.notifications (user_id, type, title, body, data)
    VALUES (
      CASE WHEN NEW.status = 'accepted' THEN NEW.client_id ELSE NEW.tasker_id END,
      'booking_update',
      'Booking ' || NEW.status,
      'Your booking for ' || (SELECT name_en FROM public.categories WHERE id = NEW.category_id) || ' is now ' || NEW.status,
      jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_booking_status_change
  AFTER UPDATE ON public.bookings
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_booking_status();

-- 4. Notify tasker on new review
CREATE OR REPLACE FUNCTION public.notify_on_review()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, body, data)
  VALUES (
    NEW.tasker_id,
    'new_review',
    'New Review Received',
    'You received a ' || NEW.rating || '-star review from a client.',
    jsonb_build_object('booking_id', NEW.booking_id, 'rating', NEW.rating)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_review_insert_notify
  AFTER INSERT ON public.reviews
  FOR EACH ROW EXECUTE PROCEDURE public.notify_on_review();

-- Set up storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for Avatars
CREATE POLICY "Avatar Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage Policies for Documents (Private)
CREATE POLICY "Admins can view all documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');
CREATE POLICY "Users can view their own documents" ON storage.objects FOR SELECT USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload their own documents" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed Data
INSERT INTO public.settings (id, site_name, currency, pricing_mode) 
VALUES ('global', 'ErrandOwl Pakistan', 'PKR', 'hourly')
ON CONFLICT (id) DO NOTHING;
