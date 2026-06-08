import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const path = searchParams.get("path") // Format: [bookingId]/[fileName]

  if (!path) {
    return new NextResponse("Missing file path", { status: 400 })
  }

  // 1. Authenticate standard client to get user identity
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // 2. Parse bookingId from path
  const parts = path.split("/")
  if (parts.length < 2) {
    return new NextResponse("Invalid file path", { status: 400 })
  }
  const bookingId = parts[0]

  // 3. Get user's profile info
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_id", user.id)
    .single()

  if (!profile) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  // 4. Verify access (must be Client, Tasker, or Admin)
  const isAdmin = profile.role === "admin"
  let hasAccess = false

  if (isAdmin) {
    hasAccess = true
  } else {
    // Check if the user is client or tasker for this booking
    const { data: booking } = await supabase
      .from("bookings")
      .select("client_id, tasker_id")
      .eq("id", bookingId)
      .single()

    if (booking) {
      if (booking.client_id === profile.id || booking.tasker_id === profile.id) {
        hasAccess = true
      }
    }
  }

  if (!hasAccess) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  // 5. Fetch the file using service role client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ""

  if (!supabaseUrl || !supabaseServiceKey) {
    return new NextResponse("Server configuration error", { status: 500 })
  }

  const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey)

  const { data: fileData, error: downloadError } = await supabaseAdmin.storage
    .from("chat_attachments")
    .download(path)

  if (downloadError || !fileData) {
    return new NextResponse("Attachment not found", { status: 404 })
  }

  // 6. Return file with correct content-type header
  const buffer = Buffer.from(await fileData.arrayBuffer())
  const contentType = fileData.type || "application/octet-stream"

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  })
}
