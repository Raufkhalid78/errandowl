import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"
import { ClientOverview } from "@/components/dashboard/client-overview"
import { TaskerOverview } from "@/components/dashboard/tasker-overview"

export default async function DashboardPage() {
  const supabase = await createClient()
  const t = await getTranslations("DashboardNav")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_id", user.id)
    .maybeSingle()

  if (!profile) {
    redirect("/login")
  }

  const role = profile.role || user.user_metadata?.role || "client"
  // For clients: need phone + location
  // For taskers: additionally need CNIC docs and cnic_status must not be rejected
  const isClientComplete = !!(profile.phone && profile.location)
  const isTaskerComplete = !!(profile.cnic_url && profile.cnic_back_url && profile.cnic_status !== 'rejected')
  const isComplete = role === "client"
    ? isClientComplete
    : role === "tasker"
    ? (isClientComplete && isTaskerComplete)
    : true // admin always complete

  if (!isComplete) {
    // Use relative redirect — Next.js middleware handles locale prefix
    redirect("/dashboard/onboarding")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">{t("overview")}</h2>
      {role === "tasker" || role === "admin" ? (
        <TaskerOverview profileId={profile.id} />
      ) : (
        <ClientOverview profileId={profile.id} />
      )}
    </div>
  )
}
