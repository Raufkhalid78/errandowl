"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Bell, Shield, Palette, Briefcase, UploadCloud, Loader2, User } from "lucide-react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations("DashboardSettings");
  const { theme, setTheme } = useTheme();
  

  const [profile, setProfile] = useState<any>(null);
  const [taskerProfile, setTaskerProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [activeTab, setActiveTab] = useState("account");

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }


      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", user.id)
        .single();
      
      setProfile(profile);

      if (profile?.role === "tasker" || profile?.role === "admin") {
        const { data: tp } = await supabase
          .from("tasker_profiles")
          .select("*")
          .eq("profile_id", profile.id)
          .single();
        
        if (tp) {
          const { data: avail } = await supabase.from('tasker_availability').select('*').eq('tasker_id', profile.id);
          
          let days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
          if (avail && avail.length > 0) {
            days = avail.map(a => a.day_of_week.charAt(0).toUpperCase() + a.day_of_week.slice(1));
          }

          setTaskerProfile({
            ...tp,
            skills: tp.skills ? tp.skills.join(", ") : "",
            availability_days: days,
            categories: tp.categories || [],
            startTime: avail?.[0]?.start_time || "09:00",
            endTime: avail?.[0]?.end_time || "18:00"
          });
        } else {
          setTaskerProfile({
            pricing_mode: "hourly",
            hourly_rate: 0,
            fixed_rate: 0,
            skills: "",
            availability_days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
            categories: [],
            startTime: "09:00",
            endTime: "18:00"
          });
        }
      }
      
      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  const allCategories = [
    { id: "cat-1", name: "Furniture Assembly" },
    { id: "cat-2", name: "Home Cleaning" },
    { id: "cat-3", name: "Moving Help" },
    { id: "cat-4", name: "Mounting" },
    { id: "cat-5", name: "Plumbing" },
    { id: "cat-6", name: "Electrical" },
    { id: "cat-9", name: "Delivery" },
  ];
  const allDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const handleSaveTasker = async () => {
    setSaving(true);
    try {
      const skillsArray = taskerProfile.skills.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      
      const { error } = await supabase.from("tasker_profiles").upsert({
        profile_id: profile.id,
        pricing_mode: taskerProfile.pricing_mode || 'hourly',
        hourly_rate: taskerProfile.hourly_rate || 0,
        fixed_rate: taskerProfile.fixed_rate || 0,
        skills: skillsArray,
        categories: taskerProfile.categories
      }, { onConflict: 'profile_id' });

      if (error) throw error;

      if (taskerProfile.availability_days.length > 0) {
        await supabase.from('tasker_availability').delete().eq('tasker_id', profile.id);
        const schedules = taskerProfile.availability_days.map((day: string) => ({
          tasker_id: profile.id,
          day_of_week: day.toLowerCase(),
          start_time: taskerProfile.startTime || '09:00',
          end_time: taskerProfile.endTime || '18:00',
          is_blocked: false
        }));
        const { error: scheduleError } = await supabase.from('tasker_availability').insert(schedules);
        if (scheduleError) throw scheduleError;
      } else {
        await supabase.from('tasker_availability').delete().eq('tasker_id', profile.id);
      }

      toast.success(t("success"));
    } catch (err: any) {
      toast.error(err.message || t("error"));
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = (id: string) => {
    setTaskerProfile((prev: any) => ({
      ...prev,
      categories: prev.categories.includes(id) 
        ? prev.categories.filter((c: string) => c !== id)
        : [...prev.categories, id]
    }));
  };

  const toggleDay = (day: string) => {
    setTaskerProfile((prev: any) => ({
      ...prev,
      availability_days: prev.availability_days.includes(day) 
        ? prev.availability_days.filter((d: string) => d !== day)
        : [...prev.availability_days, day]
    }));
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]"><Loader2 className="h-8 w-8 animate-spin text-owl-violet" /></div>;
  }

  const tabs = [
    { id: "account", label: t("tabs.account"), icon: User },
    { id: "notifications", label: t("tabs.notifications"), icon: Bell },
    { id: "security", label: t("tabs.security"), icon: Shield },
    { id: "appearance", label: t("tabs.appearance"), icon: Palette },
  ];
  if (profile?.role === "tasker" || profile?.role === "admin") {
    tabs.push({ id: "tasker", label: t("tabs.tasker"), icon: Briefcase });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">{t("description")}</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 flex flex-col gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? "bg-owl-violet text-white" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-6">
          {/* Account Tab */}
          {activeTab === "account" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("account.title")}</CardTitle>
                <CardDescription>{t("account.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t("account.fullName")}</Label>
                  <Input defaultValue={profile?.name || ""} />
                </div>
                <div className="space-y-2">
                  <Label>{t("account.phone")}</Label>
                  <Input defaultValue={profile?.phone || ""} />
                </div>
                <div className="space-y-2">
                  <Label>{t("account.location")}</Label>
                  <Input defaultValue={profile?.location || ""} />
                </div>
                <div className="space-y-2">
                  <Label>{t("account.bio")}</Label>
                  <textarea 
                    className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    defaultValue={profile?.bio || ""}
                  />
                </div>
                <Button>{t("account.save")}</Button>
              </CardContent>
            </Card>
          )}

          {/* Tasker Profile Tab */}
          {activeTab === "tasker" && taskerProfile && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("tasker.title")}</CardTitle>
                  <CardDescription>{t("tasker.description")}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label>Pricing Preference</Label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="settingsPricingMode" 
                          value="hourly"
                          checked={taskerProfile.pricing_mode === "hourly"}
                          onChange={() => setTaskerProfile({...taskerProfile, pricing_mode: "hourly"})}
                          className="text-owl-violet focus:ring-owl-violet"
                        />
                        <span className="text-sm">Hourly Rate</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="radio" 
                          name="settingsPricingMode" 
                          value="fixed"
                          checked={taskerProfile.pricing_mode === "fixed"}
                          onChange={() => setTaskerProfile({...taskerProfile, pricing_mode: "fixed"})}
                          className="text-owl-violet focus:ring-owl-violet"
                        />
                        <span className="text-sm">Flat Rate</span>
                      </label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>
                      {taskerProfile.pricing_mode === "hourly" ? t("tasker.hourlyRate") : "Flat Rate (Rs) *"}
                    </Label>
                    {taskerProfile.pricing_mode === "hourly" ? (
                      <Input 
                        type="number" 
                        value={taskerProfile.hourly_rate || 0} 
                        onChange={e => setTaskerProfile({...taskerProfile, hourly_rate: Number(e.target.value)})}
                      />
                    ) : (
                      <Input 
                        type="number" 
                        value={taskerProfile.fixed_rate || 0} 
                        onChange={e => setTaskerProfile({...taskerProfile, fixed_rate: Number(e.target.value)})}
                      />
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label>{t("tasker.skills")}</Label>
                    <Input 
                      value={taskerProfile.skills} 
                      onChange={e => setTaskerProfile({...taskerProfile, skills: e.target.value})}
                      placeholder={t("tasker.skillsPlaceholder")}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>{t("tasker.categories")}</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {allCategories.map(cat => (
                        <label key={cat.id} className="flex items-center space-x-2 border p-2 rounded-lg cursor-pointer hover:bg-muted/50">
                          <input
                            type="checkbox"
                            checked={taskerProfile.categories.includes(cat.id)}
                            onChange={() => toggleCategory(cat.id)}
                            className="rounded border-gray-300 text-owl-violet focus:ring-owl-violet"
                          />
                          <span className="text-sm">{cat.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>{t("tasker.availability")}</Label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {allDays.map(day => (
                        <button
                          key={day}
                          onClick={() => toggleDay(day)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                            taskerProfile.availability_days.includes(day)
                              ? "bg-owl-violet text-white"
                              : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="flex-1 space-y-2">
                        <Label>Start Time</Label>
                        <Input
                          type="time"
                          value={taskerProfile.startTime || "09:00"}
                          onChange={e => setTaskerProfile({...taskerProfile, startTime: e.target.value})}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <Label>End Time</Label>
                        <Input
                          type="time"
                          value={taskerProfile.endTime || "18:00"}
                          onChange={e => setTaskerProfile({...taskerProfile, endTime: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleSaveTasker} disabled={saving}>
                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {t("tasker.save")}
                  </Button>
                </CardContent>
              </Card>

              {/* Portfolio Upload */}
              <Card>
                <CardHeader>
                  <CardTitle>{t("tasker.portfolioTitle")}</CardTitle>
                  <CardDescription>{t("tasker.portfolioDesc")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/50 transition-colors">
                    <input type="file" id="portfolio" className="hidden" accept="image/*" multiple />
                    <Label htmlFor="portfolio" className="cursor-pointer flex flex-col items-center gap-3">
                      <UploadCloud className="h-10 w-10 text-muted-foreground" />
                      <span className="font-medium">{t("tasker.uploadTitle")}</span>
                      <span className="text-xs text-muted-foreground">{t("tasker.uploadDesc")}</span>
                    </Label>
                  </div>
                  {/* Grid to show existing images would go here */}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("notifications.title")}</CardTitle>
                <CardDescription>{t("notifications.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: t("notifications.email"), desc: t("notifications.emailDesc"), defaultChecked: profile?.notify_email ?? true },
                  { label: t("notifications.push"), desc: t("notifications.pushDesc"), defaultChecked: profile?.notify_push ?? true },
                  { label: t("notifications.marketing"), desc: t("notifications.marketingDesc"), defaultChecked: profile?.notify_marketing ?? false },
                ].map((item) => (
                  <label key={item.label} className="flex items-center justify-between cursor-pointer">
                    <div>
                      <p className="text-sm font-medium">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 accent-owl-violet" />
                  </label>
                ))}
                <Button variant="outline" className="mt-4">{t("notifications.update")}</Button>
              </CardContent>
            </Card>
          )}

          {/* Appearance Tab */}
          {activeTab === "appearance" && (
            <Card>
              <CardHeader>
                <CardTitle>{t("appearance.title")}</CardTitle>
                <CardDescription>{t("appearance.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium">{t("appearance.dark")}</p>
                    <p className="text-xs text-muted-foreground">{t("appearance.darkDesc")}</p>
                  </div>
                  <Switch 
                    checked={theme === 'dark'} 
                    onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')} 
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">{t("security.title")}</CardTitle>
                <CardDescription>{t("security.description")}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{t("security.delete")}</p>
                    <p className="text-xs text-muted-foreground">{t("security.deleteDesc")}</p>
                  </div>
                  <Button variant="destructive" size="sm">{t("security.deleteBtn")}</Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
