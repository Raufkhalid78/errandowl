-- Migration 009: Phase 5 Advanced Features
-- Implements Real-Time Tracking, Disputes, Portfolios, Subscriptions, and Push Notifications

-- 1. Tracking Sessions (For Live Map)
CREATE TABLE IF NOT EXISTS public.tracking_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE UNIQUE,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    lat DECIMAL(9,6) NOT NULL,
    lng DECIMAL(9,6) NOT NULL,
    heading DECIMAL(5,2),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Realtime for tracking_sessions
ALTER PUBLICATION supabase_realtime ADD TABLE public.tracking_sessions;

-- 2. Disputes System
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    raised_by UUID REFERENCES public.profiles(id),
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_review', 'resolved_refunded', 'resolved_closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.dispute_evidence (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES public.profiles(id),
    file_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Portfolios & Badges
CREATE TABLE IF NOT EXISTS public.portfolio_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add badges array to tasker_profiles
ALTER TABLE public.tasker_profiles
  ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- 4. Subscriptions (Premium Tiers)
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    plan_type TEXT CHECK (plan_type IN ('plus', 'pro')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'past_due', 'canceled')),
    stripe_subscription_id TEXT UNIQUE,
    stripe_customer_id TEXT,
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Push Notifications
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- RLS Policies

ALTER TABLE public.tracking_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Tracking: Participants can view, tasker can update
CREATE POLICY "Participants can view tracking" ON public.tracking_sessions FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id IN (SELECT client_id FROM public.bookings WHERE id = booking_id) OR id = tasker_id)
);
CREATE POLICY "Taskers can update tracking" ON public.tracking_sessions FOR ALL USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id)
);

-- Disputes: Participants can view and create
CREATE POLICY "Participants can view disputes" ON public.disputes FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id IN (SELECT client_id FROM public.bookings WHERE id = booking_id) OR id IN (SELECT tasker_id FROM public.bookings WHERE id = booking_id))
    OR (SELECT role FROM public.profiles WHERE auth_id = auth.uid()) = 'admin'
);
CREATE POLICY "Participants can raise disputes" ON public.disputes FOR INSERT WITH CHECK (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = raised_by)
);
CREATE POLICY "Admins can update disputes" ON public.disputes FOR UPDATE USING (
    (SELECT role FROM public.profiles WHERE auth_id = auth.uid()) = 'admin'
);

-- Portfolio: Public view, Tasker manage
CREATE POLICY "Portfolios are public" ON public.portfolio_items FOR SELECT USING (true);
CREATE POLICY "Taskers can manage portfolios" ON public.portfolio_items FOR ALL USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id)
);

-- Subscriptions: User view, System manage
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions FOR SELECT USING (
    auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id)
);
-- Write permissions usually handled via Service Role in Webhooks

-- Storage setup for portfolios and dispute evidence
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolios', 'portfolios', true) ON CONFLICT (id) DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('disputes', 'disputes', false) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Portfolios Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'portfolios');
CREATE POLICY "Taskers can upload portfolios" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'portfolios' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Dispute evidence viewable by participants" ON storage.objects FOR SELECT USING (bucket_id = 'disputes');
CREATE POLICY "Users can upload dispute evidence" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'disputes' AND auth.uid()::text = (storage.foldername(name))[1]);
