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
    .select("*, profiles!client_id(name, avatar_url)")
    .eq("status", "pending")
    .is("tasker_id", null)
    .order("created_at", { ascending: false })

  const openJobs = openJobsData || []

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="grid gap-6">
        {openJobs.length > 0 ? (
          <JobsList jobs={openJobs} />
        ) : (
          <div className="text-center py-16 border border-dashed rounded-2xl">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="font-medium mb-2">No open jobs right now</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new opportunities in your area.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
