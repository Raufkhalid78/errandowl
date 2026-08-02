import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify user is admin
    const { data: adminCheck } = await supabase
      .from("admins")
      .select("id")
      .eq("email", user.email || "")
      .maybeSingle();

    const { data: profileCheck } = await supabase
      .from("profiles")
      .select("role")
      .eq("auth_id", user.id)
      .maybeSingle();

    const isAdmin = !!adminCheck || profileCheck?.role === "admin";

    if (!isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }

    // Verify target user exists
    const { data: targetProfile } = await supabase
      .from("profiles")
      .select("id, auth_id, email, name")
      .or(`id.eq.${targetUserId},auth_id.eq.${targetUserId}`)
      .maybeSingle();

    if (!targetProfile) {
      return NextResponse.json({ error: "Target user not found" }, { status: 404 });
    }

    // Need the admin's profile id, not just their email, to satisfy admin_id
    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("auth_id", user.id)
      .single();

    // Record Audit Log Entry
    await supabase.from("admin_audit_logs").insert({
      admin_id: adminProfile?.id,
      action: "impersonate_start",
      entity_type: "profile",
      entity_id: targetProfile.id,
      details: {
        target_name: targetProfile.name,
        target_email: targetProfile.email,
      },
    });

    // Set impersonation cookie
    const cookieStore = await cookies();
    cookieStore.set("sb-impersonate-id", targetProfile.auth_id || targetProfile.id, {
      path: "/",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });

    return NextResponse.json({ success: true, targetUser: targetProfile });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const cookieStore = await cookies();
    const impersonateId = cookieStore.get("sb-impersonate-id")?.value;

    if (user && impersonateId) {
      const { data: adminProfile } = await supabase
        .from("profiles")
        .select("id")
        .eq("auth_id", user.id)
        .single();

      // Record Audit Log Entry
      await supabase.from("admin_audit_logs").insert({
        admin_id: adminProfile?.id,
        action: "impersonate_stop",
        entity_type: "profile",
        entity_id: impersonateId,
      });
    }

    cookieStore.set("sb-impersonate-id", "", {
      path: "/",
      expires: new Date(0),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
