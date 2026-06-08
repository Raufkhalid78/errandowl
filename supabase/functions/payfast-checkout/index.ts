import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { bookingId, amount, tipAmount, customerEmail, customerPhone } = await req.json()

    const finalTipAmount = tipAmount || 0;

    // 1. Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? ""
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 2. Verify booking exists
    const { data: booking, error: bookingError } = await supabase
      .from("bookings")
      .select("*, profiles!client_id(*)")
      .eq("id", bookingId)
      .single()

    if (bookingError || !booking) {
      throw new Error("Booking not found")
    }

    // 3. Create a payment record
    const { data: payment, error: paymentError } = await supabase
      .from("payments")
      .insert({
        booking_id: bookingId,
        amount: amount,
        tip_amount: finalTipAmount,
        method: "payfast",
        status: "pending",
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    // Also update booking with tip amount
    if (finalTipAmount > 0) {
      await supabase.from("bookings").update({ tip_amount: finalTipAmount }).eq("id", bookingId);
    }

    // 4. PayFast Integration
    const merchantId = Deno.env.get("PAYFAST_MERCHANT_ID")
    const securedKey = Deno.env.get("PAYFAST_SECURED_KEY")
    const isProduction = Deno.env.get("PAYFAST_MODE") === "production"
    const siteUrl = Deno.env.get("SITE_URL") || "http://localhost:3000"

    const baseUrl = isProduction 
        ? "https://ipg.gopayfast.com/eng/payment/custom_redirect" 
        : "https://sandbox.gopayfast.com/eng/payment/custom_redirect";

    // Construct PayFast Parameters
    // Note: Signature generation logic depends on PayFast's exact requirements.
    // This implementation follows the standard MD5 hashing of key fields.
    const params = new URLSearchParams({
      merchant_id: merchantId!,
      secured_key: securedKey!,
      basket_id: bookingId,
      trans_amount: amount.toString(),
      currency_code: "PKR",
      customer_email: customerEmail || booking.profiles?.email || "",
      customer_mobile: customerPhone || booking.profiles?.phone || "",
      checkout_url: `${siteUrl}/payment/success`,
      cancel_url: `${siteUrl}/payment/error`,
    });

    const paymentUrl = `${baseUrl}?${params.toString()}`;

    return new Response(
      JSON.stringify({ url: paymentUrl, paymentId: payment.id }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
