import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { Link } from "@/i18n/routing"
import { ThemeSwitcher } from "@/components/layout/theme-switcher"
import { LanguageSwitcher } from "@/components/layout/language-switcher"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const role = profile?.role || user.user_metadata?.role || "client"

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="mr-6 flex items-center gap-2 group">
              <span className="text-2xl hidden sm:inline-block">🦉</span>
              <span className="font-bold text-xl tracking-tight">
                <span className="gradient-text">Errand</span>
                <span className="text-foreground">Owl</span>
              </span>
            </Link>
            <MainNav role={role} />
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden md:flex items-center border-e border-border/20 pe-4 me-2 gap-2">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>
            <NotificationBell userId={user.id} />
            <UserNav user={{ name: profile?.name || fallbackName, email: user.email!, avatar: profile?.avatar }} />
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8">
        {children}
      </main>
    </div>
  )
}
