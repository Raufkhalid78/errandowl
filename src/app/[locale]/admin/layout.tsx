import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { LayoutDashboard, Users, UserCheck, Grid3x3, Briefcase, Calendar, Settings, Tag, LogOut } from "lucide-react";

const sidebarLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/verification", label: "Verification Queue", icon: UserCheck },
  { href: "/admin/revenue", label: "Revenue", icon: Briefcase },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/taskers", label: "Taskers", icon: UserCheck },
  { href: "/admin/categories", label: "Categories", icon: Grid3x3 },
  { href: "/admin/bookings", label: "Bookings", icon: Calendar },
  { href: "/admin/promo-codes", label: "Promo Codes", icon: Tag },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

import { getTranslations } from "next-intl/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const t = await getTranslations("Admin");
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) redirect("/login");

  // Check if user is admin
  const { data: adminData } = await supabase.from("admins").select("*").eq("email", user.email).single();
  const { data: profile } = await supabase.from("profiles").select("role").eq("auth_id", user.id).single();

  if (!adminData && profile?.role !== "admin") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <Link href="/admin" className="flex items-center space-x-2">
            <span className="text-xl">🦉</span>
            <div>
              <span className="font-bold text-sm">
                <span className="gradient-text">Errand</span>Owl
              </span>
              <span className="block text-[10px] text-muted-foreground -mt-0.5">Admin Panel</span>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            // Map labels to keys dynamically
            const tKey = link.label === "Verification Queue" ? "verification" : 
                         link.label === "Revenue" ? "revenue" : 
                         link.label === "Promo Codes" ? "settings" : // reuse or ignore
                         link.label.toLowerCase();
            return (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <Icon className="h-4 w-4" />
                {t(tKey as any) || link.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border/50">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}
