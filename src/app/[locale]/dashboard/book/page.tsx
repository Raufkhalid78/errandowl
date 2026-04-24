import { createClient } from "@/lib/supabase/server"
import { BookingForm } from "@/components/booking/booking-form"
import { redirect } from "next/navigation"

export default async function BookPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Await searchParams before using it
  const sp = await searchParams;
  const categoryId = sp.category as string || "cat-1"

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Book a Tasker</h2>
        <p className="text-muted-foreground">
          Fill out the details below to request a service.
        </p>
      </div>

      <div className="max-w-2xl">
        <BookingForm categoryId={categoryId} userId={user.id} />
      </div>
    </div>
  )
}
