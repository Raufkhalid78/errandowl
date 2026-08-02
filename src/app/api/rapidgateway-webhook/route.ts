import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";

function verifyRapidGatewaySignature(
  rawBody: string,
  receivedSignature: string,
  secretKey: string
): boolean {
  if (!receivedSignature || !secretKey) return false;
  
  // Rapid Gateway uses HMAC-SHA256 signature verification over raw request body
  const computedHmac = crypto
    .createHmac("sha256", secretKey)
    .update(rawBody)
    .digest("hex");

  try {
    return crypto.timingSafeEqual(
      Buffer.from(computedHmac.toLowerCase()),
      Buffer.from(receivedSignature.toLowerCase())
    );
  } catch {
    return computedHmac.toLowerCase() === receivedSignature.toLowerCase();
  }
}

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let rawBody = "";
  let payload: any = {};
  let bookingId = "";

  try {
    rawBody = await request.text();
    try {
      payload = JSON.parse(rawBody);
    } catch {
      // Fallback for form-encoded payloads
      const params = new URLSearchParams(rawBody);
      payload = Object.fromEntries(params.entries());
    }

    // Extract Rapid Gateway fields
    bookingId = payload.order_id || payload.booking_id || payload.basket_id || payload.metadata?.booking_id || "";
    const transactionStatus = (payload.status || payload.event || payload.transaction_status || "").toUpperCase();
    const transactionId = payload.id || payload.transaction_id || payload.payment_intent_id || "";
    const grossAmount = parseFloat(payload.amount || payload.amount_gross || "0");

    console.log("Rapid Gateway webhook received for booking:", bookingId, payload);

    // 1. Verify HMAC-SHA256 Webhook Signature
    const webhookSecret = process.env.RAPID_GATEWAY_WEBHOOK_SECRET || process.env.RAPID_GATEWAY_SECRET_KEY || "";
    const signatureHeader = request.headers.get("x-rg-signature") || request.headers.get("x-rapid-signature") || payload.signature || "";

    if (!webhookSecret) {
      console.error("RAPID_GATEWAY_WEBHOOK_SECRET not configured");
      return new Response("Server misconfigured", { status: 500 });
    }
    if (!signatureHeader || !verifyRapidGatewaySignature(rawBody, signatureHeader, webhookSecret)) {
      console.error("Rapid Gateway signature verification failed!");
      await supabase.from("payment_webhook_logs").insert({
        booking_id: bookingId || null,
        payload,
        status: "rejected",
        error_message: "Invalid or missing signature",
      });
      return new Response("Invalid signature", { status: 400 });
    }

    // Handle wallet top-up transactions
    if (bookingId.startsWith("TOPUP-")) {
      const profileId = bookingId.split("-")[1]; // order_id format: TOPUP-profileId-timestamp

      const transactionStatusTopup = (payload.status || payload.event || payload.transaction_status || "").toUpperCase();
      const isSuccessTopup =
        transactionStatusTopup === "SUCCEEDED" ||
        transactionStatusTopup === "PAID" ||
        transactionStatusTopup === "SUCCESS" ||
        transactionStatusTopup === "PAYMENT.SUCCEEDED";

      if (!isSuccessTopup) {
        return new Response(JSON.stringify({ received: true, message: "Topup failed or pending" }), { status: 200 });
      }

      // Check if already processed to ensure idempotency
      const { data: existingTx } = await supabase
        .from("wallet_transactions")
        .select("id")
        .eq("description", `Wallet top-up via Rapid Gateway (Order: ${bookingId})`)
        .maybeSingle();
      
      if (existingTx) {
        return new Response(JSON.stringify({ received: true, message: "Duplicate topup event" }), { status: 200 });
      }

      const { data: profile } = await supabase.from("profiles").select("wallet_balance").eq("id", profileId).single();
      if (!profile) return new Response("Profile not found", { status: 404 });

      const newBalance = (profile.wallet_balance || 0) + grossAmount;
      const { error: balanceError } = await supabase.from("profiles").update({ wallet_balance: newBalance }).eq("id", profileId);
      if (balanceError) throw balanceError;

      const { error: txError } = await supabase.from("wallet_transactions").insert({
        profile_id: profileId,
        amount: grossAmount,
        type: "credit",
        reason: "top_up",
        description: `Wallet top-up via Rapid Gateway (Order: ${bookingId})`,
      });
      if (txError) throw txError;

      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    // 2. Fetch booking and existing payment record
    const { data: booking, error: bFetchError } = await supabase
      .from("bookings")
      .select("id, total_amount, payment_status")
      .eq("id", bookingId)
      .single();

    if (bFetchError || !booking) {
      console.error("Booking not found for Rapid Gateway webhook:", bookingId);
      await supabase.from("payment_webhook_logs").insert({
        booking_id: bookingId,
        payload,
        status: "rejected",
        error_message: "Booking record not found",
      });
      return new Response("Booking not found", { status: 404 });
    }

    const { data: existingPayment } = await supabase
      .from("payments")
      .select("id, status, amount")
      .eq("booking_id", bookingId)
      .maybeSingle();

    // 3. Idempotency Check
    if (booking.payment_status === "paid" || existingPayment?.status === "completed") {
      console.log(`Payment already processed for booking ${bookingId}`);
      await supabase.from("payment_webhook_logs").insert({
        booking_id: bookingId,
        payload,
        status: "duplicate",
        error_message: "Payment already completed",
      });
      return new Response(JSON.stringify({ received: true, message: "Duplicate event" }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      });
    }

    // 4. Amount Matching Check
    const expectedAmount = Number(booking.total_amount || 0);
    if (expectedAmount > 0 && Math.abs(grossAmount - expectedAmount) > 0.01) {
      console.error(`Amount mismatch for booking ${bookingId}. Expected: ${expectedAmount}, Received: ${grossAmount}`);
      await supabase.from("payment_webhook_logs").insert({
        booking_id: bookingId,
        payload,
        status: "rejected",
        error_message: `Amount mismatch. Expected: ${expectedAmount}, Received: ${grossAmount}`,
      });
      return new Response("Amount mismatch", { status: 400 });
    }

    // 5. Process Payment Event
    const isSuccess =
      transactionStatus === "SUCCEEDED" ||
      transactionStatus === "PAID" ||
      transactionStatus === "SUCCESS" ||
      transactionStatus === "PAYMENT.SUCCEEDED";

    if (isSuccess) {
      // Update Booking
      const { error: bookingUpdateError } = await supabase
        .from("bookings")
        .update({ payment_status: "paid", updated_at: new Date().toISOString() })
        .eq("id", bookingId);
        
      if (bookingUpdateError) {
        throw new Error(`Failed to update booking: ${bookingUpdateError.message}`);
      }

      // Update or Insert Payment Record
      if (existingPayment) {
        const { error: paymentUpdateError } = await supabase
          .from("payments")
          .update({
            status: "completed",
            method: "rapidgateway",
            provider_ref: transactionId,
            amount: grossAmount,
          })
          .eq("id", existingPayment.id);
          
        if (paymentUpdateError) {
          throw new Error(`Failed to update payment: ${paymentUpdateError.message}`);
        }
      } else {
        const { error: paymentInsertError } = await supabase.from("payments").insert({
          booking_id: bookingId,
          amount: grossAmount,
          method: "rapidgateway",
          provider_ref: transactionId,
          status: "completed",
        });
        
        if (paymentInsertError) {
          throw new Error(`Failed to insert payment: ${paymentInsertError.message}`);
        }
      }

      await supabase.from("payment_webhook_logs").insert({
        booking_id: bookingId,
        payload,
        status: "success",
      });

      console.log(`Rapid Gateway payment confirmed and logged for booking ${bookingId}`);
    } else {
      if (existingPayment) {
        await supabase
          .from("payments")
          .update({ status: "failed", provider_ref: transactionId })
          .eq("id", existingPayment.id);
      }

      await supabase.from("payment_webhook_logs").insert({
        booking_id: bookingId,
        payload,
        status: "failed",
        error_message: `Rapid Gateway status: ${transactionStatus}`,
      });
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Rapid Gateway Webhook Error:", err.message);

    if (bookingId) {
      await supabase.from("payment_webhook_logs").insert({
        booking_id: bookingId,
        payload,
        status: "failed",
        error_message: err.message,
      });
    }

    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    });
  }
}
