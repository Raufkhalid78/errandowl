"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, ExternalLink } from "lucide-react"
import { Link } from "@/i18n/routing"

export default function AdminDisputesPage() {
  const supabase = createClient()
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [resolvingId, setResolvingId] = useState<string | null>(null)

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    setLoading(true)
    const { data } = await supabase
      .from("disputes")
      .select(`
        *,
        booking:booking_id(service_name, total_cost),
        raiser:raised_by(name, email, role),
        evidence:dispute_evidence(file_url, description)
      `)
      .order("created_at", { ascending: false })
    
    if (data) setDisputes(data)
    setLoading(false)
  }

  const handleResolve = async (id: string, resolution: string) => {
    setResolvingId(id)
    const { error } = await supabase
      .from("disputes")
      .update({ status: resolution, admin_notes: "Resolved by Admin" })
      .eq("id", id)
      
    if (!error) {
      fetchDisputes()
    } else {
      alert("Error resolving dispute")
    }
    setResolvingId(null)
  }

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-owl-violet" /></div>

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
                            <a 
                              key={i} 
                              href={ev.file_url} 
                              target="_blank" 
                              rel="noreferrer"
                              className="shrink-0 relative group rounded-lg overflow-hidden border w-24 h-24 block"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={ev.file_url} alt="Evidence" className="object-cover w-full h-full" />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <ExternalLink className="h-5 w-5" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-full md:w-64 space-y-4 shrink-0 bg-muted/10 p-4 rounded-xl border">
                    <h4 className="font-medium text-sm">Resolution Controls</h4>
                    <p className="text-xs text-muted-foreground mb-4">Total Booking Cost: Rs {dispute.booking?.total_cost || 0}</p>
                    
                    {dispute.status === 'open' || dispute.status === 'in_review' ? (
                      <div className="space-y-2">
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleResolve(dispute.id, 'resolved_refunded')}
                          disabled={resolvingId === dispute.id}
                        >
                          Resolve & Refund Client
                        </Button>
                        <Button 
                          className="w-full" 
                          variant="outline"
                          onClick={() => handleResolve(dispute.id, 'resolved_closed')}
                          disabled={resolvingId === dispute.id}
                        >
                          Dismiss Dispute
                        </Button>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground p-3 bg-muted rounded-lg border">
                        <p className="font-medium mb-1">Resolved</p>
                        <p className="text-xs">{dispute.admin_notes}</p>
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
