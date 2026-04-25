"use client"

import { useState } from "react"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { useTranslations } from "next-intl"
import { Menu, X } from "lucide-react"

export function MainNav({
  className,
  role,
  ...props
}: React.HTMLAttributes<HTMLElement> & { role: string }) {
  const t = useTranslations("DashboardNav")
  const isTasker = role === "tasker" || role === "admin"
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { href: "/dashboard", label: t("overview") },
    { href: isTasker ? "/dashboard/jobs" : "/dashboard/services", label: isTasker ? t("openJobs") : t("services") },
    { href: "/dashboard/bookings", label: t("bookings") },
    { href: "/dashboard/messages", label: t("messages") },
    { href: "/dashboard/notifications", label: t("notifications") },
  ]

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 -ml-2 mr-2 text-muted-foreground hover:bg-muted rounded-lg"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Desktop Nav */}
      <nav
        className={cn("hidden md:flex items-center space-x-4 lg:space-x-6", className)}
        {...props}
      >
        {navLinks.map(link => (
          <Link
            key={link.href}
            href={link.href as any}
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Mobile Nav (Dropdown) */}
      {isOpen && (
        <div className="absolute top-16 left-0 right-0 p-4 bg-background border-b shadow-lg md:hidden z-50 animate-in slide-in-from-top-2">
          <nav className="flex flex-col space-y-3">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href as any}
                onClick={() => setIsOpen(false)}
                className="text-sm font-medium p-2 hover:bg-muted rounded-md transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </>
  )
}
