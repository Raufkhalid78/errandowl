import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { MapPin, Calendar, Clock, ArrowLeft, Download } from "lucide-react"
import { Link } from "@/i18n/routing"
import { BidList } from "@/components/booking/bid-list"
import { DisputeButton } from "@/components/booking/dispute-button"
import { SosButton } from "@/components/booking/sos-button"
import { LiveTrackingMap } from "@/components/tracking/live-tracking-map"
import { TaskerLocationEmitter } from "@/components/tracking/tasker-location-emitter"
import { CompletionPhotoUploader } from "@/components/booking/completion-photo-uploader"
import { ReviewModal } from "@/components/booking/review-modal"
import { Button } from "@/components/ui/button"

export default async function BookingDetailsPage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id } = await params
  const supabase = await createClient()


  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase.from("profiles").select("id, role").eq("auth_id", user.id).single()
  if (!profile) redirect("/dashboard")
  
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, tasker:tasker_id(name), client:client_id(name), completion_photo_urls, lat, lng")
    .eq("id", id)
    .single()

  if (!booking) redirect("/dashboard/bookings")

  const isClient = profile?.id === booking.client_id
  const isOpenJob = !booking.tasker_id && booking.status === "pending"

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/bookings" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4 mr-1" />
        Back to Bookings
      </Link>

      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-bold tracking-tight">{booking.service_name || "Task"}</h2>
            <span className="px-2.5 py-0.5 rounded-full border text-xs capitalize bg-muted">{booking.status.replace("_", " ")}</span>
          </div>
          <p className="text-muted-foreground">{booking.address}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {isClient && booking.tasker_id && booking.payment_status === "unpaid" && (
            <Button 
              className="bg-owl-emerald hover:bg-owl-emerald/90 text-white shrink-0"
              render={<Link href={`/dashboard/checkout/${booking.id}`} />}
            >
              Pay Now
            </Button>
          )}
          {booking.status === "completed" && (
            <Button 
              variant="outline" 
              size="sm" 
              className="shrink-0"
              render={<Link href={`/dashboard/bookings/${booking.id}/invoice`} />}
            >
              <Download className="h-4 w-4 mr-2" />
              Invoice
            </Button>
          )}
          
          {isClient && booking.status === "completed" && booking.tasker_id && (
            <ReviewModal 
              bookingId={booking.id} 
              taskerId={booking.tasker_id} 
              profileId={profile.id}
              taskerName={booking.tasker?.name || "Tasker"}
              serviceName={booking.service_name || "Task"} 
            />
          )}

          <DisputeButton 
            bookingId={booking.id} 
            userId={profile.id} 
            status={booking.status} 
          />
        </div>
      </div>

      <div className="flex gap-4 text-sm text-muted-foreground p-4 bg-muted/20 rounded-xl border border-border/50">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4 text-owl-violet" />
          {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : "TBD"}
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4 text-owl-violet" />
          {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"}
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-owl-violet" />
          {booking.address}
        </div>
      </div>

      {isClient && isOpenJob && (
        <div className="pt-4 border-t border-border/50">
          <BidList bookingId={booking.id} />
        </div>
      )}

      {isClient && booking.completion_photo_urls && booking.completion_photo_urls.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <h3 className="font-semibold text-lg mb-4">Completion Proof</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {booking.completion_photo_urls.map((url: string, i: number) => (
              <a key={i} href={url} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border aspect-square hover:opacity-80 transition-opacity">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt={`Completion proof ${i + 1}`} className="w-full h-full object-cover" />
              </a>
            ))}
          </div>
        </div>
      )}
      
      {booking.tasker_id && (
        <div className="pt-4 border-t border-border/50">
          <h3 className="font-semibold text-lg mb-4">Assigned To</h3>
          <div className="p-4 rounded-xl border border-border/50 bg-card/50">
            <p className="font-medium">{booking.tasker?.name || "Tasker"}</p>
            <p className="text-sm text-muted-foreground mt-1">Total Agreed Amount: Rs {booking.total_amount?.toLocaleString() || 0}</p>
          </div>
          
          {booking.status === "in_progress" && (
            <div className="mt-6 pt-6 border-t border-border/50 space-y-6">
              <div className="flex justify-end">
                <SosButton bookingId={booking.id} userId={profile.id} />
              </div>
              {isClient ? (
                <LiveTrackingMap 
                  bookingId={booking.id} 
                  clientLat={booking.lat} 
                  clientLng={booking.lng} 
                />
              ) : (
                <TaskerLocationEmitter 
                  bookingId={booking.id} 
                  taskerProfileId={profile.id} 
                />
              )}
              {!isClient && (
                <div className="pt-6 border-t border-border/50">
                  <CompletionPhotoUploader bookingId={booking.id} userId={profile.id} />
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
