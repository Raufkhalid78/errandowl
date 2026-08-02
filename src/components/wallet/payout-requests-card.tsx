"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, History, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PayoutRequestsCardProps {
  profileId: string;
  initialBalance: number;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  method: string;
  account_details: string;
  admin_notes: string | null;
  requested_at: string;
}

export function PayoutRequestsCard({ profileId, initialBalance }: PayoutRequestsCardProps) {
  const supabase = createClient();
  const router = useRouter();

  const [balance, setBalance] = useState(initialBalance);
  const [payouts, setPayouts] = useState<PayoutRequest[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form states
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("jazzcash");
  const [accountDetails, setAccountDetails] = useState("");

  const fetchPayoutHistory = useCallback(async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("payouts")
        .select("*")
        .eq("tasker_id", profileId)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      setPayouts(data || []);
    } catch (err: any) {
      console.error("Error fetching payouts:", {
        message: err.message,
        code: err.code,
        details: err.details,
        hint: err.hint,
        error: err
      });
      toast.error("Failed to load payout history");
    } finally {
      setLoadingHistory(false);
    }
  }, [supabase, profileId]);

  useEffect(() => {
    fetchPayoutHistory();
  }, [fetchPayoutHistory]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (amt < 500) {
      toast.error("Minimum payout request amount is Rs 500");
      return;
    }

    if (amt > balance) {
      toast.error("Insufficient balance");
      return;
    }

    if (!accountDetails.trim()) {
      toast.error("Please enter account details");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Insert payout request
      const { error: insertError } = await supabase
        .from("payouts")
        .insert({
          tasker_id: profileId,
          amount: amt,
          method: method,
          account_details: accountDetails,
          status: "pending"
        });

      if (insertError) throw insertError;

      // 2. Deduct from wallet balance in profiles table
      const newBalance = balance - amt;
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ wallet_balance: newBalance })
        .eq("id", profileId);

      if (updateError) throw updateError;

      setBalance(newBalance);
      setAmount("");
      setAccountDetails("");
      toast.success("Payout request submitted successfully!");
      fetchPayoutHistory();
      
      // Refresh page so parent page updates or local state handles it
      router.refresh();
    } catch (err: any) {
      console.error("Payout submission error:", err);
      toast.error(err.message || "Failed to submit payout request");
    } finally {
      setSubmitting(false);
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

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Withdrawal Form Card */}
      <Card className="glass overflow-hidden border-owl-violet/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5 text-owl-violet" />
            Withdraw Earnings
          </CardTitle>
          <CardDescription>
            Send a request to cash out your available earnings.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 rounded-xl bg-owl-violet/5 border border-owl-violet/10">
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Available for Payout</p>
            <p className="text-3xl font-bold text-owl-violet mt-1">Rs {balance.toLocaleString()}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Withdrawal Amount (Rs)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Minimum Rs 500"
                min="500"
                max={balance}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={submitting || balance < 500}
                required
              />
              {balance < 500 && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertTriangle className="h-3 w-3" />
                  You need at least Rs 500 to request a payout.
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Payout Method</Label>
              <select
                id="method"
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={submitting}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="jazzcash">JazzCash</option>
                <option value="easypaisa">EasyPaisa</option>
                <option value="bank_transfer">Bank Transfer</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountDetails">Account Details</Label>
              <textarea
                id="accountDetails"
                rows={3}
                placeholder={
                  method === "bank_transfer"
                    ? "Bank Name: HBL\nAccount Title: Ali Khan\nIBAN / Account Number: PK12HBL000..."
                    : `Account Mobile Number: 03001234567\nAccount Title: Ali Khan`
                }
                value={accountDetails}
                onChange={(e) => setAccountDetails(e.target.value)}
                disabled={submitting}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-owl-violet hover:bg-owl-violet/90 text-white"
              disabled={submitting || balance < 500}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Submitting Request...
                </>
              ) : (
                "Submit Payout Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* History Card */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            Payout History
          </CardTitle>
          <CardDescription>
            View your recent payout requests and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingHistory ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : payouts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <Info className="h-8 w-8 mb-2 opacity-40" />
              <p className="text-sm font-medium">No payouts requested yet</p>
              <p className="text-xs max-w-xs mt-1">
                Your withdrawal requests will appear here once you make them.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
              {payouts.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 rounded-xl border border-border bg-muted/10 space-y-3 transition-all hover:bg-muted/20"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-bold">Rs {payout.amount.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {new Date(payout.requested_at).toLocaleDateString("en-PK", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    {getStatusBadge(payout.status)}
                  </div>
                  <div className="text-xs space-y-1 text-muted-foreground border-t pt-2 border-border/50">
                    <p>
                      <span className="font-semibold text-foreground">Method:</span>{" "}
                      {getMethodLabel(payout.method)}
                    </p>
                    <p className="whitespace-pre-line">
                      <span className="font-semibold text-foreground">Details:</span>{" "}
                      {payout.account_details}
                    </p>
                    {payout.admin_notes && (
                      <div className="mt-2 p-2 rounded bg-rose-500/5 border border-rose-500/10 text-rose-600 text-[11px] flex gap-1.5 items-start">
                        {payout.status === "rejected" ? (
                          <XCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        )}
                        <div>
                          <span className="font-bold">Admin Note:</span> {payout.admin_notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
