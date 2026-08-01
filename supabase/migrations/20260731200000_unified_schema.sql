DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO anon;
GRANT ALL ON SCHEMA public TO authenticated;
GRANT ALL ON SCHEMA public TO service_role;

-- Unified Schema Migration for ErrandOwl
-- Consolidates all tables, types, triggers, views, and RLS policies

-- ==========================================
-- 1. EXTENSIONS & CUSTOM TYPES
-- ==========================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Drop types if they exist to allow clean recreation
DROP TYPE IF EXISTS booking_status CASCADE;
DROP TYPE IF EXISTS dispute_status CASCADE;
DROP TYPE IF EXISTS role_type CASCADE;
DROP TYPE IF EXISTS cnic_status_type CASCADE;

CREATE TYPE booking_status AS ENUM ('pending', 'accepted', 'confirmed', 'in_progress', 'completed', 'cancelled');
CREATE TYPE dispute_status AS ENUM ('open', 'under_review', 'resolved', 'closed');
CREATE TYPE role_type AS ENUM ('client', 'tasker', 'admin');
CREATE TYPE cnic_status_type AS ENUM ('pending', 'approved', 'rejected');

-- ==========================================
-- 2. CORE TABLES
-- ==========================================

-- 2.1 Settings
CREATE TABLE public.settings (
    id TEXT PRIMARY KEY,
    platform_fee_percent DECIMAL(5,2) DEFAULT 10.00,
    min_hourly_rate DECIMAL(10,2) DEFAULT 300.00,
    auto_approve_taskers BOOLEAN DEFAULT FALSE,
    support_email TEXT,
    contact_phone TEXT,
    office_address TEXT,
    pricing_mode TEXT DEFAULT 'hourly' CHECK (pricing_mode IN ('hourly', 'fixed')),
    currency TEXT DEFAULT 'PKR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 Admins (For RLS and Dashboard access)
CREATE TABLE public.admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 Profiles (Base User Data)
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_id UUID UNIQUE NOT NULL,
    name TEXT,
    email TEXT UNIQUE,
    phone TEXT,
    location TEXT,
    city TEXT,
    role role_type DEFAULT 'client',
    bio TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    cnic_url TEXT,
    cnic_back_url TEXT,
    certificate_url TEXT,
    cnic_status cnic_status_type DEFAULT 'pending',
    avatar TEXT,
    payout_details JSONB DEFAULT '{}',
    notify_email BOOLEAN DEFAULT TRUE,
    notify_push BOOLEAN DEFAULT TRUE,
    notify_marketing BOOLEAN DEFAULT FALSE,
    fcm_token TEXT,
    status TEXT DEFAULT 'active',
    registered_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 Tasker Profiles
CREATE TABLE public.tasker_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    hourly_rate DECIMAL(12,2) DEFAULT 0,
    fixed_rate DECIMAL(12,2) DEFAULT 0,
    rating_avg DECIMAL(3,2) DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    skills TEXT[] DEFAULT '{}',
    categories TEXT[] DEFAULT '{}',
    city TEXT,
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),

    portfolio_urls TEXT[] DEFAULT '{}',
    elite BOOLEAN DEFAULT FALSE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 3. APPLICATION TABLES
-- ==========================================

-- 3.1 Categories
CREATE TABLE public.categories (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 Services
CREATE TABLE public.services (
    id TEXT PRIMARY KEY,
    category_id TEXT REFERENCES public.categories(id) ON DELETE CASCADE,
    name_en TEXT NOT NULL,
    name_ur TEXT NOT NULL,
    base_price DECIMAL(10,2),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 Bookings
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    service_id TEXT REFERENCES public.services(id) ON DELETE SET NULL,
    status booking_status DEFAULT 'pending',
    scheduled_at TIMESTAMPTZ NOT NULL,
    completed_at TIMESTAMPTZ,
    total_amount DECIMAL(12,2),
    address TEXT,
    lat DECIMAL(9,6),
    lng DECIMAL(9,6),
    service_name TEXT,
    client_name TEXT,
    tasker_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.4 Payments
CREATE TABLE public.payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    amount DECIMAL(12,2) NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
    method TEXT,
    transaction_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 Reviews
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    reply TEXT,
    communication_rating INTEGER,
    quality_rating INTEGER,
    reliability_rating INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 4. PHASE 2-5 EXTENSIONS
-- ==========================================

-- 4.1 Tasker Availability
CREATE TABLE public.tasker_availability (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week TEXT CHECK (day_of_week IN ('mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun')),
    start_time TIME DEFAULT '09:00',
    end_time TIME DEFAULT '18:00',
    is_blocked BOOLEAN DEFAULT FALSE,
    date_override DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.2 Job Bids
CREATE TABLE public.job_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    cover_letter TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.3 Dispute Evidence
CREATE TABLE public.dispute_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    submitted_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    evidence_text TEXT NOT NULL,
    image_urls TEXT[],
    status dispute_status DEFAULT 'open',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.4 SOS Tracking
CREATE TABLE public.sos_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    event_type TEXT DEFAULT 'panic_button',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'false_alarm')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.sos_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    relation TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.5 Live Tracking Sessions
CREATE TABLE public.tracking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    current_lat DECIMAL(9,6) NOT NULL,
    current_lng DECIMAL(9,6) NOT NULL,
    last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- 4.6 Referrals and Promo Codes
CREATE TABLE public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    code TEXT UNIQUE NOT NULL,
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.promo_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    max_uses INTEGER,
    current_uses INTEGER DEFAULT 0,
    valid_until TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.7 Messages (Chat)
CREATE TABLE public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.8 Portfolio Items
CREATE TABLE public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    title TEXT,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.9 Forum (Community)
CREATE TABLE public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4.10 Admin and Webhook Logs
CREATE TABLE public.admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payment_webhook_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==========================================
-- 5. VIEWS
-- ==========================================

-- public_profiles: Safely exposes limited profile fields to the public.
-- SECURITY DEFINER allows querying this without triggering RLS on profiles, avoiding the empty tasker search issue.
CREATE OR REPLACE VIEW public.public_profiles 
WITH (security_invoker = false) AS
SELECT
  p.id,
  p.auth_id,
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

-- ==========================================
-- 6. TRIGGERS AND FUNCTIONS
-- ==========================================

-- Auto-update updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasker_profiles_updated_at BEFORE UPDATE ON public.tasker_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON public.settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_forum_posts_updated_at BEFORE UPDATE ON public.forum_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update tasker rating average on review insertion
CREATE OR REPLACE FUNCTION update_tasker_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.tasker_profiles
  SET 
    rating_avg = (
      SELECT ROUND(AVG(rating)::numeric, 2)
      FROM public.reviews
      WHERE tasker_id = NEW.tasker_id
    ),
    review_count = (
      SELECT COUNT(*)
      FROM public.reviews
      WHERE tasker_id = NEW.tasker_id
    )
  WHERE profile_id = NEW.tasker_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_review_created AFTER INSERT OR UPDATE ON public.reviews FOR EACH ROW EXECUTE FUNCTION update_tasker_rating();

-- Handle new user signup creation
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (auth_id, email, name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)), COALESCE((new.raw_user_meta_data->>'role')::public.role_type, 'client'));
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger on auth.users (which requires postgres role usually, but works in superuser sql editor)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==========================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ==========================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasker_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasker_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sos_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_webhook_logs ENABLE ROW LEVEL SECURITY;

