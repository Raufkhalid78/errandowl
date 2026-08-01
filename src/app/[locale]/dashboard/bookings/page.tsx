import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { createNotification } from "@/lib/notifications";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, MapPin, Star, MessageCircle, Repeat } from "lucide-react";
import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";

const statusColors: Record<string, string> = {
  pending: "bg-owl-amber/10 text-owl-amber border-owl-amber/20",
  confirmed: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  in_progress: "bg-owl-violet/10 text-owl-violet border-owl-violet/20",
  completed: "bg-owl-emerald/10 text-owl-emerald border-owl-emerald/20",
  cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

async function updateBookingStatus(bookingId: string, status: string) {
  "use server";
  const supabase = await createClient();
  await supabase.from("bookings").update({ status }).eq("id", bookingId);

  // Notify other party
  const { data: booking } = await supabase.from("bookings").select("client_id, tasker_id").eq("id", bookingId).single();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (booking && user) {
    const { data: profile } = await supabase.from("profiles").select("id").eq("auth_id", user.id).single();
    if (profile) {
      const recipientId = booking.client_id === profile.id ? booking.tasker_id : booking.client_id;
      if (recipientId) {
        await createNotification({
          userId: recipientId,
          type: "booking_update",
          title: "Booking Updated",
          body: `The booking status was updated to ${status.replace("_", " ")}.`,
          link: `/dashboard/bookings/${bookingId}`
        });
      }
    }
  }

  revalidatePath("/dashboard/bookings");
}

export default async function BookingsPage() {
  const supabase = await createClient();
  const t = await getTranslations("DashboardBookings");

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch profile to get real profile.id and role
  const { data: profile } = await supabase.from("profiles").select("id, role").eq("auth_id", user.id).single();
  const profileId = profile?.id;
  const role = profile?.role || "client";

  // Fetch bookings
  const isTasker = role === "tasker" || role === "admin";
  let bookings: any[] = [];

  if (isTasker) {
    const { data } = await supabase.from("bookings").select("*").eq("tasker_id", profileId).order("created_at", { ascending: false });
    bookings = data || [];
  } else {
    const { data } = await supabase.from("bookings").select("*").eq("client_id", profileId).order("created_at", { ascending: false });
    bookings = data || [];
  }

  // Group by status
  const active = bookings.filter((b) => ["pending", "confirmed", "in_progress"].includes(b.status));
  const past = bookings.filter((b) => ["completed", "cancelled"].includes(b.status));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">
            {isTasker ? t("taskerDesc") : t("clientDesc")}
          </p>
        </div>
        {!isTasker && (
          <Button
            render={<Link href="/dashboard/services" />}
            className="bg-owl-violet hover:bg-owl-violet-dark text-white"
          >
            {t("bookNewTask")}
          </Button>
        )}
      </div>

      {/* Active Bookings */}
      {active.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-owl-violet animate-pulse" />
            {t("active")} ({active.length})
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
            {t("pastBookings")} ({past.length})
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
          <h3 className="font-medium mb-2">{t("noBookingsYet")}</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isTasker ? t("browseTaskerDesc") : t("browseClientDesc")}
          </p>
          <Button
            render={<Link href={isTasker ? "/dashboard/jobs" : "/dashboard/services"} />}
            className="bg-owl-violet hover:bg-owl-violet-dark text-white"
          >
            {isTasker ? t("browseJobs") : t("browseServices")}
          </Button>
        </div>
      )}
    </div>
  );
}

