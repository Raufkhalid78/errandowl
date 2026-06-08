"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertOctagon, LogOut, Mail, Phone } from "lucide-react";
import { useState, useEffect } from "react";

export default function SuspendedPage() {
  const supabase = createClient();
  const router = useRouter();
  const [status, setStatus] = useState<string>("suspended");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("auth_id", user.id)
        .single();

      if (profile && (profile.status === "active" || !profile.status)) {
        router.push("/dashboard");
      } else if (profile) {
        setStatus(profile.status);
      }
      setLoading(false);
    };

    checkStatus();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-8 h-8 rounded-full border-4 border-owl-violet border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="max-w-md w-full glass border-destructive/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-destructive" />
        <CardHeader className="text-center pt-8">
          <div className="w-16 h-16 bg-destructive/10 text-destructive rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <AlertOctagon className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            Account {status === "banned" ? "Permanently Banned" : "Temporarily Suspended"}
          </CardTitle>
          <CardDescription className="mt-2 text-sm text-muted-foreground">
            {status === "banned" 
              ? "Your access to the ErrandOwl platform has been permanently terminated due to violation of our community guidelines."
              : "Your account has been temporarily suspended pending investigation of suspicious activity or policy violation."
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pb-8">
          <div className="p-4 rounded-xl bg-muted border border-border/50 space-y-3">
            <h4 className="font-semibold text-sm text-foreground">Need to appeal this decision?</h4>
            <p className="text-xs text-muted-foreground">
              If you believe this was an error, please reach out to our Trust & Safety team with your account details.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <a href="mailto:trust@errandowl.com.pk" className="flex items-center gap-2 text-owl-violet hover:underline">
                <Mail className="h-3.5 w-3.5" /> trust@errandowl.com.pk
              </a>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-3.5 w-3.5" /> +92 300 1234 567
              </div>
            </div>
          </div>

          <Button 
            onClick={handleLogout} 
            className="w-full bg-destructive hover:bg-destructive/90 text-white flex items-center justify-center gap-2 h-11 rounded-xl"
          >
            <LogOut className="h-4 w-4" /> Log Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
