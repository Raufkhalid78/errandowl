"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useRouter, Link } from "@/i18n/routing";

interface NotificationBellProps {
  userId: string;
}

import { useTranslations } from "next-intl";

export function NotificationBell({ userId }: NotificationBellProps) {
  const t = useTranslations("Notifications");
  const [unreadCount, setUnreadCount] = useState(0);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    // Initial fetch
    const fetchUnread = async () => {
      const { count } = await supabase
        .from("notifications")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("read", false);
      if (count !== null) setUnreadCount(count);
    };

    fetchUnread();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("notifications-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // If marked as read
          if (payload.new.read === true && payload.old.read === false) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase]);

  return (
    <Link
      href="/dashboard/notifications"
      className="relative w-9 h-9 rounded-full mr-2 hover:bg-muted/50 flex items-center justify-center transition-colors"
    >
      <Bell className="h-5 w-5 text-muted-foreground" />
      {unreadCount > 0 && (
        <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-owl-violet opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-owl-violet"></span>
        </span>
      )}
      <span className="sr-only">{t("title")}</span>
    </Link>
  );
}
