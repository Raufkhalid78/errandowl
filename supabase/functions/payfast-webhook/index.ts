import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

serve(async (req) => {
  try {
    const payload = await req.json()
    // payload from PayFast will contain transaction status, order_id (booking_id), etc.
    
    const bookingId = payload.order_id
    const transactionStatus = payload.transaction_status

    if (!bookingId) {
      throw new Error("Missing order_id")
    }

    if (transactionStatus === "PAID" || transactionStatus === "SUCCESS") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // 1. Update Booking Status to 'paid'
      await supabase
        .from("bookings")
        .update({ status: "paid" })
        .eq("id", bookingId)

      // 2. Insert into payments table
      await supabase
        .from("payments")
        .insert({
          id: crypto.randomUUID(),
          booking_id: bookingId,
          amount: payload.amount || 0,
          status: "completed",
          method: "payfast"
        })
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
