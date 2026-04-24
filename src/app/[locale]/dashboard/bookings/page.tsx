import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Star, MessageCircle } from "lucide-react";

const statusColors: Record<string, string> = {
  pending: "bg-owl-amber/10 text-owl-amber border-owl-amber/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-owl-violet/10 text-owl-violet border-owl-violet/20",
  completed: "bg-owl-emerald/10 text-owl-emerald border-owl-emerald/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const mockBookings = [
  {
    id: "bk-1",
    service_name: "IKEA Furniture Assembly",
    tasker_name: "Ali Khan",
    tasker_id: "tsk-1",
    status: "completed",
    date: "2026-04-15",
    time: "14:00",
    location: "DHA Phase 5, Lahore",
    total_cost: 2400,
    estimated_hours: 3,
  },
  {
    id: "bk-2",
    service_name: "Deep Cleaning",
    tasker_name: "Fatima Zahra",
    tasker_id: "tsk-2",
    status: "pending",
    date: "2026-04-25",
    time: "09:00",
    location: "Gulberg III, Lahore",
    total_cost: 3500,
    estimated_hours: 5,
  },
  {
    id: "bk-3",
    service_name: "Light Installation",
    tasker_name: "Usman Ahmed",
    tasker_id: "tsk-3",
    status: "confirmed",
    date: "2026-04-28",
    time: "11:00",
    location: "F-8, Islamabad",
    total_cost: 2400,
    estimated_hours: 2,
  },
];

export default async function BookingsPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("auth_id", user.id).single();
  const role = profile?.role || "client";

  // Fetch bookings
  const isTasker = role === "tasker" || role === "admin";
  let bookings: any[] = [];

  if (isTasker) {
    const { data } = await supabase.from("bookings").select("*").eq("tasker_id", user.id).order("created_at", { ascending: false });
    bookings = data && data.length > 0 ? data : mockBookings;
  } else {
    const { data: profileData } = await supabase.from("profiles").select("id").eq("auth_id", user.id).single();
    const clientId = profileData?.id || user.id;
    const { data } = await supabase.from("bookings").select("*").eq("client_id", clientId).order("created_at", { ascending: false });
    bookings = data && data.length > 0 ? data : mockBookings;
  }

  // Group by status
  const active = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
          <p className="text-muted-foreground">
            {isTasker ? "Manage your accepted jobs and track earnings." : "Track your service requests and upcoming tasks."}
          </p>
        </div>
        {!isTasker && (
          <Button
            render={<Link href="/dashboard/services">Book New Task</Link>}
            className="bg-owl-violet hover:bg-owl-violet-dark text-white"
          />
        )}
      </div>

      {/* Active Bookings */}
      {active.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-owl-violet animate-pulse" />
            Active ({active.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {active.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isTasker={isTasker} />
            ))}
          </div>
        </div>
      )}

      {/* Past Bookings */}
      {past.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 text-muted-foreground">
            Past Bookings ({past.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {past.map((booking) => (
              <BookingCard key={booking.id} booking={booking} isTasker={isTasker} />
            ))}
          </div>
        </div>
      )}

      {bookings.length === 0 && (
        <div className="text-center py-16 border border-dashed rounded-2xl">
          <div className="text-4xl mb-4">📋</div>
          <h3 className="font-medium mb-2">No bookings yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isTasker
              ? "Browse open jobs to start earning."
              : "Browse services to book your first task."}
          </p>
          <Button
            render={
              <Link href={isTasker ? "/dashboard/jobs" : "/dashboard/services"}>
                {isTasker ? "Browse Jobs" : "Browse Services"}
              </Link>
            }
            className="bg-owl-violet hover:bg-owl-violet-dark text-white"
          />
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking, isTasker }: { booking: any; isTasker: boolean }) {
  const status = booking.status || "pending";
  return (
    <Card className="hover-lift transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">
            {booking.service_name || "Service Task"}
          </CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full border capitalize ${statusColors[status] || statusColors.pending}`}>
            {status.replace("_", " ")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground">
          {isTasker ? `Client: ${booking.client_name || "Client"}` : `Tasker: ${booking.tasker_name || "Pending"}`}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          {booking.date || "TBD"}
          <Clock className="h-4 w-4 ml-2" />
          {booking.time || "TBD"}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4" />
          {booking.location || "Location TBD"}
        </div>
        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="font-semibold text-owl-violet">
            Rs {(booking.total_cost || 0).toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {booking.estimated_hours || 0} hrs
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {status === "completed" && !isTasker && (
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <Star className="h-3 w-3 mr-1" /> Leave Review
            </Button>
          )}
          {["pending", "confirmed"].includes(status) && (
            <Button size="sm" variant="outline" className="flex-1 text-xs">
              <MessageCircle className="h-3 w-3 mr-1" /> Message
            </Button>
          )}
          {status === "pending" && isTasker && (
            <Button size="sm" className="flex-1 text-xs bg-owl-emerald hover:bg-owl-emerald/90 text-white">
              Accept
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
