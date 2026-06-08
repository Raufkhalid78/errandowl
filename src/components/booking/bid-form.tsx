"use client"

import { useState } from "react"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

export function BidForm({ bookingId, taskerId }: { bookingId: string, taskerId: string }) {
  const [amount, setAmount] = useState<string>("")
  const [text, setText] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || isNaN(Number(amount))) return alert("Please enter a valid amount")
    
    setLoading(true)
    const { error } = await supabase.from("job_bids").insert({
      booking_id: bookingId,
      tasker_id: taskerId,
      proposed_amount: Number(amount),
      proposal_text: text,
      status: "pending"
    })

    if (error) {
      alert(error.message)
      setLoading(false)
    } else {
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card glass">
      <h3 className="font-semibold text-lg">Submit your Bid</h3>
      <p className="text-sm text-muted-foreground mb-4">Propose your price and tell the client why you&apos;re the best fit for this job.</p>

      <div className="space-y-2">
        <Label htmlFor="amount">Proposed Amount (Rs)</Label>
        <Input 
          id="amount" 
          type="number" 
          required 
          value={amount} 
          onChange={(e) => setAmount(e.target.value)} 
          placeholder="e.g. 2500" 
          className="h-11 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text">Proposal Message</Label>
        <textarea 
          id="text" 
          required 
          value={text} 
          onChange={(e) => setText(e.target.value)} 
          placeholder="Hi! I have 3 years of experience doing exactly this..."
          className="w-full min-h-[120px] p-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-owl-violet/20 outline-none"
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-11 bg-owl-violet hover:bg-owl-violet-dark text-white">
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Submit Bid
      </Button>
    </form>
  )
}
