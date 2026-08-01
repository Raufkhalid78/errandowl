CREATE TABLE public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('booking_update', 'new_message', 'new_review', 'system', 'alert')),
    title TEXT NOT NULL,
    body TEXT,
    link TEXT,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own notifications" ON public.notifications FOR SELECT
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = user_id));
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE
  USING (auth.uid() IN (SELECT auth_id FROM public.profiles WHERE id = user_id));
CREATE POLICY "Admins manage all notifications" ON public.notifications FOR ALL
  USING (EXISTS (SELECT 1 FROM public.admins WHERE email = auth.jwt()->>'email'));
