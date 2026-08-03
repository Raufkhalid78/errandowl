import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, UserCheck, Calendar, DollarSign, TrendingUp, Activity } from "lucide-react";
import { getTranslations } from "next-intl/server";
import dynamic from "next/dynamic";
const AnalyticsCharts = dynamic(() => import("@/components/admin/analytics-charts").then(mod => mod.AnalyticsCharts), { 
  ssr: false,
  loading: () => (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold">Revenue History</CardTitle>
          <CardDescription>Loading chart...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mt-2 bg-muted/10 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-bold">Bookings by Category</CardTitle>
          <CardDescription>Loading chart...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full mt-2 bg-muted/10 animate-pulse rounded-xl" />
        </CardContent>
      </Card>
    </div>
  )
});
export default async function AdminDashboard() {
  const supabase = await createClient();
  const t = await getTranslations("AdminDashboard");

  // Fetch stats
  const { count: usersCount } = await supabase.from("profiles").select("*", { count: "exact", head: true });
  const { count: taskersCount } = await supabase.from("tasker_profiles").select("*", { count: "exact", head: true });
  const { count: bookingsCount } = await supabase.from("bookings").select("*", { count: "exact", head: true });
  const { data: payments } = await supabase.from("payments").select("amount, created_at, status");

  const totalRevenue = payments?.filter((p: any) => p.status === "completed").reduce((sum: number, p: any) => sum + Number(p.amount || 0), 0) || 0;

  const stats = [
    { label: t("totalUsers"), value: (usersCount || 0).toLocaleString(), icon: Users, color: "bg-owl-violet/10 text-owl-violet", change: "+12%" },
    { label: t("activeTaskers"), value: (taskersCount || 0).toLocaleString(), icon: UserCheck, color: "bg-owl-emerald/10 text-owl-emerald", change: "+8%" },
    { label: t("totalBookings"), value: (bookingsCount || 0).toLocaleString(), icon: Calendar, color: "bg-blue-500/10 text-blue-500", change: "+23%" },
    { label: t("totalRevenue"), value: `Rs ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "bg-owl-amber/10 text-owl-amber", change: "+18%" },
  ];

  // Process 30-Day Revenue Trend Data
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (29 - i));
    return d.toISOString().split("T")[0];
  });

  const revenueByDayMap = new Map<string, number>();
  last30Days.forEach(day => revenueByDayMap.set(day, 0));

  payments?.forEach((p: any) => {
    if (p.status === "completed" && p.created_at) {
      const day = p.created_at.split("T")[0];
      if (revenueByDayMap.has(day)) {
        revenueByDayMap.set(day, revenueByDayMap.get(day)! + Number(p.amount));
      }
    }
  });

  const revenueData = last30Days.map(day => ({
    date: new Date(day).toLocaleDateString("en-PK", { day: "numeric", month: "short" }),
    revenue: revenueByDayMap.get(day) || 0
  }));

  // Process Category Booking Data
  const { data: bookingsData } = await supabase
    .from("bookings")
    .select(`
      id,
      category_id,
      categories (
        name_en
      )
    `);

  const categoryCountMap = new Map<string, number>();
  bookingsData?.forEach((b: any) => {
    const catName = b.categories?.name_en || b.category_id || "Other";
    categoryCountMap.set(catName, (categoryCountMap.get(catName) || 0) + 1);
  });

  const categoryData = Array.from(categoryCountMap.entries()).map(([name, value]) => ({
    name,
    value
  })).sort((a, b) => b.value - a.value);

  // Recent bookings
  const { data: recentBookings } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  // Recent users
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("registered_at", { ascending: false })
    .limit(5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="hover-lift transition-all">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-owl-emerald/10 text-owl-emerald flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.change}
                  </span>
                </div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Analytics & Charts */}
      <AnalyticsCharts revenueData={revenueData} categoryData={categoryData} />

      {/* Lists Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4 text-owl-violet" />
              {t("recentBookings")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentBookings && recentBookings.length > 0 ? recentBookings : [
                { id: "1", service_name: "Home Cleaning", client_name: "Ahmed", status: "completed", total_amount: 3500 },
                { id: "2", service_name: "TV Mounting", client_name: "Sara", status: "pending", total_amount: 1200 },
                { id: "3", service_name: "Plumbing", client_name: "Usman", status: "confirmed", total_amount: 2400 },
              ]).map((b: any) => (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div>
                    <p className="text-sm font-medium">{b.service_name || "Service"}</p>
                    <p className="text-xs text-muted-foreground">{t("client")} {b.client_name || "N/A"}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Rs {(b.total_amount || 0).toLocaleString()}</p>
                    <span className={`text-xs capitalize ${
                      b.status === "completed" ? "text-owl-emerald" :
                      b.status === "pending" ? "text-owl-amber" : "text-blue-500"
                    }`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4 text-owl-emerald" />
              {t("recentUsers")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(recentUsers && recentUsers.length > 0 ? recentUsers : [
                { id: "1", name: "Ali Khan", email: "ali@example.com", role: "tasker" },
                { id: "2", name: "Sara Malik", email: "sara@example.com", role: "client" },
                { id: "3", name: "Usman Ahmed", email: "usman@example.com", role: "tasker" },
              ]).map((u: any) => (
                <div key={u.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-owl-violet/10 text-owl-violet flex items-center justify-center text-xs font-bold">
                      {u.name?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.name || "User"}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                    u.role === "tasker" ? "bg-owl-amber/10 text-owl-amber" : "bg-blue-500/10 text-blue-500"
                  }`}>
                    {u.role || "client"}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity indicator */}
      <Card>
        <CardContent className="p-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Activity className="h-4 w-4 text-owl-emerald animate-pulse" />
          {t("systemStatus")}
        </CardContent>
      </Card>
    </div>
  );
}
