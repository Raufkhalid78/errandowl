import { createClient } from "@/lib/supabase/server";
import { AdminBookingsClient } from "./bookings-client";

export default async function AdminBookingsPage() {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      *,
      client:client_id(name, email, phone),
      tasker:tasker_id(name, email, phone)
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  return <AdminBookingsClient initialBookings={bookings || []} />;
}
