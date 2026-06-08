-- Migration 008: Phase 4 Features
-- Implements Community Forums, Wallet, and Referral System

-- 1. Community Forums
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    likes_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE,
    author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Forums
ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view forum posts" ON public.forum_posts FOR SELECT USING (true);
CREATE POLICY "Anyone can view forum comments" ON public.forum_comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create posts" ON public.forum_posts FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = author_id));
CREATE POLICY "Authenticated users can create comments" ON public.forum_comments FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = author_id));

-- 2. Wallet & Referrals
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0.00;

CREATE TABLE IF NOT EXISTS public.referral_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
    code TEXT NOT NULL UNIQUE,
    total_uses INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for Referrals
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view referral codes" ON public.referral_codes FOR SELECT USING (true);
CREATE POLICY "Users can create their own referral code" ON public.referral_codes FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));