async function BookingCard({ booking, isTasker }: { booking: any; isTasker: boolean }) {
  const t = await getTranslations("DashboardBookings");
  const status = booking.status || "pending";
  return (
    <Card className="hover-lift transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-base truncate pr-2">
            {booking.service_name || t("serviceTask")}
          </CardTitle>
          <span className={`text-xs px-2 py-1 rounded-full border shrink-0 capitalize ${statusColors[status] || statusColors.pending}`}>
            {status.replace("_", " ")}
          </span>
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {isTasker 
            ? t("client", { name: booking.client_name || "Client" }) 
            : t("tasker", { name: booking.tasker_name || "Pending" })}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4 shrink-0" />
          <span className="truncate">
            {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleDateString() : "TBD"}
          </span>
          <Clock className="h-4 w-4 ml-2 shrink-0" />
          <span className="truncate">
            {booking.scheduled_at ? new Date(booking.scheduled_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"}
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{booking.address || t("locationTbd")}</span>
        </div>

        {booking.recurrence_pattern && booking.recurrence_pattern !== 'none' && (
          <div className="flex items-center gap-2 text-xs font-medium text-owl-violet bg-owl-violet/10 w-fit px-2 py-1 rounded-md mt-1">
            <Repeat className="h-3 w-3 shrink-0" />
            <span className="capitalize">{booking.recurrence_pattern} Booking</span>
          </div>
        )}

        <div className="flex items-center justify-between pt-3 border-t border-border/50">
          <span className="font-semibold text-owl-violet">
            Rs {(booking.total_amount || 0).toLocaleString()}
          </span>
          <span className="text-xs text-muted-foreground">
            {booking.estimated_hours || 0} hrs
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {booking.tasker_id && booking.payment_status === "unpaid" && !isTasker && (
            <Button size="sm" className="flex-1 text-xs bg-owl-emerald hover:bg-owl-emerald/90 text-white" render={<Link href={`/dashboard/checkout/${booking.id}`} />}>
              {t("payNow")}
            </Button>
          )}
          {status === "completed" && !isTasker && (
            <Button size="sm" variant="outline" className="flex-1 text-xs" render={<Link href={`/tasker/${booking.tasker_id}#reviews`} />}>
              <Star className="h-3 w-3 mr-1" /> {t("review")}
            </Button>
          )}
          {["pending", "confirmed", "in_progress"].includes(status) && booking.tasker_id && (
            <Button size="sm" variant="outline" className="flex-1 text-xs" render={<Link href={`/dashboard/messages?booking=${booking.id}`} />}>
              <MessageCircle className="h-3 w-3 mr-1" /> {t("message")}
            </Button>
          )}
          {status === "pending" && !booking.tasker_id && !isTasker && (
            <Button size="sm" className="flex-1 text-xs bg-owl-violet hover:bg-owl-violet-dark text-white" render={<Link href={`/dashboard/bookings/${booking.id}`} />}>
              Review Bids
            </Button>
          )}
          {status === "completed" && (
            <Button size="sm" variant="outline" className="flex-1 text-xs" render={<Link href={`/dashboard/bookings/${booking.id}`} />}>
              View Details
            </Button>
          )}
          {status === "pending" && isTasker && (
            <form action={updateBookingStatus.bind(null, booking.id, "confirmed")} className="flex-1">
              <Button type="submit" size="sm" className="w-full text-xs bg-owl-emerald hover:bg-owl-emerald/90 text-white">
                {t("accept")}
              </Button>
            </form>
          )}
          {status === "pending" && isTasker && (
            <form action={updateBookingStatus.bind(null, booking.id, "cancelled")} className="flex-none">
              <Button type="submit" size="sm" variant="outline" className="text-xs text-destructive hover:bg-destructive/10">
                {t("reject")}
              </Button>
            </form>
          )}
          {status === "confirmed" && isTasker && (
            <form action={updateBookingStatus.bind(null, booking.id, "in_progress")} className="flex-1">
              <Button type="submit" size="sm" className="w-full text-xs bg-blue-500 hover:bg-blue-600 text-white">
                {t("startJob")}
              </Button>
            </form>
          )}
          {status === "in_progress" && isTasker && (
            <form action={updateBookingStatus.bind(null, booking.id, "completed")} className="flex-1">
              <Button type="submit" size="sm" className="w-full text-xs bg-owl-violet hover:bg-owl-violet-dark text-white">
                {t("complete")}
              </Button>
            </form>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
