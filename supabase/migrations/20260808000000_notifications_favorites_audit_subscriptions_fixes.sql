-- 1. Create `favorite_taskers` table
CREATE TABLE IF NOT EXISTS public.favorite_taskers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (client_id, tasker_id)
);

ALTER TABLE public.favorite_taskers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own favorites" ON public.favorite_taskers FOR ALL
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = client_id));


-- 2. Add INSERT policy for `admin_audit_logs`
CREATE POLICY "Admins can write audit logs" ON public.admin_audit_logs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));


-- 3. Create `subscriptions` table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    plan_type TEXT NOT NULL DEFAULT 'pro',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
    current_period_end TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Taskers view own subscription" ON public.subscriptions FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));

CREATE POLICY "Taskers can subscribe" ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));

CREATE POLICY "Admins manage all subscriptions" ON public.subscriptions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));
