"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, Shield, Palette, Lock, Wallet, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_id", user.id)
        .maybeSingle();
      
      setProfile(profile);
      setLoading(false);
    }
    fetchData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-owl-violet" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account preferences and security.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Notifications */}
        <Card className="hover-lift transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-owl-violet/10 flex items-center justify-center"><Bell className="h-5 w-5 text-owl-violet" /></div>
              <div>
                <CardTitle className="text-base">Notifications</CardTitle>
                <CardDescription className="text-xs">Manage notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: "Email notifications", desc: "Receive booking updates via email", defaultChecked: true },
              { label: "Push notifications", desc: "Browser push notifications for new messages", defaultChecked: true },
              { label: "Marketing emails", desc: "Receive tips, promotions, and news", defaultChecked: false },
            ].map((item) => (
              <label key={item.label} className="flex items-center justify-between cursor-pointer group">
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked={item.defaultChecked} className="w-4 h-4 accent-owl-violet" />
              </label>
            ))}
          </CardContent>
        </Card>

        {/* Security */}
        <Card className="hover-lift transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-owl-emerald/10 flex items-center justify-center"><Shield className="h-5 w-5 text-owl-emerald" /></div>
              <div>
                <CardTitle className="text-base">Security</CardTitle>
                <CardDescription className="text-xs">Manage password and authentication</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Change password</p>
                <p className="text-xs text-muted-foreground">Update your account password</p>
              </div>
              <button className="text-sm text-owl-violet hover:underline">Change</button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Two-factor authentication</p>
                <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
              </div>
              <input type="checkbox" className="w-4 h-4 accent-owl-violet" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active sessions</p>
                <p className="text-xs text-muted-foreground">Manage your logged-in devices</p>
              </div>
              <button className="text-sm text-owl-violet hover:underline">View</button>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card className="hover-lift transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-owl-amber/10 flex items-center justify-center"><Palette className="h-5 w-5 text-owl-amber" /></div>
              <div>
                <CardTitle className="text-base">Appearance</CardTitle>
                <CardDescription className="text-xs">Customize the look and feel</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Dark mode</p>
                <p className="text-xs text-muted-foreground">Toggle between light and dark theme</p>
              </div>
              <button
                className="px-3 py-1.5 text-xs rounded-lg bg-muted hover:bg-owl-violet hover:text-white transition-colors"
                onClick={() => {
                  // Client side toggle would go here
                }}
              >
                Toggle
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Payout Settings (Taskers Only) */}
        {profile?.role === "tasker" && (
          <Card className="hover-lift transition-all border-owl-emerald/20">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-owl-emerald/10 flex items-center justify-center">
                  <Wallet className="h-5 w-5 text-owl-emerald" />
                </div>
                <div>
                  <CardTitle className="text-base text-owl-emerald">Payout Information</CardTitle>
                  <CardDescription className="text-xs">Manage where you receive your earnings</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Payout Method</label>
                <select className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm">
                  <option value="bank">Bank Transfer (IBAN)</option>
                  <option value="jazzcash">JazzCash</option>
                  <option value="easypaisa">EasyPaisa</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Account Details</label>
                <input 
                  type="text" 
                  placeholder="e.g., PK35 IBAN... or 03001234567" 
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
                  defaultValue={profile?.payout_method || ""}
                />
              </div>
              <button className="w-full h-10 mt-2 bg-owl-emerald hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors">
                Save Payout Details
              </button>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="hover-lift transition-all border-destructive/20">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center"><Lock className="h-5 w-5 text-destructive" /></div>
              <div>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-xs">Irreversible actions</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Delete account</p>
                <p className="text-xs text-muted-foreground">Permanently delete your account and data</p>
              </div>
              <button className="text-sm text-destructive hover:underline">Delete</button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
