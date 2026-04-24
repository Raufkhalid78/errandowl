import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";

const statusColors: Record<string, string> = {
  pending: "bg-owl-amber/10 text-owl-amber",
  confirmed: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-owl-violet/10 text-owl-violet",
  completed: "bg-owl-emerald/10 text-owl-emerald",
  cancelled: "bg-destructive/10 text-destructive",
};

export default async function AdminBookingsPage() {
  const t = await getTranslations("AdminBookings");
  const supabase = await createClient();
  const { data: bookings } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(50);

  const bookingList = bookings && bookings.length > 0 ? bookings : [
    { id: "bk-1", service_name: "IKEA Assembly", client_name: "Ahmed R.", tasker_name: "Ali Khan", status: "completed", total_cost: 2400, date: "2026-04-15", location: "Lahore" },
    { id: "bk-2", service_name: "Deep Cleaning", client_name: "Sara K.", tasker_name: "Fatima Zahra", status: "pending", total_cost: 3500, date: "2026-04-25", location: "Karachi" },
    { id: "bk-3", service_name: "Light Install", client_name: "Usman A.", tasker_name: "Usman Ahmed", status: "confirmed", total_cost: 2400, date: "2026-04-28", location: "Islamabad" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <span className="text-sm px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
          {t("bookingsCount", { count: bookingList.length })}
        </span>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("service")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("client")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("tasker")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("date")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("location")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("amount")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {bookingList.map((b: any) => (
                  <tr key={b.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-medium">{b.service_name || "—"}</td>
                    <td className="p-4 text-muted-foreground">{b.client_name || "—"}</td>
                    <td className="p-4 text-muted-foreground">{b.tasker_name || t("unassigned")}</td>
                    <td className="p-4 text-muted-foreground">{b.date || "—"}</td>
                    <td className="p-4 text-muted-foreground">{b.location || "—"}</td>
                    <td className="p-4 font-medium text-owl-violet">Rs {(b.total_cost || 0).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[b.status] || statusColors.pending}`}>
                        {(b.status || "pending").replace("_", " ")}
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
