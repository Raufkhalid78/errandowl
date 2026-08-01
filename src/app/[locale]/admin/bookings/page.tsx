"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { useTranslations } from "next-intl";
import { exportToCSV } from "@/lib/csv-export";
import { toast } from "sonner";

const statusColors: Record<string, string> = {
  pending: "bg-owl-amber/10 text-owl-amber",
  accepted: "bg-blue-500/10 text-blue-500",
  confirmed: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-owl-violet/10 text-owl-violet",
  completed: "bg-owl-emerald/10 text-owl-emerald",
  cancelled: "bg-destructive/10 text-destructive",
};

export default function AdminBookingsPage() {
  const t = useTranslations("AdminBookings");
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      // Fetch bookings with client and tasker details
      const { data, error } = await supabase
        .from("bookings")
        .select(`
          id,
          service_name,
          address,
          scheduled_at,
          total_amount,
          status,
          client:client_id(name),
          tasker:tasker_id(name)
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching bookings:", error);
      } else {
        setBookings(data || []);
      }
      setLoading(false);
    };

    fetchBookings();
  }, [supabase]);

  const handleExportCSV = () => {
    const dataToExport = bookings.map(b => ({
      id: b.id,
      description: b.service_name || "",
      client: b.client?.name || "Unknown",
      tasker: b.tasker?.name || "Unassigned",
      date: b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "",
      time: b.scheduled_at ? new Date(b.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
      location: b.address || "",
      city: "",
      amount: b.total_amount || 0,
      status: b.status || ""
    }));

    const headersMap = {
      id: "Booking ID",
      description: "Description",
      client: "Client Name",
      tasker: "Tasker Name",
      date: "Date",
      time: "Time",
      location: "Location",
      city: "City",
      amount: "Amount (Rs)",
      status: "Status"
    };

    const success = exportToCSV(dataToExport, "errandowl-bookings.csv", headersMap);
    if (success) {
      toast.success("CSV export downloaded successfully!");
    } else {
      toast.error("No data available to export");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
          <p className="text-muted-foreground">{t("description")}</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 h-9"
          >
            <Download className="h-4 w-4" /> Export CSV
          </Button>
          <span className="text-sm px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-500 font-medium">
            {t("bookingsCount", { count: bookings.length })}
          </span>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-muted/30">
                  <th className="text-left p-4 font-medium text-muted-foreground">Description</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("client")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("tasker")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("date")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("location")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("amount")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("status")}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-owl-violet" />
                    </td>
                  </tr>
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b: any) => (
                    <tr key={b.id} className="border-b border-border/30 hover:bg-muted/20 transition-colors">
                      <td className="p-4 font-medium max-w-[200px] truncate" title={b.service_name}>{b.service_name || "—"}</td>
                      <td className="p-4 text-muted-foreground">{b.client?.name || "—"}</td>
                      <td className="p-4 text-muted-foreground">{b.tasker?.name || t("unassigned")}</td>
                      <td className="p-4 text-muted-foreground">
                        {b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() + " at " + new Date(b.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}
                      </td>
                      <td className="p-4 text-muted-foreground">{b.address || "—"}</td>
                      <td className="p-4 font-medium text-owl-violet">Rs {(b.total_amount || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${statusColors[b.status] || statusColors.pending}`}>
                          {(b.status || "pending").replace("_", " ")}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
