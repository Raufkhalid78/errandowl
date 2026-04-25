import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Shield } from "lucide-react";
import { TaskerStatusToggle } from "@/components/admin/tasker-status-toggle";

export default async function AdminTaskersPage() {
  const supabase = await createClient();
  const { data: taskers } = await supabase.from("tasker_profiles").select("*, profiles(*)").order("rating_avg", { ascending: false });

  const taskerList = taskers && taskers.length > 0 ? taskers : [
    { profile_id: "tsk-1", profiles: { name: "Ali Khan", email: "ali@errandowl.pk", location: "Lahore", cnic_status: "approved" }, city: "Lahore", hourly_rate: 800, rating_avg: 4.9, review_count: 342, completed_tasks: 890, active: true },
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
                {taskerList.map((t: any) => {
                  const name = t.profiles?.name || "Unknown";
                  const email = t.profiles?.email || "No email";
                  const verified = t.profiles?.cnic_status === 'approved';
                  const location = t.city || t.profiles?.location || "—";
                  
                  return (
                    <tr key={t.profile_id || t.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-owl-amber/10 text-owl-amber flex items-center justify-center text-xs font-bold uppercase">
                            {name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <p className="font-medium">{name}</p>
                              {verified && <Shield className="h-3.5 w-3.5 text-owl-emerald" />}
                            </div>
                            <p className="text-xs text-muted-foreground">{email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{location}</td>
                      <td className="p-4 font-medium text-owl-violet">{t.hourly_rate ? `Rs ${t.hourly_rate}/hr` : "—"}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-owl-amber text-owl-amber" />
                          <span className="font-medium">{t.rating_avg || 0}</span>
                          <span className="text-muted-foreground text-xs">({t.review_count || 0})</span>
                        </div>
                      </td>
                      <td className="p-4 text-muted-foreground">{t.completed_tasks || 0}</td>
                      <td className="p-4">
                        <TaskerStatusToggle profileId={t.profile_id} initialStatus={t.active} />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
