import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profileId, amount } = await request.json();

    if (!amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
    }

    // Verify profileId actually belongs to the authenticated user — never trust it from the body alone
    const { data: profile, error: pError } = await supabase.from("profiles").select("id, name, email, phone").eq("auth_id", user.id).single();
    if (pError || !profile || profile.id !== profileId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rapidApiUrl = process.env.RAPID_GATEWAY_API_URL || "https://api.rapidgateway.pk/v1";
    const apiKey = process.env.RAPID_GATEWAY_API_KEY || "";
    const siteOrigin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

    // Use underscores as delimiter — UUIDs contain hyphens, so underscore is the only safe separator
    const orderId = `TOPUP_${profileId}_${Date.now()}`;

    const payload = {
      order_id: orderId,
      amount: amount,
      currency: "PKR",
      customer: {
        name: profile?.name || user.user_metadata?.full_name || "Client",
        email: profile?.email || user.email,
        phone: profile?.phone || "+923000000000",
      },
      methods: ["easypaisa", "jazzcash", "card"],
      return_url: `${siteOrigin}/dashboard/wallet/topup/success?order_id=${orderId}`,
      webhook_url: `${siteOrigin}/api/rapidgateway-webhook`,
      metadata: {
        profile_id: profile.id,
        platform: "ErrandOwl Pakistan",
        type: "topup"
      },
    };

    if (apiKey) {
      const response = await fetch(`${rapidApiUrl}/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${apiKey}`,
          "Idempotency-Key": orderId,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        return NextResponse.json({
          checkoutUrl: result.checkout_url || result.payment_url,
          payment_id: result.id,
        });
      }
    }

    // Fallback simulation URL if API key is not yet set in environment
    const checkoutUrl = `${siteOrigin}/dashboard/wallet/topup/success?order_id=${orderId}`;
    return NextResponse.json({
      checkoutUrl: checkoutUrl,
      simulated: true,
      message: "Rapid Gateway Sandbox Simulation (Configure RAPID_GATEWAY_API_KEY for live endpoint)",
    });
  } catch (error: any) {
    console.error("Top-up Checkout Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
