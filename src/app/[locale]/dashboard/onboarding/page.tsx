import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OnboardingWizard } from "@/components/profile/onboarding-wizard"

export const metadata = {
  title: "Complete Your Profile | ErrandOwl",
}

export default async function OnboardingPage() {
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

  // If profile is already complete, redirect to dashboard
  const isComplete = profile?.phone && profile?.location && 
    (profile.role === 'client' || (profile.role === 'tasker' && profile.cnic_url && profile.cnic_back_url && profile.cnic_status !== 'rejected'))
    
  if (isComplete) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-10">
      <OnboardingWizard profile={profile || { role: user.user_metadata?.role || 'client' }} user={user} />
    </div>
  )
}
