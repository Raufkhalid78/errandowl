-- Tasker Payouts
CREATE TABLE IF NOT EXISTS public.payouts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, paid, rejected
    payment_method VARCHAR(50) NOT NULL, -- jazzcash, easypaisa, bank_transfer
    account_details TEXT NOT NULL,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Taskers can view own payouts" ON public.payouts FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));
CREATE POLICY "Taskers can insert own payouts" ON public.payouts FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));
CREATE POLICY "Admins can view all payouts" ON public.payouts FOR SELECT USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'));
CREATE POLICY "Admins can update payouts" ON public.payouts FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'));

-- User Suspension (Task 2)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'active'; -- active, suspended, banned

DROP POLICY IF EXISTS "Admins can update profiles" ON public.profiles;
CREATE POLICY "Admins can update profiles" ON public.profiles FOR UPDATE USING (EXISTS (SELECT 1 FROM admins WHERE email = auth.jwt() ->> 'email'));
