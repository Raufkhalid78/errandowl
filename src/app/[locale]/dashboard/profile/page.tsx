import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"
import { PortfolioManager } from "@/components/profile/portfolio-manager"
import { getTranslations } from "next-intl/server"

export default async function ProfilePage() {
  const supabase = await createClient()
  const t = await getTranslations("Profile")

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

  let portfolioItems: any[] = []
  if (profile?.role === "tasker") {
    const { data } = await supabase
      .from("portfolio_items")
      .select("*")
      .eq("tasker_id", profile.id)
      .order("created_at", { ascending: false })
    if (data) {
      portfolioItems = data
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">{t("title")}</h3>
        <p className="text-sm text-muted-foreground">
          {t("description")}
        </p>
      </div>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[500px]">
        <ProfileForm initialProfile={profile} userEmail={user.email} />
        
        {profile?.role === "tasker" && (
          <div className="mt-8 pt-8 border-t border-border">
            <PortfolioManager taskerId={profile.id} initialItems={portfolioItems} />
          </div>
        )}
      </div>
    </div>
  )
}
