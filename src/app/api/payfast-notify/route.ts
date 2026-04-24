import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    // PayFast sends data as Form Data
    const formData = await request.formData();
    const payload = Object.fromEntries(formData.entries());

    console.log("PayFast IPN received:", payload);

    // 1. Extract key fields
    const bookingId = payload.basket_id as string;
    const paymentStatus = payload.payment_status as string; // Check PayFast exact field names
    const transactionId = payload.transaction_id as string;
    const amount = payload.amount as string;

    // 2. Initialize Supabase with Service Role (to bypass RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 3. Process status
    // Note: status '1' or 'success' usually indicates success in PayFast
    if (paymentStatus === "1" || paymentStatus === "success") {
      // Update Booking
      const { error: bError } = await supabase
        .from("bookings")
        .update({ payment_status: "paid" })
        .eq("id", bookingId);

      if (bError) throw bError;

      // Update Payment Record
      const { error: pError } = await supabase
        .from("payments")
        .update({ 
          status: "completed",
          provider_ref: transactionId,
          amount: parseFloat(amount)
        })
        .eq("booking_id", bookingId);

      if (pError) throw pError;

      console.log(`Payment confirmed for booking ${bookingId}`);
    } else {
      // Log failure
      await supabase
        .from("payments")
        .update({ status: "failed" })
        .eq("booking_id", bookingId);
        
      console.log(`Payment failed for booking ${bookingId}`);
    }

    // PayFast expects a 200 OK response to stop retrying
    return new Response("OK", { status: 200 });
  } catch (error: any) {
    console.error("IPN Handler Error:", error.message);
    return new Response("Error", { status: 400 });
  }
}
