import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ProfileForm } from "@/components/profile/profile-form"
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
      </div>
    </div>
  )
}
