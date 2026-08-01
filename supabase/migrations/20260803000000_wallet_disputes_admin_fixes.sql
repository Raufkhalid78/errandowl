-- 1. Wallet & Payouts System

-- 1.1 Wallet balance on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS wallet_balance DECIMAL(12,2) DEFAULT 0;

-- 1.2 Wallet transaction ledger
CREATE TABLE public.wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    reason TEXT NOT NULL CHECK (reason IN ('refund', 'payout', 'referral_bonus', 'promo_credit', 'earning', 'adjustment')),
    description TEXT,
    related_booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    related_payout_id UUID,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Payout requests
CREATE TABLE public.payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    method TEXT,
    account_details JSONB DEFAULT '{}',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    admin_notes TEXT,
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

ALTER TABLE public.wallet_transactions
  ADD CONSTRAINT wallet_transactions_related_payout_id_fkey
  FOREIGN KEY (related_payout_id) REFERENCES public.payouts(id) ON DELETE SET NULL;

-- Wallet RLS
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own wallet transactions" ON public.wallet_transactions FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = profile_id));
CREATE POLICY "Admins manage wallet transactions" ON public.wallet_transactions FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Taskers view own payouts" ON public.payouts FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));
CREATE POLICY "Taskers create own payout requests" ON public.payouts FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id) AND status = 'pending');
CREATE POLICY "Admins manage all payouts" ON public.payouts FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- 2. Disputes System

CREATE TYPE dispute_resolution_status AS ENUM ('open', 'in_review', 'resolved_refunded', 'resolved_closed');

CREATE TABLE public.disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    raised_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    reason TEXT NOT NULL,
    status dispute_resolution_status DEFAULT 'open',
    admin_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_disputes_updated_at BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking parties can view their disputes" ON public.disputes FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id IN (
    SELECT client_id FROM public.bookings WHERE id = booking_id
    UNION
    SELECT tasker_id FROM public.bookings WHERE id = booking_id
  )) OR EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

CREATE POLICY "Booking parties can raise a dispute" ON public.disputes FOR INSERT
  WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = raised_by));

CREATE POLICY "Admins manage disputes" ON public.disputes FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));

-- 3. Promo Codes
ALTER TABLE public.promo_codes
  ADD COLUMN IF NOT EXISTS discount_type TEXT DEFAULT 'fixed' CHECK (discount_type IN ('percentage', 'fixed')),
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;

-- Migrate existing discount_amount data into the new value column, then rename
ALTER TABLE public.promo_codes RENAME COLUMN discount_amount TO discount_value;

-- 4. Categories
ALTER TABLE public.categories
  ADD COLUMN IF NOT EXISTS description_en TEXT,
  ADD COLUMN IF NOT EXISTS description_ur TEXT;

-- 5. Services
ALTER TABLE public.services ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
