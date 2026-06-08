import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { getTranslations } from "next-intl/server"

export async function ClientOverview({ profileId }: { profileId: string }) {
  const supabase = await createClient()
  const t = await getTranslations("DashboardOverview")

  // Fetch active bookings
  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("client_id", profileId)
    .in("status", ["pending", "accepted", "in_progress"])

  // Fetch total spent
  const { data: pastBookings } = await supabase
    .from("bookings")
    .select("total_cost")
    .eq("client_id", profileId)
    .eq("payment_status", "paid")

  const activeCount = activeBookings?.length || 0
  const totalSpent = pastBookings?.reduce((sum, b) => sum + (b.total_cost || 0), 0) || 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("activeBookings")}
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-owl-violet"
          >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeCount}</div>
          <p className="text-xs text-muted-foreground">
            {t("tasksInProgress")}
          </p>
        </CardContent>
      </Card>
      <Card className="glass">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t("totalSpent")}
          </CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Rs {totalSpent.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {t("lifetimeSpending")}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
