import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowDownLeft, ArrowUpRight, Clock, Info } from "lucide-react"

interface Transaction {
  id: string
  amount: number
  type: string
  reason: string
  description: string | null
  created_at: string
}

export function WalletTransactionsList({ transactions }: { transactions: Transaction[] }) {
  if (!transactions || transactions.length === 0) {
    return (
      <Card className="glass mt-6">
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>View your past wallet activity</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Info className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm font-medium">No transactions yet</p>
          <p className="text-xs max-w-xs mt-1">Your wallet activity will appear here.</p>
        </CardContent>
      </Card>
    )
  }

  const getReasonLabel = (reason: string) => {
    switch (reason) {
      case 'refund': return 'Refund'
      case 'payout': return 'Payout Withdrawal'
      case 'referral_bonus': return 'Referral Bonus'
      case 'promo_credit': return 'Promo Credit'
      case 'earning': return 'Job Earning'
      case 'adjustment': return 'Admin Adjustment'
      default: return reason.replace('_', ' ')
    }
  }

  return (
    <Card className="glass mt-6">
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>View your past wallet activity</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-muted/10">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${tx.type === 'credit' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                  {tx.type === 'credit' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <p className="font-semibold">{getReasonLabel(tx.reason)}</p>
                  {tx.description && <p className="text-xs text-muted-foreground mt-0.5">{tx.description}</p>}
                  <p className="text-[10px] text-muted-foreground flex items-center gap-1 mt-1">
                    <Clock className="h-3 w-3" />
                    {new Date(tx.created_at).toLocaleDateString("en-PK", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
                    })}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`font-bold ${tx.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {tx.type === 'credit' ? '+' : '-'} Rs {tx.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
