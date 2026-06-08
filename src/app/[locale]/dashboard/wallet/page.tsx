import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card"
import { ReferralCard } from "@/components/wallet/referral-card"
import { PayoutRequestsCard } from "@/components/wallet/payout-requests-card"

export default async function WalletPage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, wallet_balance, role")
    .eq("auth_id", user.id)
    .single()

  if (!profile) redirect("/dashboard")

  const { data: referral } = await supabase
    .from("referral_codes")
    .select("*")
    .eq("profile_id", profile.id)
    .single()

  const isTasker = profile.role === "tasker" || profile.role === "admin"

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Wallet & Rewards</h2>
        <p className="text-muted-foreground">
          {isTasker
            ? "Manage your earnings, request payouts, and track your referral bonuses."
            : "Manage your balance and earn credits by referring friends."}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <WalletBalanceCard balance={profile.wallet_balance || 0} />
        <ReferralCard profileId={profile.id} referralCode={referral?.code} totalUses={referral?.total_uses || 0} />
      </div>

      {isTasker && (
        <div className="pt-4 border-t border-border/50">
          <PayoutRequestsCard profileId={profile.id} initialBalance={profile.wallet_balance || 0} />
        </div>
      )}
    </div>
  )
}
