"use server";

import { createClient } from "@/lib/supabase/server";

export async function createNotification(params: {
  userId: string;
  type: "booking_update" | "new_message" | "new_review" | "system" | "alert";
  title: string;
  body?: string;
  link?: string;
}) {
  const supabase = await createClient();
  
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
