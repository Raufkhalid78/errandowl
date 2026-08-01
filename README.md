# ErrandOwl — On-Demand Services & Errand Platform

ErrandOwl is an on-demand service marketplace designed for connecting clients with verified local taskers for home repairs, cleaning, deliveries, and everyday errands.

---

## 🚀 Key Features & Architecture

- **Framework**: Next.js (App Router, React 19, TypeScript, Tailwind CSS)
- **Database & Auth**: Supabase (PostgreSQL, Row Level Security, Storage, Auth)
- **Payments**: PayFast Integration with server-to-server IPN signature verification, amount validation, idempotency, and audit logging
- **Internationalization**: `next-intl` (English & Urdu support)
- **Real-Time Push Notifications**: Firebase Cloud Messaging (FCM)
- **Security & Privacy**:
  - `public_profiles` view for safe user directory browsing without exposing PII (phone, email, CNIC, payout information).
  - Private `documents` storage bucket restricted to document owners & admins.
  - Server-side admin impersonation with audit logging in `admin_audit_log`.

---

## 🛠️ Environment Setup

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Populate the required environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`, `PAYFAST_HOST`
   - `GEMINI_API_KEY`
   - Firebase credentials (`NEXT_PUBLIC_FIREBASE_*`)

3. Install dependencies and start the dev server:
   ```bash
   npm install
   npm run dev
   ```

---

## 🛡️ Database Migrations

Supabase migrations are located in `supabase/migrations/`:
- `001_full_schema.sql` — Core database tables and initial RLS policies.
- `013_payment_webhook_logs.sql` — IPN audit log schema.
- `014_lock_down_documents_bucket.sql` — Private storage security policies.
- `015_restrict_profiles.sql` — Restricted `profiles` table access & `public_profiles` view.
- `016_admin_audit_log.sql` — Admin RLS policies and audit logs.
- `017_storage_policy_auth_id_fix.sql` — Fixes `auth_id` references in storage RLS policies.