-- 7.1 Profiles
CREATE POLICY "Users can view own full profile" ON public.profiles FOR SELECT USING (auth.uid() = auth_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = auth_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = auth_id);
CREATE POLICY "Admins can manage all profiles" ON public.profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- 7.2 Admins
CREATE POLICY "Admins can view admins" ON public.admins FOR SELECT USING (email = auth.jwt()->>'email');

-- 7.3 Tasker Profiles
CREATE POLICY "Taskers can insert own profile" ON public.tasker_profiles FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));
CREATE POLICY "Taskers can update own profile" ON public.tasker_profiles FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));
CREATE POLICY "Public can view active tasker profiles" ON public.tasker_profiles FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage tasker profiles" ON public.tasker_profiles FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- 7.4 Public read-only tables
CREATE POLICY "Public can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Public can view services" ON public.services FOR SELECT USING (true);
CREATE POLICY "Public can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Public can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Public can view forum comments" ON public.forum_comments FOR SELECT USING (true);
CREATE POLICY "Public can view portfolio items" ON public.portfolio_items FOR SELECT USING (true);

-- 7.5 Bookings (Clients and Taskers can see their own, Admins see all)
CREATE POLICY "Users can view own bookings" ON public.bookings FOR SELECT USING (
  auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id OR id = tasker_id) 
  OR EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email')
);
CREATE POLICY "Clients can insert bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id));
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id OR id = tasker_id));

-- 7.6 General catch-all for admins on remaining tables
CREATE POLICY "Admins manage everything" ON public.settings FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admins manage categories" ON public.categories FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admins manage services" ON public.services FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));
CREATE POLICY "Admins manage payments" ON public.payments FOR ALL USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- Allow messages between users
CREATE POLICY "Users can view their messages" ON public.messages FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = sender_id OR id = receiver_id));
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = sender_id));

-- Add insert policies for community and reviews so users can interact
CREATE POLICY "Users can create forum posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = author_id));
CREATE POLICY "Users can create forum comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = author_id));
CREATE POLICY "Clients can review taskers" ON public.reviews FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = reviewer_id));

-- Allow tracking session upserts
CREATE POLICY "Taskers can manage tracking" ON public.tracking_sessions FOR ALL USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));
CREATE POLICY "Clients can view tracking" ON public.tracking_sessions FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id IN (SELECT client_id FROM public.bookings WHERE id = booking_id)));

-- Allow taskers to manage their own portfolio and availability
CREATE POLICY "Taskers can manage portfolio" ON public.portfolio_items FOR ALL USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));
CREATE POLICY "Taskers can manage availability" ON public.tasker_availability FOR ALL USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));
CREATE POLICY "Clients can view availability" ON public.tasker_availability FOR SELECT USING (true);

-- Allow bidding
CREATE POLICY "Taskers can bid" ON public.job_bids FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));
CREATE POLICY "Users can view bids" ON public.job_bids FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id OR id IN (SELECT client_id FROM public.bookings WHERE id = booking_id)));

-- Allow dispute evidence
CREATE POLICY "Users can submit evidence" ON public.dispute_evidence FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = submitted_by));
CREATE POLICY "Users can view evidence" ON public.dispute_evidence FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id IN (SELECT client_id FROM public.bookings WHERE id = booking_id) OR id IN (SELECT tasker_id FROM public.bookings WHERE id = booking_id)));

-- Notify PostgREST to reload schema
NOTIFY pgrst, 'reload schema';

-- Restore Supabase Grants
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON TABLES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, anon, authenticated, service_role;
