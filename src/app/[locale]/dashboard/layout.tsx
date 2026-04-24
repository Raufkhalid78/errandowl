import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { headers } from "next/headers"
import { MainNav } from "@/components/dashboard/main-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { NotificationBell } from "@/components/dashboard/notification-bell"
import { Link } from "@/i18n/routing"

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

  // Fetch the user's profile to get their role and name
  // Note: We're assuming a 'profiles' table exists based on our plan
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  const fallbackName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const role = profile?.role || user.user_metadata?.role || "client"

  // Get current path to avoid infinite redirect
  // Removed layout-level redirect because it causes infinite loops in Next.js App Router
  // We should protect individual pages instead.

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              <span className="hidden font-bold sm:inline-block">
                ErrandOwl
              </span>
            </Link>
            <MainNav role={role} />
          </div>
          <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
            <div className="w-full flex-1 md:w-auto md:flex-none">
              {/* Optional: Add search bar here */}
            </div>
            <div className="flex items-center">
              <NotificationBell userId={user.id} />
              <UserNav user={{ name: profile?.name || fallbackName, email: user.email!, avatar: profile?.avatar }} />
            </div>
          </div>
        </div>
      </header>
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  )
}
