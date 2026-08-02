"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/routing";
import { CheckCircle, Loader2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function SuccessContent() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const basketId = searchParams.get("basket_id") || searchParams.get("order_id");
    if (!basketId) {
      setLoading(false);
      return;
    }
    setBookingId(basketId);

    const supabase = createClient();
    let attempts = 0;
    const maxAttempts = 7; // ~14 seconds total

    const poll = async () => {
      const { data } = await supabase.from("bookings").select("payment_status").eq("id", basketId).single();
      if (data?.payment_status === "paid" || attempts >= maxAttempts) {
        setConfirmed(data?.payment_status === "paid");
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
        <p className="text-muted-foreground">Verifying your payment...</p>
      </div>
    );
  }

  if (!confirmed) {
    // Webhook may still be processing (network delay), or something went wrong.
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <Clock className="h-10 w-10 text-owl-amber mb-6" />
        <h1 className="text-3xl font-bold mb-2">Payment Processing</h1>
        <p className="text-muted-foreground max-w-md mb-8">
          We're confirming your payment with the gateway. This can take a moment — check your booking status shortly.
        </p>
        <Button render={<Link href={`/dashboard/bookings/${bookingId}`}>View Booking Status</Link>} className="px-8 h-12 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 rounded-full bg-owl-emerald/10 flex items-center justify-center mb-6">
        <CheckCircle className="h-10 w-10 text-owl-emerald" />
      </div>
      <h1 className="text-3xl font-bold mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground max-w-md mb-8">
        Thank you for your payment. Your booking has been confirmed and the tasker has been notified.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button render={<Link href="/dashboard">Go to Dashboard</Link>} className="bg-owl-violet hover:bg-owl-violet-dark text-white px-8 h-12 rounded-xl" />
        <Button render={<Link href={`/dashboard/bookings/${bookingId}`}>View Booking Details</Link>} variant="outline" className="px-8 h-12 rounded-xl" />
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div className="container mx-auto py-20">
      <Suspense fallback={<Loader2 className="animate-spin" />}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}
