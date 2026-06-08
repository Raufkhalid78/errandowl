"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Wallet } from "lucide-react"

export function WalletBalanceCard({ balance }: { balance: number }) {
  return (
    <Card className="glass overflow-hidden relative">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-owl-violet/10 rounded-full blur-2xl pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-owl-violet" />
          Available Balance
        </CardTitle>
        <CardDescription>Use your balance to pay for tasks.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-bold text-foreground">
          Rs {balance.toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}
