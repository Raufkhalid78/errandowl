-- Add cnic_back_url to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS cnic_back_url TEXT;

-- Create documents storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for 'documents' bucket
-- Allow authenticated users to upload their own documents
DROP POLICY IF EXISTS "Users can upload their own documents" ON storage.objects;
CREATE POLICY "Users can upload their own documents" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow authenticated users to update their own documents
DROP POLICY IF EXISTS "Users can update their own documents" ON storage.objects;
CREATE POLICY "Users can update their own documents" 
ON storage.objects FOR UPDATE 
TO authenticated 
USING (bucket_id = 'documents' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own documents (and admins to view all)
DROP POLICY IF EXISTS "Users can view their own documents" ON storage.objects;
CREATE POLICY "Users can view their own documents" 
ON storage.objects FOR SELECT 
TO authenticated 
USING (bucket_id = 'documents' AND (auth.uid()::text = (storage.foldername(name))[1] OR auth.jwt() ->> 'role' = 'admin'));
