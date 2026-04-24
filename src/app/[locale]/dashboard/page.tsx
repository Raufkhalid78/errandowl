import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

import { ClientOverview } from "@/components/dashboard/client-overview"
import { TaskerOverview } from "@/components/dashboard/tasker-overview"

export default async function DashboardPage() {
  const supabase = await createClient()

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

  const role = profile?.role || user.user_metadata?.role || "client"
  const isComplete = profile?.phone && profile?.location && 
    (role === 'client' || (role === 'tasker' && profile.cnic_url && profile.cnic_back_url))

  if (!isComplete) {
    redirect("/dashboard/onboarding")
  }

  return (
    <div className="space-y-4">
      <h2 className="text-3xl font-bold tracking-tight">Overview</h2>
      {role === "tasker" || role === "admin" ? (
        <TaskerOverview />
      ) : (
        <ClientOverview />
      )}
    </div>
  )
}
