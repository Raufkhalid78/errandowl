import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { BidForm } from "@/components/booking/bid-form"
import { MapPin, Calendar, Clock, ArrowLeft } from "lucide-react"
import { Link } from "@/i18n/routing"

export default async function JobDetailsPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id } = await params
  const supabase = await createClient()


  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("id, is_verified, cnic_status").eq("auth_id", user.id).single()
  const profileId = profile?.id
  const isVerified = profile?.is_verified || profile?.cnic_status === 'approved'

  // Fetch job
  const { data: job } = await supabase
    .from("bookings")
    .select("*, profiles!client_id(name, avatar_url)")
    .eq("id", id)
    .single()

  if (!job) redirect("/dashboard/jobs")

  // Fetch existing bid by this tasker
  const { data: existingBid } = await supabase
    .from("job_bids")
    .select("*")
    .eq("booking_id", id)
    .eq("tasker_id", profileId)
    .single()

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/jobs" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Jobs
      </Link>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">{job.service_name || "Open Task"}</h2>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl border border-border/50">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-owl-violet" />
          {job.scheduled_at ? new Date(job.scheduled_at).toLocaleDateString() : "TBD"}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-owl-violet" />
          {job.scheduled_at ? new Date(job.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"} ({job.estimated_hours} hrs est.)
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-owl-violet" />
          {job.address}
        </div>
      </div>

      <div className="pt-4">
        {existingBid ? (
          <div className="p-6 rounded-2xl border border-owl-emerald/30 bg-owl-emerald/5 text-center">
            <div className="text-2xl mb-2">✅</div>
            <h3 className="font-semibold text-lg text-owl-emerald">Bid Submitted</h3>
            <p className="text-sm text-muted-foreground mt-1">You offered Rs {existingBid.proposed_amount.toLocaleString()}</p>
            <p className="text-sm mt-3 border-t pt-3">{existingBid.proposal_text}</p>
          </div>
        ) : !isVerified ? (
          <div className="p-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/5 text-center space-y-3">
            <div className="text-2xl">⏳</div>
            <h3 className="font-semibold text-lg text-yellow-600 dark:text-yellow-400">Verification Required</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Your identity verification is currently {profile?.cnic_status === 'pending' ? 'pending admin review' : 'required'}. 
              You will be able to place bids on jobs as soon as your account is approved.
            </p>
          </div>
        ) : (
          <BidForm bookingId={job.id} taskerId={profileId || ""} />
        )}
      </div>
    </div>
  )
}
