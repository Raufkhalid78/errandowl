import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const { profileId, amount } = await request.json();

    if (!profileId || !amount || amount < 100) {
      return NextResponse.json({ error: "Invalid amount or profile ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // Verify auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // SIMULATED RAPID GATEWAY API CALL
    const rapidGatewayKey = process.env.RAPID_GATEWAY_API_KEY;
    if (rapidGatewayKey) {
      console.log(`Processing via Rapid Gateway with key: ${rapidGatewayKey.substring(0, 4)}...`);
    } else {
      console.log(`Processing mock topup...`);
    }
    // Await mock API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Get current balance
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("wallet_balance")
      .eq("id", profileId)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    const newBalance = (profile.wallet_balance || 0) + amount;

    // Update balance
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ wallet_balance: newBalance })
      .eq("id", profileId);

    if (updateError) {
      throw updateError;
    }

    // Log transaction
    const { error: txError } = await supabase
      .from("wallet_transactions")
      .insert({
        profile_id: profileId,
        amount: amount,
        type: "top_up",
        status: "completed",
        description: "Wallet top-up via Rapid Gateway",
      });

    if (txError) {
      console.error("Failed to log transaction:", txError);
      // We don't fail the request here because the balance was already updated,
      // but in production we'd use a postgres function/RPC for atomic transactions.
    }

    return NextResponse.json({ success: true, newBalance });
  } catch (error: any) {
    console.error("Topup error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
