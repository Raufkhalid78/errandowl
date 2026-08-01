import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { bookingId } = body;

    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Fetch booking record
    const { data: booking, error: bError } = await supabase
      .from("bookings")
      .select("*, profiles!client_id(name, email, phone)")
      .eq("id", bookingId)
      .single();

    if (bError || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const amount = Number(booking.total_amount || 0);
    const rapidApiUrl = process.env.RAPID_GATEWAY_API_URL || "https://api.rapidgateway.pk/v1";
    const apiKey = process.env.RAPID_GATEWAY_API_KEY || "";

    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    const payload = {
      order_id: booking.id,
      amount: amount,
      currency: "PKR",
      customer: {
        name: booking.profiles?.name || user.user_metadata?.full_name || "Client",
        email: booking.profiles?.email || user.email,
        phone: booking.profiles?.phone || "+923000000000",
      },
      methods: ["easypaisa", "jazzcash", "card"],
      return_url: `${siteOrigin}/payment/success?order_id=${booking.id}`,
      webhook_url: `${siteOrigin}/api/rapidgateway-webhook`,
      metadata: {
        booking_id: booking.id,
        platform: "ErrandOwl Pakistan",
      },
    };

    // Make server-to-server request to Rapid Gateway payments endpoint
    if (apiKey) {
      const response = await fetch(`${rapidApiUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Idempotency-Key": booking.id,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          checkout_url: result.checkout_url || result.payment_url,
          payment_id: result.id,
        });
      }
    }

    // Fallback simulation URL if API key is not yet set in environment
    const checkoutUrl = `${siteOrigin}/payment/success?order_id=${booking.id}`;
    return NextResponse.json({
      checkout_url: checkoutUrl,
      simulated: true,
      message: "Rapid Gateway Sandbox Simulation (Configure RAPID_GATEWAY_API_KEY for live endpoint)",
    });
  } catch (error: any) {
    console.error("Rapid Gateway Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
