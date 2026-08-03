"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Eye, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { exportToCSV } from "@/lib/csv-export";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const statusColors: Record<string, string> = {
  pending: "bg-owl-amber/10 text-owl-amber",
  accepted: "bg-blue-500/10 text-blue-500",
  confirmed: "bg-blue-500/10 text-blue-500",
  in_progress: "bg-owl-violet/10 text-owl-violet",
  completed: "bg-owl-emerald/10 text-owl-emerald",
  cancelled: "bg-destructive/10 text-destructive",
};

export function AdminBookingsClient({ initialBookings }: { initialBookings: any[] }) {
  const t = useTranslations("AdminBookings");
  const supabase = createClient();
  const [bookings, setBookings] = useState<any[]>(initialBookings);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);

  // Data is fetched server-side, no useEffect needed

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase.from("bookings").update({ status: newStatus as any }).eq("id", bookingId);
    if (!error) {
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: newStatus } : b));
      toast.success("Booking status updated to " + newStatus.replace("_", " "));
    } else {
      toast.error("Error updating status: " + error.message);
    }
  };

  const handleExportCSV = () => {
    const dataToExport = bookings.map(b => ({
      id: b.id,
      description: b.service_name || "",
      client: b.client?.name || "Unknown",
      tasker: b.tasker?.name || "Unassigned",
      date: b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() : "",
      time: b.scheduled_at ? new Date(b.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "",
      location: b.address || "",
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
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("amount")}</th>
                  <th className="text-left p-4 font-medium text-muted-foreground">{t("status")}</th>
                  <th className="text-right p-4 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                 {bookings.length === 0 ? (
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
                        {b.scheduled_at ? new Date(b.scheduled_at).toLocaleDateString() + " " + new Date(b.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : "—"}
                      </td>
                      <td className="p-4 font-medium text-owl-violet">Rs {(b.total_amount || 0).toLocaleString()}</td>
                      <td className="p-4">
                        <select
                          value={b.status || 'pending'}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className={`text-xs px-2.5 py-1 rounded-full capitalize cursor-pointer border font-semibold outline-none ${statusColors[b.status] || statusColors.pending}`}
                        >
                          <option value="pending" className="text-black bg-white">Pending</option>
                          <option value="accepted" className="text-black bg-white">Accepted</option>
                          <option value="confirmed" className="text-black bg-white">Confirmed</option>
                          <option value="in_progress" className="text-black bg-white">In Progress</option>
                          <option value="completed" className="text-black bg-white">Completed</option>
                          <option value="cancelled" className="text-black bg-white">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedBooking(b)}
                          className="h-8 text-xs font-semibold text-owl-violet hover:bg-owl-violet/10 flex items-center gap-1.5 ml-auto"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border-owl-violet/20 animate-in fade-in zoom-in-95 duration-200">
            <div className="sticky top-0 bg-card z-10 flex items-center justify-between p-6 border-b border-border/50">
              <div>
                <h2 className="text-xl font-semibold">Booking Details</h2>
                <p className="text-sm text-muted-foreground font-mono mt-1">ID: {selectedBooking.id}</p>
              </div>
              <button 
                onClick={() => setSelectedBooking(null)}
                className="p-2 rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <CardContent className="p-6 space-y-8">
              {/* Status & Service */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{selectedBooking.service_name}</h3>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>
                      {selectedBooking.scheduled_at 
                        ? new Date(selectedBooking.scheduled_at).toLocaleDateString() + " at " + new Date(selectedBooking.scheduled_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
                        : "No date set"}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-owl-violet">Rs {selectedBooking.total_amount?.toLocaleString()}</span>
                  </div>
                </div>
                <Badge className={`capitalize px-3 py-1 ${statusColors[selectedBooking.status] || statusColors.pending}`}>
                  {(selectedBooking.status || "pending").replace("_", " ")}
                </Badge>
              </div>

              {/* Users */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Client</h4>
                  {selectedBooking.client ? (
                    <div className="space-y-1">
                      <p className="font-semibold">{selectedBooking.client.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedBooking.client.email}</p>
                      {selectedBooking.client.phone && <p className="text-sm text-muted-foreground">{selectedBooking.client.phone}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Unknown Client</p>
                  )}
                </div>
                
                <div className="p-4 rounded-xl border border-border/50 bg-muted/20">
                  <h4 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Tasker</h4>
                  {selectedBooking.tasker ? (
                    <div className="space-y-1">
                      <p className="font-semibold">{selectedBooking.tasker.name}</p>
                      <p className="text-sm text-muted-foreground">{selectedBooking.tasker.email}</p>
                      {selectedBooking.tasker.phone && <p className="text-sm text-muted-foreground">{selectedBooking.tasker.phone}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">Unassigned</p>
                  )}
                </div>
              </div>

              {/* Location & Details */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Location</h4>
                  <p className="p-3 bg-muted/30 rounded-lg text-sm border border-border/50">
                    {selectedBooking.address || "No address provided"}
                  </p>
                </div>
                
                {selectedBooking.details && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1 uppercase tracking-wider">Additional Notes</h4>
                    <p className="p-3 bg-muted/30 rounded-lg text-sm border border-border/50 whitespace-pre-wrap">
                      {selectedBooking.details}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
