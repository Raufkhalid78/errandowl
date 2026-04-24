"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/routing";
import { CheckCircle, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const handleSuccess = async () => {
      // PayFast usually sends back the basket_id or order_id
      const basketId = searchParams.get("basket_id") || searchParams.get("order_id");
      if (!basketId) {
        setLoading(false);
        return;
      }

      setBookingId(basketId);

      // Update booking and payment status
      // In production, this should also be handled by the IPN (server-to-server)
      // but we update here for immediate UI feedback.
      const { error } = await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", basketId);

      if (error) console.error("Error updating booking:", error);

      // Update payment record
      await supabase
        .from("payments")
        .update({ status: "completed" })
        .eq("booking_id", basketId);

      setLoading(false);
    };

    handleSuccess();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 text-owl-violet animate-spin mb-4" />
        <p className="text-muted-foreground">Verifying your payment...</p>
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
        <Button
          render={<Link href="/dashboard">Go to Dashboard</Link>}
          className="bg-owl-violet hover:bg-owl-violet-dark text-white px-8 h-12 rounded-xl"
        />
        <Button
          render={<Link href={`/dashboard/bookings/${bookingId}`}>View Booking Details</Link>}
          variant="outline"
          className="px-8 h-12 rounded-xl"
        />
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
