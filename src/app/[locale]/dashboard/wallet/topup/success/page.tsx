"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CheckCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function TopupSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const [loading, setLoading] = useState(!!orderId);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!orderId) {
      return;
    }

    const supabase = createClient();
    let attempts = 0;
    const maxAttempts = 7; // ~14 seconds of polling

    const poll = async () => {
      // READ-ONLY — never write wallet_balance from this page.
      // The webhook (with HMAC signature verification) is the only thing allowed to credit it.
      const { data } = await supabase
        .from("wallet_transactions")
        .select("id")
        .eq("description", `Wallet top-up via Rapid Gateway (Order: ${orderId})`)
        .maybeSingle();

      if (data || attempts >= maxAttempts) {
        setConfirmed(!!data);
        setLoading(false);
        return;
      }
      attempts++;
      setTimeout(poll, 2000);
    };

    poll();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-owl-violet animate-spin mb-4" />
        <p className="text-lg text-muted-foreground">Confirming your top-up...</p>
        <p className="text-sm text-muted-foreground mt-2">This may take a few seconds.</p>
      </div>
    );
  }

  if (!confirmed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mb-6">
          <Clock className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Still Processing</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          We&apos;re confirming your payment with the gateway. Your wallet balance will update shortly — this can sometimes take a moment.
        </p>
        <Button render={<Link href="/dashboard/wallet" />} className="px-8 h-12 rounded-xl">
          Back to Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10 text-emerald-500" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Top-Up Successful!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Your wallet has been credited. You&apos;re all set to book your next service!
      </p>
      <Button render={<Link href="/dashboard/wallet" />} className="bg-owl-violet hover:bg-owl-violet/90 text-white px-8 h-12 rounded-xl">
        View Wallet
      </Button>
    </div>
  );
}

export default function TopupSuccessPage() {
  return (
    <div className="container mx-auto py-20">
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-owl-violet" />
        </div>
      }>
        <TopupSuccessContent />
      </Suspense>
    </div>
  );
}
