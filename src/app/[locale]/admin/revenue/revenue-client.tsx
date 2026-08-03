"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, TrendingUp, Wallet, ArrowUpRight, Check, X, Info, FileText, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { exportToCSV } from "@/lib/csv-export";

import { useRouter } from "next/navigation";

export function RevenueDashboardClient({
  initialStats,
  initialPayouts,
  initialRecentPayments
}: {
  initialStats: any;
  initialPayouts: any[];
  initialRecentPayments: any[];
}) {
  const t = useTranslations("AdminRevenue");
  const stats = initialStats;
  const payouts = initialPayouts;
  const recentPayments = initialRecentPayments;
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<{ [key: string]: string }>({});
  const supabase = createClient();
  const router = useRouter();

  const refreshData = async () => {
    router.refresh();
  };

  const handleExportCSV = () => {
    const dataToExport = payouts.map(p => ({
      tasker: p.profiles?.name || "Unknown",
      email: p.profiles?.email || "",
      method: p.method || "",
      details: p.account_details || "",
      amount: p.amount || 0,
      status: p.status || "",
      notes: p.admin_notes || "",
      date: p.requested_at ? new Date(p.requested_at).toLocaleDateString() : ""
    }));

    const headersMap = {
      tasker: "Tasker Name",
      email: "Tasker Email",
      method: "Method",
      details: "Account Details",
      amount: "Amount (Rs)",
      status: "Status",
      notes: "Admin Notes",
      date: "Requested Date"
    };

    const success = exportToCSV(dataToExport, "errandowl-payouts.csv", headersMap);
    if (success) {
      toast.success("CSV export downloaded successfully!");
    } else {
      toast.error("No data available to export");
    }
  };

  const handleActionNotesChange = (payoutId: string, value: string) => {
    setActionNotes(prev => ({ ...prev, [payoutId]: value }));
  };

  const handlePayoutStatus = async (payoutId: string, taskerId: string, amount: number, newStatus: 'paid' | 'rejected') => {
    const notes = actionNotes[payoutId] || "";

    if (newStatus === "rejected" && !notes.trim()) {
      toast.error("Please enter a rejection reason in the notes field.");
      return;
    }

    setProcessingId(payoutId);
    try {
      // 1. Update payout entry
      const { error: updateError } = await supabase
        .from("payouts")
        .update({
          status: newStatus,
          admin_notes: notes.trim() || (newStatus === "paid" ? "Paid by Admin" : null),
          resolved_at: new Date().toISOString()
        })
        .eq("id", payoutId);

      if (updateError) throw updateError;

      // 2. If rejected, refund the tasker's wallet balance
      if (newStatus === "rejected") {
        const { data: profile } = await supabase
          .from("profiles")
          .select("wallet_balance")
          .eq("id", taskerId)
          .single();

        const currentBalance = profile?.wallet_balance || 0;
        const { error: refundError } = await supabase
          .from("profiles")
          .update({ wallet_balance: currentBalance + amount })
          .eq("id", taskerId);

        if (refundError) throw refundError;
      }

      toast.success(newStatus === "paid" ? "Payout marked as Paid!" : "Payout request Rejected & Refunded.");
      
      // Clear notes field
      setActionNotes(prev => {
        const copy = { ...prev };
        delete copy[payoutId];
        return copy;
      });

      // Reload data
      refreshData();
    } catch (err: any) {
      console.error("Error processing payout status update:", err);
      toast.error(err.message || "Failed to update payout status");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border-amber-500/20">Pending</Badge>;
      case "processing":
        return <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20">Processing</Badge>;
      case "paid":
        return <Badge className="bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20">Paid</Badge>;
      case "rejected":
        return <Badge className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 border-rose-500/20">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getMethodLabel = (method: string) => {
    switch (method) {
      case "jazzcash":
        return "JazzCash";
      case "easypaisa":
        return "EasyPaisa";
      case "bank_transfer":
        return "Bank Transfer";
      default:
        return method;
    }
  };



  const pendingPayouts = payouts.filter(p => p.status === "pending" || p.status === "processing");
  const processedPayouts = payouts.filter(p => p.status === "paid" || p.status === "rejected");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 h-9"
        >
          <Download className="h-4 w-4" /> Export CSV
        </Button>
      </div>

      {/* KPI Cards */}
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

      {/* Main Grid: Pending Payout Queue & Recent Payments */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Payout Queue (Pending Requests) */}
        <Card className="glass lg:col-span-2 border-border/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base">{t("payoutQueue")}</CardTitle>
              <p className="text-xs text-muted-foreground">Pending withdrawal requests from taskers.</p>
            </div>
            <Badge variant="outline" className="bg-amber-500/5 text-amber-600 border-amber-500/20 px-2 py-0.5">
              {pendingPayouts.length} Pending
            </Badge>
          </CardHeader>
          <CardContent>
            {pendingPayouts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">{t("noPendingPayouts")}</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingPayouts.map((payout) => (
                  <div key={payout.id} className="p-4 rounded-xl border border-border bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:bg-muted/20">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-base text-foreground">Rs {payout.amount.toLocaleString()}</span>
                        {getStatusBadge(payout.status)}
                      </div>
                      
                      <div className="text-xs text-muted-foreground space-y-1">
                        <p><span className="font-semibold text-foreground">Tasker:</span> {payout.profiles?.name || "Unknown"} ({payout.profiles?.email})</p>
                        <p><span className="font-semibold text-foreground">Method:</span> {getMethodLabel(payout.method)}</p>
                        <p className="whitespace-pre-line bg-muted/20 p-2 rounded border border-border/50 text-foreground text-[11px] font-mono mt-1">
                          {payout.account_details}
                        </p>
                        <p className="text-[10px] pt-1">
                          Requested on {new Date(payout.requested_at).toLocaleString("en-PK")}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 shrink-0 w-full md:w-48">
                      <Input
                        placeholder="Tx ID / Admin Note"
                        value={actionNotes[payout.id] || ""}
                        onChange={(e) => handleActionNotesChange(payout.id, e.target.value)}
                        disabled={processingId === payout.id}
                        className="h-8 text-xs"
                      />
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handlePayoutStatus(payout.id, payout.tasker_id, payout.amount, "rejected")}
                          disabled={processingId === payout.id}
                          className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10 h-8 text-xs"
                        >
                          <X className="h-3.5 w-3.5 mr-1" /> Reject
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handlePayoutStatus(payout.id, payout.tasker_id, payout.amount, "paid")}
                          disabled={processingId === payout.id}
                          className="flex-1 bg-owl-emerald hover:bg-owl-emerald/90 text-white h-8 text-xs font-semibold"
                        >
                          {processingId === payout.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5 mr-1" /> Paid
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Platform Payments */}
        <Card className="glass border-border/50">
          <CardHeader>
            <CardTitle className="text-base">{t("recentPayments")}</CardTitle>
            <p className="text-xs text-muted-foreground">Recent transactions completed on the platform.</p>
          </CardHeader>
          <CardContent>
            {recentPayments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <FileText className="h-8 w-8 mb-2 opacity-35" />
                <p className="text-sm font-medium">No recent payments</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentPayments.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-3 rounded-xl border border-border/50 bg-muted/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-owl-violet/10 flex items-center justify-center">
                        <Wallet className="h-4 w-4 text-owl-violet" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Booking #{payment.booking_id?.slice(0, 8)}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {new Date(payment.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-bold block">Rs {parseFloat(payment.amount).toLocaleString()}</span>
                      <span className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">{payment.method || "card"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Processed Payouts History */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Processed Payouts History</CardTitle>
          <p className="text-xs text-muted-foreground">All time payout history (Paid & Rejected).</p>
        </CardHeader>
        <CardContent>
          {processedPayouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Info className="h-8 w-8 mb-2 opacity-35" />
              <p className="text-sm">No processed payouts yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left border-collapse">
                <thead>
                  <tr className="border-b border-border/80 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="py-3 px-4">Tasker</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Account Details</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Admin Notes</th>
                    <th className="py-3 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {processedPayouts.map((payout) => (
                    <tr key={payout.id} className="hover:bg-muted/5 transition-colors">
                      <td className="py-3 px-4 font-medium">
                        <div>{payout.profiles?.name || "Unknown"}</div>
                        <div className="text-[10px] text-muted-foreground">{payout.profiles?.email}</div>
                      </td>
                      <td className="py-3 px-4">{getMethodLabel(payout.method)}</td>
                      <td className="py-3 px-4 font-mono text-[10px] whitespace-pre-line max-w-[200px] truncate">{payout.account_details}</td>
                      <td className="py-3 px-4 font-bold">Rs {payout.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">{getStatusBadge(payout.status)}</td>
                      <td className="py-3 px-4 text-xs italic text-muted-foreground">{payout.admin_notes || "-"}</td>
                      <td className="py-3 px-4 text-xs">
                        {new Date(payout.requested_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
