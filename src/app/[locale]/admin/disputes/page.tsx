import { createClient } from "@/lib/supabase/server";
import { AdminDisputesClient } from "./disputes-client";

export default async function AdminDisputesPage() {
  const supabase = await createClient();

  const { data: disputes } = await supabase
    .from("disputes")
    .select(`
      *,
      booking:booking_id(service_name, total_amount, client_id),
      raiser:raised_by(name, email, role),
      evidence:dispute_evidence(image_urls, evidence_text)
    `)
    .order("created_at", { ascending: false });

  return <AdminDisputesClient initialDisputes={disputes || []} />;
}
