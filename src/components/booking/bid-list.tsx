"use client"

import { useState, useEffect } from "react"
import { useRouter } from "@/i18n/routing"
import { createClient } from "@/lib/supabase/client"
import { createNotification } from "@/lib/notifications"
import { JobBid } from "@/types"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Loader2 } from "lucide-react"

export function BidList({ bookingId }: { bookingId: string }) {
  const [bids, setBids] = useState<JobBid[]>([])
  const [loading, setLoading] = useState(true)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const supabaseClient = createClient()
    const fetchBids = async () => {
      const { data } = await supabaseClient
        .from("job_bids")
        .select("*, profiles!tasker_id(name, avatar)")
        .eq("booking_id", bookingId)
        .order("amount", { ascending: true })

      if (data) setBids(data as any)
      setLoading(false)
    }
    fetchBids()
  }, [bookingId])

  const handleAcceptBid = async (bidId: string, taskerId: string, amount: number) => {
    setAcceptingId(bidId)
    
    // 1. Update Bid Status
    await supabase.from("job_bids").update({ status: "accepted" }).eq("id", bidId)
    // 2. Reject other bids
    await supabase.from("job_bids").update({ status: "rejected" }).eq("booking_id", bookingId).neq("id", bidId)
    // 3. Assign tasker to booking and update total cost
    await supabase.from("bookings").update({
      tasker_id: taskerId,
      status: "confirmed",
      total_amount: amount
    }).eq("id", bookingId)

    // 4. Notify accepted tasker
    await createNotification({
      userId: taskerId,
      type: "booking_update",
      title: "Bid Accepted!",
      body: "Your bid has been accepted. The job is now confirmed.",
      link: `/dashboard/jobs/${bookingId}`
    })

    // 5. Notify rejected taskers
    const rejectedBids = bids.filter(b => b.id !== bidId)
    for (const rejected of rejectedBids) {
      await createNotification({
        userId: rejected.tasker_id,
        type: "booking_update",
        title: "Bid Rejected",
        body: "Your bid for a job was not accepted.",
        link: `/dashboard/jobs`
      })
    }

    router.refresh()
  }

  if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-owl-violet h-6 w-6" /></div>
  
  if (bids.length === 0) {
    return <div className="p-6 text-center text-sm text-muted-foreground border border-dashed rounded-xl bg-muted/10">No bids have been submitted for this job yet.</div>
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Tasker Bids ({bids.length})</h3>
      <div className="grid gap-4">
        {bids.map((bid) => (
          <div key={bid.id} className="p-4 rounded-xl border border-border/50 bg-card/50 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
            <div className="flex items-start sm:items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={bid.profiles?.avatar} />
                <AvatarFallback>{bid.profiles?.name?.[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{bid.profiles?.name}</p>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5 max-w-sm">{bid.cover_letter}</p>
              </div>
            </div>
            
            <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between gap-3 sm:gap-1">
              <div className="text-lg font-bold text-owl-violet">Rs {bid.amount?.toLocaleString()}</div>
              <Button 
                size="sm" 
                onClick={() => handleAcceptBid(bid.id, bid.tasker_id, bid.amount)}
                disabled={acceptingId !== null || bid.status !== "pending"}
                className="bg-owl-emerald hover:bg-owl-emerald/90 text-white"
              >
                {acceptingId === bid.id ? <Loader2 className="h-4 w-4 animate-spin" /> : "Accept Offer"}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
