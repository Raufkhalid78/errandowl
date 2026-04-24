"use client"

import { Link } from "@/i18n/routing"

import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"

export function MainNav({
  className,
  role,
  ...props
}: React.HTMLAttributes<HTMLElement> & { role: string }) {
  const t = useTranslations("DashboardNav")
  const isTasker = role === "tasker" || role === "admin"

  return (
    <nav
      className={cn("flex items-center space-x-4 lg:space-x-6", className)}
      {...props}
    >
      <Link
        href="/dashboard"
        className="text-sm font-medium transition-colors hover:text-primary"
      >
        {t("overview")}
      </Link>
      <Link
        href={isTasker ? "/dashboard/jobs" : "/dashboard/services"}
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {isTasker ? t("openJobs") : t("services")}
      </Link>
      <Link
        href="/dashboard/bookings"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t("bookings")}
      </Link>
      <Link
        href="/dashboard/messages"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t("messages")}
      </Link>
      <Link
        href="/dashboard/notifications"
        className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        {t("notifications")}
      </Link>
    </nav>
  )
}
