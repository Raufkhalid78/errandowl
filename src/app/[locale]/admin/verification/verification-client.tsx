"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink, ShieldCheck, Clock, History } from "lucide-react";
import { toast } from "sonner";

import { useRouter } from "next/navigation";

export function VerificationQueueClient({ 
  initialPending, 
  initialHistory 
}: { 
  initialPending: any[]; 
  initialHistory: any[]; 
}) {
  const router = useRouter();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const supabase = createClient();
  
  const taskers = activeTab === 'pending' ? initialPending : initialHistory;

  const getStoragePathFromUrl = (url: string) => {
    if (!url) return null;
    const parts = url.split("/documents/");
    if (parts.length > 1) {
      return parts[1].split("?")[0];
    }
    return null;
  };

  const handleViewCnic = async (url: string) => {
    const path = getStoragePathFromUrl(url);
    if (!path) {
      window.open(url, "_blank");
      return;
    }
    const { data, error } = await supabase.storage
      .from("documents")
      .createSignedUrl(path, 60);

    if (error) {
      toast.error("Error generating signed URL: " + error.message);
    } else if (data?.signedUrl) {
      window.open(data.signedUrl, "_blank");
    }
  };

  const refreshData = () => {
    router.refresh();
  };

  const handleVerify = async (userId: string, status: boolean) => {
    let rejectionReason = null;
    if (!status) {
      rejectionReason = prompt("Please provide a reason for rejecting this application (e.g., blurry image, expired CNIC):");
      if (rejectionReason === null || rejectionReason.trim() === "") {
        toast.error("A rejection reason is required.");
        return;
      }
    }

    setProcessingId(userId);
    
    const updatePayload: any = {
      is_verified: status,
      cnic_status: status ? 'approved' : 'rejected'
    };

    if (rejectionReason) {
      updatePayload.cnic_rejection_reason = rejectionReason.trim();
    }

    const { error } = await supabase
      .from("profiles")
      .update(updatePayload)
      .eq("id", userId);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success(status ? "Tasker approved successfully." : "Tasker application rejected.");
      refreshData();
    }
    setProcessingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verification Queue</h1>
          <p className="text-muted-foreground">Review and approve tasker identity documents.</p>
        </div>
        
        <div className="flex bg-muted p-1 rounded-xl">
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'pending' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('pending')}
          >
            <Clock className="h-4 w-4" /> Pending
          </button>
          <button 
            className={`flex items-center gap-2 px-4 py-2 text-sm rounded-lg transition-colors ${activeTab === 'history' ? 'bg-background shadow text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            onClick={() => setActiveTab('history')}
          >
            <History className="h-4 w-4" /> History
          </button>
        </div>
      </div>

      {taskers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium">{activeTab === 'pending' ? "All caught up!" : "No history found."}</h3>
            <p className="text-sm text-muted-foreground">
              {activeTab === 'pending' ? "No pending verification requests at the moment." : "There are no approved or rejected applications yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {taskers.map((tasker) => (
            <Card key={tasker.id} className="glass overflow-hidden border-border/50">
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-owl-violet flex items-center justify-center text-white font-bold shrink-0">
                    {tasker.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-lg">{tasker.name}</h3>
                      {activeTab === 'history' && (
                        <Badge variant={tasker.cnic_status === 'approved' ? 'default' : 'destructive'} className="text-[10px] uppercase h-5">
                          {tasker.cnic_status}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{tasker.email}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="text-[10px] uppercase">{tasker.city || "Unknown City"}</Badge>
                        <span className="text-[10px] text-muted-foreground">Joined {new Date(tasker.registered_at).toLocaleDateString()}</span>
                        {tasker.cnic_rejection_reason && (
                          <span className="text-[10px] text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
                            Reason: {tasker.cnic_rejection_reason}
                          </span>
                        )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 md:flex-none gap-2 h-10"
                    onClick={() => handleViewCnic(tasker.cnic_url)}
                    disabled={!tasker.cnic_url}
                  >
                    <ExternalLink className="h-4 w-4" /> Front
                  </Button>
                   {tasker.cnic_back_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 md:flex-none gap-2 h-10"
                      onClick={() => handleViewCnic(tasker.cnic_back_url)}
                    >
                      <ExternalLink className="h-4 w-4" /> Back
                    </Button>
                  )}
                  {tasker.certificate_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 md:flex-none gap-2 h-10"
                      onClick={() => handleViewCnic(tasker.certificate_url)}
                    >
                      <ExternalLink className="h-4 w-4" /> Cert
                    </Button>
                  )}
                  
                  {activeTab === 'pending' && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 md:flex-none text-destructive hover:text-destructive hover:bg-destructive/10 h-10"
                        onClick={() => handleVerify(tasker.id, false)}
                        disabled={!!processingId}
                      >
                        <XCircle className="h-4 w-4 mr-2" /> Reject
                      </Button>
                      <Button
                        size="sm"
                        className="flex-1 md:flex-none bg-owl-emerald hover:bg-owl-emerald-dark text-white h-10 px-6"
                        onClick={() => handleVerify(tasker.id, true)}
                        disabled={!!processingId}
                      >
                        {processingId === tasker.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                        Approve
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
