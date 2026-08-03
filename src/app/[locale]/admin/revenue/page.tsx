import { createClient } from "@/lib/supabase/server";
import { RevenueDashboardClient } from "./revenue-client";

export default async function RevenueDashboardPage() {
  const supabase = await createClient();

  // Fetch total payments
  const { data: payments } = await supabase
    .from("payments")
    .select("amount, status");

  // Fetch service fee from settings
  const { data: settings } = await supabase
    .from("settings")
    .select("platform_fee_percent")
    .eq("id", "global")
    .single();

  const feePercent = settings?.platform_fee_percent || 10;
  
  const totalVolume = payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;
  const totalFees = (totalVolume * feePercent) / 100;
  const pendingVolume = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;

  const stats = {
    totalVolume,
    totalFees,
    pendingVolume,
    completedCount: payments?.filter(p => p.status === 'completed').length || 0,
    feePercent
  };

  // Fetch real recent payments
  const { data: paymentsList } = await supabase
    .from("payments")
    .select("id, amount, status, method, created_at, booking_id")
    .order("created_at", { ascending: false })
    .limit(5);
  
  const recentPayments = paymentsList || [];

  // Fetch payouts with profiles info
  const { data: payoutsList } = await supabase
    .from("payouts")
    .select(`
      id,
      tasker_id,
      amount,
      status,
      method,
      account_details,
      admin_notes,
      requested_at,
      profiles (
        name,
        email
      )
    `)
    .order("requested_at", { ascending: false });

  const payouts = payoutsList || [];

  return (
    <RevenueDashboardClient 
      initialStats={stats}
      initialPayouts={payouts}
      initialRecentPayments={recentPayments}
    />
  );
}
