"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function RevenueDashboardPage() {
  const t = useTranslations("AdminRevenue");
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      // Fetch total payments
      const { data: payments } = await supabase
        .from("payments")
        .select("amount, status");

      // Fetch service fee from settings
      const { data: settings } = await supabase
        .from("settings")
        .select("service_fee_percent")
        .eq("id", "global")
        .single();

      const feePercent = settings?.service_fee_percent || 10;
      
      const totalVolume = payments?.filter(p => p.status === 'completed').reduce((sum, p) => sum + p.amount, 0) || 0;
      const totalFees = (totalVolume * feePercent) / 100;
      const pendingVolume = payments?.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0) || 0;

      setStats({
        totalVolume,
        totalFees,
        pendingVolume,
        completedCount: payments?.filter(p => p.status === 'completed').length || 0,
        feePercent
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-owl-violet" /></div>;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="glass overflow-hidden border-owl-violet/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("totalVolume")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">Rs {stats.totalVolume.toLocaleString()}</span>
              <Badge variant="secondary" className="bg-owl-emerald/10 text-owl-emerald border-owl-emerald/20 text-[10px]">
                <ArrowUpRight className="h-3 w-3 mr-1" /> +12%
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("completedBookings", { count: stats.completedCount })}</p>
          </CardContent>
          <div className="h-1 bg-owl-violet" />
        </Card>

        <Card className="glass overflow-hidden border-owl-emerald/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("platformEarnings")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-owl-emerald">Rs {stats.totalFees.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">({stats.feePercent}%)</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("revenueGenerated")}</p>
          </CardContent>
          <div className="h-1 bg-owl-emerald" />
        </Card>

        <Card className="glass overflow-hidden border-owl-amber/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{t("pendingVolume")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-owl-amber">Rs {stats.pendingVolume.toLocaleString()}</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{t("paymentsProcessing")}</p>
          </CardContent>
          <div className="h-1 bg-owl-amber" />
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
         {/* Could add a chart here in a real app */}
         <Card className="glass">
           <CardHeader><CardTitle className="text-base">{t("recentPayments")}</CardTitle></CardHeader>
           <CardContent>
             <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-owl-violet/10 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-owl-violet" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Payment for Booking #{Math.floor(Math.random()*1000)}</p>
                        <p className="text-[10px] text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <span className="text-sm font-bold">Rs {(Math.random()*5000).toFixed(0)}</span>
                  </div>
                ))}
             </div>
           </CardContent>
         </Card>

         <Card className="glass">
           <CardHeader><CardTitle className="text-base">{t("payoutQueue")}</CardTitle></CardHeader>
           <CardContent>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">{t("noPendingPayouts")}</p>
              </div>
           </CardContent>
         </Card>
      </div>
    </div>
  );
}
