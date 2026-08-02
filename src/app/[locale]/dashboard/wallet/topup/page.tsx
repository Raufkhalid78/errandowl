"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Wallet, ArrowLeft, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@/i18n/routing";

export default function WalletTopupPage() {
  const [amount, setAmount] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const presets = [500, 1000, 2000, 5000];

  const handleTopup = async () => {
    if (!amount || amount < 100) {
      toast.error("Minimum top-up amount is Rs 100");
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: profile } = await supabase
        .from("profiles")
        .select("id, wallet_balance")
        .eq("auth_id", user.id)
        .single();
        
      if (!profile) throw new Error("Profile not found");

      // SIMULATE RAPID GATEWAY API CALL
      // In production, you would redirect to a Rapid Gateway checkout URL here,
      // and their webhook would hit an API endpoint to update the balance.
      // E.g.: const checkoutUrl = await createRapidGatewayCheckout(profile.id, amount)
      
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          profileId: profile.id, 
          amount: amount 
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      toast.success(`Successfully added Rs ${amount} to your wallet!`);
      router.push("/dashboard/wallet");
      router.refresh();
      
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to process top-up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/wallet">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Top Up Wallet</h2>
          <p className="text-muted-foreground">Add funds securely using Rapid Gateway.</p>
        </div>
      </div>

      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-owl-violet" />
            Select Amount
          </CardTitle>
          <CardDescription>
            Choose an amount to add to your ErrandOwl wallet balance. Funds will be available instantly.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {presets.map(preset => (
              <Button
                key={preset}
                variant={amount === preset ? "default" : "outline"}
                className={amount === preset ? "bg-owl-violet hover:bg-owl-violet/90 text-white" : ""}
                onClick={() => setAmount(preset)}
                disabled={loading}
              >
                Rs {preset}
              </Button>
            ))}
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom_amount">Custom Amount (Rs)</Label>
            <Input 
              id="custom_amount"
              type="number"
              min="100"
              placeholder="Enter amount (min. 100)"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value) || "")}
              disabled={loading}
              className="text-lg font-medium"
            />
          </div>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <Button 
            className="w-full bg-owl-emerald hover:bg-owl-emerald-dark text-white h-12 text-lg font-semibold"
            onClick={handleTopup}
            disabled={loading || !amount || amount < 100}
          >
            {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CreditCard className="mr-2 h-5 w-5" />}
            Pay via Rapid Gateway
          </Button>
          <p className="text-[10px] text-muted-foreground text-center">
            Secured by Rapid Gateway 256-bit encryption. By proceeding, you agree to our Terms of Service.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
