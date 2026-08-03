"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { createNotification } from "@/lib/notifications"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { useRouter } from "next/navigation";

export function AdminDisputesClient({ initialDisputes }: { initialDisputes: any[] }) {
  const supabase = createClient()
  const router = useRouter()
  const disputes = initialDisputes
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  // Data is fetched server-side, no useEffect needed

  const handleResolve = async (dispute: any, resolution: string) => {
    const notes = prompt("Enter resolution notes for this dispute (required):")
    if (notes === null || notes.trim() === "") {
      toast.error("Resolution notes are required")
      return
    }

    setResolvingId(dispute.id)

    try {
      if (resolution === 'resolved_refunded' && dispute.booking?.client_id) {
        const clientId = dispute.booking.client_id;
        const amount = dispute.booking.total_amount || 0;

        // 1. Get current balance
        const { data: profile } = await supabase.from('profiles').select('wallet_balance').eq('id', clientId).single();
        const currentBalance = profile?.wallet_balance || 0;

        // 2. Update balance
        const { error: walletError } = await supabase.from('profiles').update({ wallet_balance: currentBalance + amount }).eq('id', clientId);
        if (walletError) throw walletError;

        // 3. Create transaction log
        const { error: txError } = await supabase.from('wallet_transactions').insert([{
          profile_id: clientId,
          amount: amount,
          type: 'credit',
          reason: 'refund',
          description: `Refund for disputed booking: ${dispute.booking.service_name}`
        }]);
        if (txError) throw txError;
      }

      // Update dispute status
      const { error } = await supabase
        .from("disputes")
        .update({ status: resolution as any, admin_notes: notes.trim() })
        .eq("id", dispute.id)
        
      if (error) throw error;
      
      // Notify the user who raised it
      if (dispute.raised_by) {
        await createNotification({
          userId: dispute.raised_by,
          type: "system",
          title: "Dispute Resolved",
          body: `Your dispute for booking '${dispute.booking?.service_name || "Unknown"}' has been resolved.`,
          link: `/dashboard/bookings/${dispute.booking_id}`
        });
      }

      toast.success(resolution === 'resolved_refunded' ? "Dispute resolved and client refunded!" : "Dispute dismissed")
      router.refresh()
    } catch (err: any) {
      toast.error("Error resolving dispute: " + err.message)
    } finally {
      setResolvingId(null)
    }
  }

  if (!disputes.length && resolvingId === null) return <div className="flex justify-center p-20"><span className="text-muted-foreground">No disputes found. Everything is peaceful!</span></div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dispute Resolution</h1>
          <p className="text-muted-foreground">Review and resolve reported issues between clients and taskers.</p>
        </div>
      </div>

      <div className="grid gap-6">
        {disputes.length === 0 ? (
          <div className="text-center p-10 border border-dashed rounded-xl text-muted-foreground">
            No disputes found. Everything is peaceful!
          </div>
        ) : (
          disputes.map((dispute) => (
            <Card key={dispute.id} className="overflow-hidden">
              <div className={`h-1.5 w-full ${dispute.status === 'open' ? 'bg-destructive' : 'bg-muted'}`} />
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <AlertTriangle className={`h-5 w-5 ${dispute.status === 'open' ? 'text-destructive' : 'text-muted-foreground'}`} />
                          <h3 className="font-semibold text-lg">Dispute for Booking: {dispute.booking?.service_name || "Unknown"}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Raised by: <span className="font-medium">{dispute.raiser?.name}</span> ({dispute.raiser?.role})
                        </p>
                      </div>
                      <Badge variant={dispute.status === 'open' ? 'destructive' : 'secondary'} className="uppercase">
                        {dispute.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="p-4 bg-muted/30 rounded-xl border border-border">
                      <p className="text-sm">{dispute.reason}</p>
                    </div>

                    {dispute.evidence?.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Attached Evidence:</p>
                        <div className="flex gap-3 overflow-x-auto pb-2">
                          {dispute.evidence.map((ev: any, i: number) => (
                            <div key={i} className="flex flex-col gap-2">
                              <div className="flex gap-3">
                                {ev.image_urls?.map((url: string, j: number) => (
                                  <a 
                                    key={`${i}-${j}`} 
                                    href={url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="shrink-0 relative group rounded-lg overflow-hidden border w-24 h-24 block"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={url} alt="Evidence" className="object-cover w-full h-full" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                      <ExternalLink className="h-5 w-5" />
                                    </div>
                                  </a>
                                ))}
                              </div>
                              {ev.evidence_text && <p className="text-xs text-muted-foreground">{ev.evidence_text}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-64 space-y-4 shrink-0 bg-muted/10 p-4 rounded-xl border">
                    <h4 className="font-medium text-sm">Resolution Controls</h4>
                    <p className="text-xs text-muted-foreground mb-4">Total Booking Amount: Rs {dispute.booking?.total_amount || 0}</p>
                    
                    {dispute.status === 'open' || dispute.status === 'in_review' ? (
                      <div className="space-y-2">
                        <Button 
                          className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white" 
                          onClick={() => handleResolve(dispute, 'resolved_refunded')}
                          disabled={resolvingId === dispute.id}
                        >
                          Resolve & Refund Client
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleResolve(dispute, 'resolved_closed')}
                          disabled={resolvingId === dispute.id}
                        >
                          Dismiss Dispute
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 bg-card rounded-lg border">
                        <p className="font-medium text-foreground mb-1">Admin Notes:</p>
                        <p className="text-xs">{dispute.admin_notes || "No notes provided."}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
