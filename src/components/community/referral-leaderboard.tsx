"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Gift, Users, Loader2 } from "lucide-react";

export function ReferralLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchLeaderboard = async () => {
      // Step 1: get top referral codes (no join)
      const { data: codes } = await supabase
        .from("referral_codes")
        .select("id, profile_id, code, usage_count")
        .order("usage_count", { ascending: false })
        .limit(10);

      if (!codes || codes.length === 0) {
        setLeaderboard([]);
        setLoading(false);
        return;
      }

      // Step 2: batch-fetch matching public profile info
      const profileIds = codes.map((c) => c.profile_id);
      const { data: profiles } = await supabase
        .from("public_profiles")
        .select("id, name, avatar_url, city")
        .in("id", profileIds);

      // Step 3: merge client-side
      const profileMap = new Map((profiles ?? []).map((p: any) => [p.id, p]));
      const leaderboardData = codes.map((c) => ({
        ...c,
        profiles: profileMap.get(c.profile_id) ?? {},
      }));

      setLeaderboard(leaderboardData);
      setLoading(false);
    };

    fetchLeaderboard();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-owl-violet" />
      </div>
    );
  }

  return (
    <Card className="glass overflow-hidden border-owl-violet/20 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-owl-violet/10 to-owl-amber/10 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-owl-amber/20 text-owl-amber rounded-2xl">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold">Referral Champions</CardTitle>
              <p className="text-xs text-muted-foreground">Top community members earning referral rewards in Pakistan.</p>
            </div>
          </div>
          <Badge variant="outline" className="bg-owl-amber/10 text-owl-amber border-owl-amber/30 px-3 py-1 font-bold">
            🎁 Rs 500 / Referral
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            No referral champions recorded yet. Share your code to top the leaderboard!
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((item, index) => {
              const profile = item.profiles || {};
              const initials = profile.name?.[0]?.toUpperCase() || "U";
              const rankColor =
                index === 0
                  ? "bg-amber-400 text-amber-950 font-black"
                  : index === 1
                  ? "bg-slate-300 text-slate-900 font-bold"
                  : index === 2
                  ? "bg-amber-700 text-white font-bold"
                  : "bg-muted text-muted-foreground font-semibold";

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-border/50 bg-card hover:border-owl-violet/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${rankColor}`}>
                      #{index + 1}
                    </span>

                    <div className="w-10 h-10 rounded-xl bg-owl-violet text-white font-bold flex items-center justify-center">
                      {initials}
                    </div>

                    <div>
                      <h4 className="font-semibold text-sm">{profile.name || "Anonymous User"}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> Code: <span className="font-mono text-owl-violet">{item.code}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-bold text-owl-violet text-sm">
                      {item.usage_count || 0} Invites
                    </div>
                    <div className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 justify-end">
                      <Gift className="h-3 w-3" /> Rs {((item.usage_count || 0) * 500).toLocaleString()} Earned
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
