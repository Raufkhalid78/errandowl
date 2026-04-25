import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { getTranslations } from "next-intl/server"

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ bookingId: string }>
}) {
  const supabase = await createClient()
  const t = await getTranslations("Checkout")

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  const { bookingId } = await params

  // Fetch booking details
  const { data: booking } = await supabase
    .from("bookings")
    .select("*, services!service_id(name, starting_price)")
    .eq("id", bookingId)
    .single()

  // Calculate amount based on estimated hours or starting price
  const estimatedAmount = booking?.estimated_hours ? booking.estimated_hours * 1500 : 1500

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{t("title")}</h2>
        <p className="text-muted-foreground">
          {t("description")}
        </p>
      </div>

      <div className="max-w-md">
        <CheckoutForm bookingId={bookingId} amount={estimatedAmount} />
      </div>
    </div>
  )
}
