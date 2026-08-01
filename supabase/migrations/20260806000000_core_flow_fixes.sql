-- 1. Booking creation missing columns
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS estimated_hours DECIMAL(6,2),
  ADD COLUMN IF NOT EXISTS pricing_mode TEXT,
  ADD COLUMN IF NOT EXISTS recurrence_pattern TEXT;

-- 2. Chat messaging missing attachment column
ALTER TABLE public.messages 
  ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- 5. Availability calendar unique constraint
ALTER TABLE public.tasker_availability
  ADD CONSTRAINT tasker_availability_tasker_day_unique UNIQUE (tasker_id, day_of_week);
