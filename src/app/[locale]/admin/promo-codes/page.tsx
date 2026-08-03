import { createClient } from "@/lib/supabase/server";
import { AdminPromoCodesClient } from "./promo-codes-client";

export default async function AdminPromoCodesPage() {
  const supabase = await createClient();
  const { data: promoCodes } = await supabase.from("promo_codes").select("*").order("created_at", { ascending: false });

  return (
    <AdminPromoCodesClient initialPromoCodes={promoCodes || []} />
  );
}
