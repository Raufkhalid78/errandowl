import { createClient } from "@/lib/supabase/server"
import { BookingForm } from "@/components/booking/booking-form"
import { redirect } from "next/navigation"
import { getTranslations } from "next-intl/server"

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()
  const t = await getTranslations("DashboardBookPage")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Await searchParams before using it
  const sp = await searchParams;
  const categoryId = sp.category as string || "cat-1"
  const taskerId = sp.tasker as string | undefined

  let taskerDetails: { name: string, hourlyRate: number } | null = null
  if (taskerId) {
    const { data } = await supabase
      .from("profiles")
      .select("name, tasker_profiles!inner(hourly_rate)")
      .eq("id", taskerId)
      .single()

    if (data) {
      taskerDetails = {
        name: data.name,
        hourlyRate: Array.isArray(data.tasker_profiles) ? (data.tasker_profiles[0] as any)?.hourly_rate : (data.tasker_profiles as any)?.hourly_rate
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {taskerDetails ? t("bookTasker", { name: taskerDetails.name }) : t("postJob")}
        </h2>
        <p className="text-muted-foreground">
          {taskerDetails ? t("bookTaskerDesc") : t("postJobDesc")}
        </p>
      </div>

      <div className="max-w-2xl">
        <BookingForm 
          categoryId={categoryId} 
          userId={user.id} 
          taskerId={taskerId} 
          taskerRate={taskerDetails?.hourlyRate} 
        />
      </div>
    </div>
  )
}
