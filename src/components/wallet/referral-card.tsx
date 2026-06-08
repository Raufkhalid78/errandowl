"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, Copy, Check, Loader2 } from "lucide-react"

export function ReferralCard({ profileId, referralCode, totalUses }: { profileId: string, referralCode?: string, totalUses: number }) {
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleGenerate = async () => {
    setLoading(true)
    const code = Math.random().toString(36).substring(2, 8).toUpperCase()
    
    const { error } = await supabase.from("referral_codes").insert({
      profile_id: profileId,
      code
    })

    if (error) {
      alert("Failed to generate code. Try again.")
    } else {
      router.refresh()
    }
    setLoading(false)
  }

  const handleCopy = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <Card className="glass relative overflow-hidden">
      <div className="absolute -right-6 -top-6 w-32 h-32 bg-owl-emerald/10 rounded-full blur-2xl pointer-events-none" />
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Gift className="h-5 w-5 text-owl-emerald" />
          Refer & Earn
        </CardTitle>
        <CardDescription>Give a friend Rs 500, and you get Rs 500 when they book their first task.</CardDescription>
      </CardHeader>
      <CardContent>
        {referralCode ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase mb-1">Your Code</p>
              <div className="flex items-center gap-2">
                <div className="bg-muted px-4 py-2 rounded-lg font-mono text-lg tracking-widest font-bold border border-border/50 select-all">
                  {referralCode}
                </div>
                <Button variant="outline" size="icon" onClick={handleCopy}>
                  {copied ? <Check className="h-4 w-4 text-owl-emerald" /> : <Copy className="h-4 w-4 text-muted-foreground" />}
                </Button>
              </div>
            </div>
            
            <div className="pt-4 border-t border-border/50">
              <p className="text-sm font-medium">Total Uses: <span className="text-owl-violet">{totalUses}</span></p>
              <p className="text-xs text-muted-foreground">Total earned: Rs {(totalUses * 500).toLocaleString()}</p>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center space-y-4">
            <p className="text-sm text-muted-foreground">You don&apos;t have a referral code yet.</p>
            <Button onClick={handleGenerate} disabled={loading} className="w-full bg-owl-emerald hover:bg-owl-emerald/90 text-white">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate My Code
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
