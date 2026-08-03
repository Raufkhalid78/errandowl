import { createClient } from "@/lib/supabase/server";
import { VerificationQueueClient } from "./verification-client";

export default async function VerificationQueuePage() {
  const supabase = await createClient();

  const { data: pendingTaskers } = await supabase
    .from("profiles")
    .select("*, tasker_profiles(*)")
    .eq("role", "tasker")
    .not("cnic_url", "is", null)
    .eq("cnic_status", "pending")
    .order("registered_at", { ascending: true });

  const { data: historyTaskers } = await supabase
    .from("profiles")
    .select("*, tasker_profiles(*)")
    .eq("role", "tasker")
    .not("cnic_url", "is", null)
    .in("cnic_status", ["approved", "rejected"])
    .order("registered_at", { ascending: false })
    .limit(50);

  return (
    <VerificationQueueClient 
      initialPending={pendingTaskers || []} 
      initialHistory={historyTaskers || []} 
    />
  );
}
