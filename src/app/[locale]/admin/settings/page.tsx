import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "@/components/admin/settings-form";
import { getTranslations } from "next-intl/server";

export default async function AdminSettingsPage() {
  const t = await getTranslations("AdminSettings");
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("settings")
    .select("*")
    .eq("id", "global")
    .single();

  const defaultSettings = {
    currency: "PKR",
    pricing_mode: "hourly",
    platform_fee_percent: 10,
    min_hourly_rate: 300,
    support_email: "support@errandowl.com.pk",
    office_address: "Lahore, Pakistan",
    contact_phone: "+92 300 1234 567",
  };

  const initialSettings = settings || defaultSettings;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>
      
      <SettingsForm initialSettings={initialSettings as any} />
    </div>
  );
}
