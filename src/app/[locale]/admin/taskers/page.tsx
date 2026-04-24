import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Shield } from "lucide-react";

export default async function AdminTaskersPage() {
  const supabase = await createClient();
  const { data: taskers } = await supabase.from("tasker_profiles").select("*, profiles(*)").order("rating_avg", { ascending: false });

  const taskerList = taskers && taskers.length > 0 ? taskers : [
    { id: "tsk-1", name: "Ali Khan", email: "ali@errandowl.pk", location: "Lahore", hourly_rate: 800, rating: 4.9, review_count: 342, completed_tasks: 890, verified: true, elite: true, active: true },
    { id: "tsk-2", name: "Fatima Zahra", email: "fatima@errandowl.pk", location: "Karachi", hourly_rate: 600, rating: 4.8, review_count: 215, completed_tasks: 520, verified: true, elite: false, active: true },
    { id: "tsk-3", name: "Usman Ahmed", email: "usman@errandowl.pk", location: "Islamabad", hourly_rate: 1200, rating: 4.7, review_count: 128, completed_tasks: 340, verified: true, elite: true, active: true },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Taskers</h1>
          <p className="text-muted-foreground">Manage tasker accounts, verification, and status.</p>
        </div>
        <span className="text-sm px-3 py-1.5 rounded-full bg-owl-amber/10 text-owl-amber font-medium">
          {taskerList.length} taskers
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Tasker</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Location</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Rate</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Rating</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Tasks</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">Status</th>
                </tr>
              </thead>
              <tbody>
                {taskerList.map((t: any) => (
                  <tr key={t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-owl-amber/10 text-owl-amber flex items-center justify-center text-xs font-bold">
                          {t.name?.charAt(0) || "T"}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <p className="font-medium">{t.name}</p>
                            {t.verified && <Shield className="h-3.5 w-3.5 text-owl-emerald" />}
                            {t.elite && <span className="text-xs text-owl-amber">⭐</span>}
                          </div>
                          <p className="text-xs text-muted-foreground">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{t.location || "—"}</td>
                    <td className="p-4 font-medium text-owl-violet">{t.hourly_rate ? `Rs ${t.hourly_rate}/hr` : (t.fixed_rate ? `Rs ${t.fixed_rate} Flat` : "—")}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-owl-amber text-owl-amber" />
                        <span className="font-medium">{t.rating || 0}</span>
                        <span className="text-muted-foreground text-xs">({t.review_count || 0})</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{t.completed_tasks || 0}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        t.active ? "bg-owl-emerald/10 text-owl-emerald" : "bg-destructive/10 text-destructive"
                      }`}>
                        {t.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
