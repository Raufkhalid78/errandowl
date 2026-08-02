import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Star, TrendingUp, CheckCircle, Clock } from "lucide-react"

export default async function PerformancePage() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role, wallet_balance")
    .eq("auth_id", user.id)
    .single()

  if (!profile || (profile.role !== "tasker" && profile.role !== "admin")) {
    redirect("/dashboard")
  }

  const { data: taskerProfile } = await supabase
    .from("tasker_profiles")
    .select("rating_avg, review_count")
    .eq("profile_id", profile.id)
    .single()

  const { data: bookings } = await supabase
    .from("bookings")
    .select("status, estimated_hours, pricing_mode, created_at, scheduled_at")
    .eq("tasker_id", profile.id)

  const completedBookings = bookings?.filter(b => b.status === 'completed') || []
  const totalCompleted = completedBookings.length
  const totalEarnings = profile.wallet_balance || 0 // Assuming wallet holds total earnings minus payouts

  const completionRate = bookings && bookings.length > 0 
    ? Math.round((totalCompleted / bookings.length) * 100) 
    : 0

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Performance Dashboard</h2>
        <p className="text-muted-foreground">Monitor your metrics, ratings, and earnings.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-owl-orange" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskerProfile?.rating_avg?.toFixed(1) || "New"}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Based on {taskerProfile?.review_count || 0} reviews
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <TrendingUp className="h-4 w-4 text-owl-emerald" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Rs {totalEarnings.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Current wallet balance
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Jobs Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-owl-violet" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of {bookings?.length || 0} total jobs
            </p>
          </CardContent>
        </Card>

        <Card className="glass">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Jobs completed successfully
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Chart Placeholder */}
      <Card className="glass">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your completed jobs and earnings over time</CardDescription>
        </CardHeader>
        <CardContent>
          {completedBookings.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No completed jobs yet. Keep applying to tasks to build your stats!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {completedBookings.slice(0, 5).map((booking, i) => (
                <div key={i} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div>
                    <p className="font-medium">Job Completed</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(booking.scheduled_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="font-bold text-owl-emerald">
                    Completed
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
