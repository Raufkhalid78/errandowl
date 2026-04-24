"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner"; // Assuming sonner is available or just use alert
import { type PricingSettings, type PricingMode } from "@/lib/pricing";
import { useTranslations } from "next-intl";

interface SettingsFormProps {
  initialSettings: any;
}

export function SettingsForm({ initialSettings }: SettingsFormProps) {
  const t = useTranslations("AdminSettings");
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState(initialSettings);
  const supabase = createClient();

  const handleSave = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("settings")
      .upsert({
        id: "global",
        ...settings,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      alert("Error saving settings: " + error.message);
    } else {
      alert("Settings saved successfully!");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="glass">
          <CardHeader><CardTitle className="text-base">{t("generalConfig")}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="site_name">{t("siteName")}</Label>
              <Input 
                id="site_name" 
                value={settings.site_name} 
                onChange={e => setSettings({...settings, site_name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="currency">{t("currency")}</Label>
              <Input 
                id="currency" 
                value={settings.currency} 
                onChange={e => setSettings({...settings, currency: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_email">{t("supportEmail")}</Label>
              <Input 
                id="contact_email" 
                value={settings.contact_email} 
                onChange={e => setSettings({...settings, contact_email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_phone">{t("supportPhone")}</Label>
              <Input 
                id="contact_phone" 
                value={settings.contact_phone} 
                onChange={e => setSettings({...settings, contact_phone: e.target.value})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-owl-violet/20">
          <CardHeader><CardTitle className="text-base text-owl-violet">{t("pricingEngine")}</CardTitle></CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Label>{t("globalPricingMode")}</Label>
              <div className="flex bg-muted p-1 rounded-xl border border-border/50">
                <button
                  onClick={() => setSettings({...settings, pricing_mode: 'hourly'})}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    settings.pricing_mode === 'hourly' 
                      ? "bg-card text-owl-violet shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("hourlyRate")}
                </button>
                <button
                  onClick={() => setSettings({...settings, pricing_mode: 'fixed'})}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
                    settings.pricing_mode === 'fixed' 
                      ? "bg-card text-owl-violet shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t("fixedRate")}
                </button>
              </div>
              <p className="text-[10px] text-muted-foreground px-1">
                {settings.pricing_mode === 'hourly' 
                  ? t("hourlyDesc") 
                  : t("fixedDesc")}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="min_rate">{t("minRate")}</Label>
                <Input 
                  id="min_rate" 
                  type="number"
                  value={settings.min_rate} 
                  onChange={e => setSettings({...settings, min_rate: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="max_rate">{t("maxRate")}</Label>
                <Input 
                  id="max_rate" 
                  type="number"
                  value={settings.max_rate} 
                  onChange={e => setSettings({...settings, max_rate: parseInt(e.target.value)})}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="service_fee">{t("serviceFee")}</Label>
              <Input 
                id="service_fee" 
                type="number"
                value={settings.service_fee_percent} 
                onChange={e => setSettings({...settings, service_fee_percent: parseFloat(e.target.value)})}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 glass">
          <CardHeader><CardTitle className="text-base">{t("officeAddress")}</CardTitle></CardHeader>
          <CardContent>
            <textarea 
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm min-h-[100px] focus:ring-2 focus:ring-owl-violet/20 outline-none transition-all" 
              value={settings.office_address || ""} 
              onChange={e => setSettings({...settings, office_address: e.target.value})}
            />
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-owl-violet hover:bg-owl-violet-dark text-white px-8 py-6 h-auto rounded-2xl shadow-lg shadow-owl-violet/20"
        >
          {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
          {t("saveConfig")}
        </Button>
      </div>
    </div>
  );
}
