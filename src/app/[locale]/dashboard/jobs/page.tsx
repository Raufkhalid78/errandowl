import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { JobsList } from "@/components/dashboard/jobs-list"
import { getTranslations } from "next-intl/server"

export default async function JobsPage() {
  const supabase = await createClient()
  const t = await getTranslations("DashboardJobs")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Fetch all open bookings (status = 'pending')
  // In a real app, you might filter by tasker's skills/categories
  const { data: openJobsData } = await supabase
    .from("bookings")
    .select("*, profiles!client_id(name, avatar)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Fallback mock data if DB is empty for demonstration
  const openJobs = openJobsData && openJobsData.length > 0 ? openJobsData : [
    {
      id: "mock-1",
      description: "Need help assembling an IKEA wardrobe. Should take about 2 hours.",
      location: "DHA Phase 5, Lahore",
      date: "2026-05-10",
      time: "14:00",
      estimated_hours: 2,
      profiles: { name: "Ahmed R.", avatar: "" }
    },
    {
      id: "mock-2",
      description: "Deep cleaning for a 3-bedroom apartment before moving in.",
      location: "Gulberg III, Lahore",
      date: "2026-05-12",
      time: "09:00",
      estimated_hours: 4,
      profiles: { name: "Sara K.", avatar: "" }
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6">
        <JobsList jobs={openJobs} />
      </div>
    </div>
  )
}
