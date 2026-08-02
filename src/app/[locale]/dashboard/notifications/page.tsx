import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, CheckCircle, MessageCircle, Calendar, AlertCircle } from "lucide-react";
import { getTranslations } from "next-intl/server";

const iconMap: Record<string, any> = {
  booking_update: Calendar,
  new_message: MessageCircle,
  new_review: Bell,
  system: Bell,
  alert: AlertCircle,
};

const colorMap: Record<string, string> = {
  booking_update: "bg-owl-violet/10 text-owl-violet",
  new_message: "bg-blue-500/10 text-blue-500",
  new_review: "bg-owl-amber/10 text-owl-amber",
  system: "bg-owl-amber/10 text-owl-amber",
  alert: "bg-owl-rose/10 text-owl-rose",
};

import { revalidatePath } from "next/cache";

async function markAllAsRead(profileId: string) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", profileId)
    .eq("read", false);
  revalidatePath("/dashboard/notifications");
}

async function markAsRead(notificationId: string) {
  "use server";
  const supabase = await createClient();
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId);
  revalidatePath("/dashboard/notifications");
}

export default async function NotificationsPage() {
  const supabase = await createClient();
  const t = await getTranslations("Notifications");
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get profile id — notifications reference profile.id, NOT auth.uid
  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  const profileId = profile?.id;

  // Fetch notifications
  const { data: notifData } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", profileId!)
    .order("created_at", { ascending: false })
    .limit(50);

  const notifications = notifData || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
          <p className="text-muted-foreground">
            {unreadCount > 0
              ? t("unread_count", { count: unreadCount })
              : t("all_caught_up")}
          </p>
        </div>
        {unreadCount > 0 && profileId && (
          <form action={markAllAsRead.bind(null, profileId)}>
            <button type="submit" className="text-sm text-owl-violet hover:underline flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              {t("mark_all_read")}
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="glass">
          <CardContent className="flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-lg font-medium">{t("no_notifications")}</h3>
            <p className="text-muted-foreground mt-1 max-w-sm">
              {t("no_notifications_desc")}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif: any) => {
            const Icon = iconMap[notif.type] || Bell;
            const color = colorMap[notif.type] || colorMap.system;
            const cardContent = (
              <CardContent className="flex items-start gap-4 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`text-sm font-medium ${!notif.read ? "text-foreground" : "text-muted-foreground"}`}>
                      {notif.title}
                    </h3>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-owl-violet shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    {notif.body}
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(notif.created_at).toLocaleDateString("en-PK", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </CardContent>
            );

            return (
              <Card
                key={notif.id}
                className={`transition-all hover-lift ${!notif.read ? "border-owl-violet/30 bg-owl-violet/[0.02]" : ""}`}
              >
                {!notif.read ? (
                  <form action={markAsRead.bind(null, notif.id)}>
                    <button type="submit" className="w-full text-left">
                      {cardContent}
                    </button>
                  </form>
                ) : (
                  cardContent
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
