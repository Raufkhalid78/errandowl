-- Seed data for Taskers

-- Insert profiles
INSERT INTO profiles (id, role, name, email, city, is_verified, avatar_url, bio, payout_method)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'tasker', 'Ali Khan', 'ali@example.com', 'Lahore', true, null, 'Expert in home repairs and furniture assembly with 5 years of experience.', 'bank_transfer'),
  ('00000000-0000-0000-0000-000000000002', 'tasker', 'Fatima Zahra', 'fatima@example.com', 'Karachi', true, null, 'Professional cleaner specializing in deep cleaning and move-in/move-out services.', 'easypaisa'),
  ('00000000-0000-0000-0000-000000000003', 'tasker', 'Ahmed Ali', 'ahmed@example.com', 'Islamabad', true, null, 'Reliable and fast delivery rider. I also help with packing and moving.', 'jazzcash')
ON CONFLICT (id) DO NOTHING;

-- Insert tasker profiles
INSERT INTO tasker_profiles (id, profile_id, hourly_rate, fixed_rate, skills, categories, availability, completed_tasks, rating_avg, review_count, elite)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000001', 1500, 5000, ARRAY['Furniture Assembly', 'Plumbing', 'Electrical'], ARRAY['cat-1', 'cat-5', 'cat-6'], '{"mon": true, "tue": true, "wed": true, "thu": true, "fri": true, "sat": false, "sun": false}'::jsonb, 42, 4.8, 25, true),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000002', 1200, 3500, ARRAY['Deep Cleaning', 'Organization', 'Laundry'], ARRAY['cat-2'], '{"mon": false, "tue": true, "wed": true, "thu": true, "fri": true, "sat": true, "sun": false}'::jsonb, 15, 4.9, 12, false),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000003', 1000, 2500, ARRAY['Delivery', 'Packing', 'Heavy Lifting'], ARRAY['cat-3', 'cat-9', 'cat-12'], '{"mon": true, "tue": true, "wed": true, "thu": true, "fri": true, "sat": true, "sun": true}'::jsonb, 89, 4.7, 45, true)
ON CONFLICT (id) DO NOTHING;
