-- Migration 007: Phase 3 Features
-- Implements Dynamic Bidding and Invoice Generation

-- 1. Create job_bids table
CREATE TABLE IF NOT EXISTS public.job_bids (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    tasker_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    proposed_amount DECIMAL(12,2) NOT NULL,
    proposal_text TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'withdrawn')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(booking_id, tasker_id)
);

-- Enable RLS on job_bids
ALTER TABLE public.job_bids ENABLE ROW LEVEL SECURITY;

-- RLS Policies for job_bids
DROP POLICY IF EXISTS "Taskers can view their own bids" ON public.job_bids;
CREATE POLICY "Taskers can view their own bids" 
    ON public.job_bids FOR SELECT 
    USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));

DROP POLICY IF EXISTS "Clients can view bids on their jobs" ON public.job_bids;
CREATE POLICY "Clients can view bids on their jobs" 
    ON public.job_bids FOR SELECT 
    USING (
      auth.uid() IN (
        SELECT p.auth_id 
        FROM public.profiles p
        JOIN public.bookings b ON b.client_id = p.id
        WHERE b.id = job_bids.booking_id
      )
    );

DROP POLICY IF EXISTS "Taskers can insert their own bids" ON public.job_bids;
CREATE POLICY "Taskers can insert their own bids" 
    ON public.job_bids FOR INSERT 
    WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));

DROP POLICY IF EXISTS "Taskers can update their own bids" ON public.job_bids;
CREATE POLICY "Taskers can update their own bids" 
    ON public.job_bids FOR UPDATE 
    USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = tasker_id));

DROP POLICY IF EXISTS "Clients can update bids on their jobs (to accept/reject)" ON public.job_bids;
CREATE POLICY "Clients can update bids on their jobs (to accept/reject)" 
    ON public.job_bids FOR UPDATE 
    USING (
      auth.uid() IN (
        SELECT p.auth_id 
        FROM public.profiles p
        JOIN public.bookings b ON b.client_id = p.id
        WHERE b.id = job_bids.booking_id
      )
    );

-- 2. Add invoice_url to payments
ALTER TABLE public.payments
  ADD COLUMN IF NOT EXISTS invoice_url TEXT;
