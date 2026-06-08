"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, XCircle, ExternalLink, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function VerificationQueuePage() {
  const [taskers, setTaskers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const supabase = createClient();

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

  useEffect(() => {
    const fetchQueue = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*, tasker_profiles(*)")
        .eq("cnic_status", "pending")
        .eq("role", "tasker")
        .not("cnic_url", "is", null);

      if (data) setTaskers(data);
      setLoading(false);
    };

    fetchQueue();
  }, [supabase]);

  const handleVerify = async (userId: string, status: boolean) => {
    setProcessingId(userId);
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: status, cnic_status: status ? 'approved' : 'rejected' })
      .eq("id", userId);

    if (error) {
      toast.error("Error: " + error.message);
    } else {
      toast.success(status ? "Tasker approved successfully." : "Tasker application rejected.");
      setTaskers(taskers.filter(t => t.id !== userId));
    }
    setProcessingId(null);
  };

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-owl-violet" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Verification Queue</h1>
          <p className="text-muted-foreground">Review and approve tasker identity documents.</p>
        </div>
        <Badge variant="outline" className="text-owl-violet border-owl-violet/20 bg-owl-violet/5 px-4 py-1">
          {taskers.length} Pending Applications
        </Badge>
      </div>

      {taskers.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="font-medium">All caught up!</h3>
            <p className="text-sm text-muted-foreground">No pending verification requests at the moment.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {taskers.map((tasker) => (
            <Card key={tasker.id} className="glass overflow-hidden border-border/50">
              <div className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-owl-violet flex items-center justify-center text-white font-bold">
                    {tasker.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{tasker.name}</h3>
                    <p className="text-sm text-muted-foreground">{tasker.email}</p>
                    <div className="flex items-center gap-2 mt-2">
                        <Badge variant="secondary" className="text-[10px] uppercase">{tasker.city || "Unknown City"}</Badge>
                        <span className="text-[10px] text-muted-foreground">Joined {new Date(tasker.created_at).toLocaleDateString()}</span>
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
                    <ExternalLink className="h-4 w-4" /> View Front
                  </Button>
                   {tasker.cnic_back_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 md:flex-none gap-2 h-10"
                      onClick={() => handleViewCnic(tasker.cnic_back_url)}
                    >
                      <ExternalLink className="h-4 w-4" /> View Back
                    </Button>
                  )}
                  {tasker.certificate_url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 md:flex-none gap-2 h-10"
                      onClick={() => handleViewCnic(tasker.certificate_url)}
                    >
                      <ExternalLink className="h-4 w-4" /> View Cert/Degree
                    </Button>
                  )}
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
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
