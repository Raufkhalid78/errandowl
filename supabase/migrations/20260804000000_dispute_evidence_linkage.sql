-- Link evidence to the dispute it belongs to (was only linked to booking_id before)
ALTER TABLE public.dispute_evidence
  ADD COLUMN IF NOT EXISTS dispute_id UUID REFERENCES public.disputes(id) ON DELETE CASCADE;

-- Admins currently have no way to read evidence via RLS — add it
CREATE POLICY "Admins can view all dispute evidence" ON public.dispute_evidence FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));
