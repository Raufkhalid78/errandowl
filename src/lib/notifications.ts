"use server";

import { createClient } from "@supabase/supabase-js";

export async function createNotification(params: {
  userId: string;
  type: "booking_update" | "new_message" | "new_review" | "system" | "alert";
  title: string;
  body?: string;
  link?: string;
}) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { error } = await supabase.from("notifications").insert({
    user_id: params.userId,
    type: params.type,
    title: params.title,
    body: params.body,
    link: params.link,
  });

  if (error) {
    console.error("Failed to create notification:", error);
  }
}
