ALTER TABLE public.wallet_transactions DROP CONSTRAINT IF EXISTS wallet_transactions_reason_check;
ALTER TABLE public.wallet_transactions ADD CONSTRAINT wallet_transactions_reason_check
  CHECK (reason IN ('refund', 'payout', 'referral_bonus', 'promo_credit', 'earning', 'adjustment', 'top_up'));
