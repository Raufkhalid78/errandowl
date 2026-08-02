import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Shield, Zap, Check } from "lucide-react"
import { getTranslations } from "next-intl/server"

export default async function SubscriptionDashboardPage() {
  const t = await getTranslations("SubscriptionDashboard")
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("auth_id", user.id)
    .single()

  if (profile?.role !== "tasker") {
    redirect("/dashboard")
  }

  // Check active subscription
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("profile_id", profile.id)
    .eq("status", "active")
    .maybeSingle()

  // For this mockup phase, we'll create a simple client component that simulates subscribing
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">{t("subtitle")}</p>
      </div>

      {subscription ? (
        <Card className="border-2 border-owl-violet bg-owl-violet/5">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl text-owl-violet">
                  <Star className="h-6 w-6 fill-owl-amber text-owl-amber" /> 
                  {t("elitePlan")}
                </CardTitle>
                <CardDescription className="mt-2 text-base">
                  {t("eliteDesc")}
                </CardDescription>
              </div>
              <div className="bg-owl-emerald/20 text-owl-emerald px-3 py-1 rounded-full text-sm font-semibold">
                {t("active")}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-owl-violet/10">
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("currentPlan")}</p>
                <p className="font-medium capitalize">{subscription.plan_type || "Pro"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("billingCycle")}</p>
                <p className="font-medium">{t("monthly")}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("nextPayment")}</p>
                <p className="font-medium">{new Date(subscription.current_period_end as string).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t("paymentMethod")}</p>
                <p className="font-medium">•••• 4242</p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex gap-4">
            <Button variant="outline" className="w-full sm:w-auto">{t("updatePayment")}</Button>
            <Button variant="destructive" className="w-full sm:w-auto">{t("cancelSub")}</Button>
          </CardFooter>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-muted bg-muted/30">
            <CardHeader>
              <CardTitle>{t("basicTitle")}</CardTitle>
              <CardDescription>{t("basicDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">{t("free")}</div>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2"><Check className="h-4 w-4 text-owl-emerald" /> {t("stdVis")}</li>
                <li className="flex items-center gap-2 text-muted-foreground"><Check className="h-4 w-4" /> {t("stdComm")}</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-owl-violet shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-owl-violet text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              {t("upgradeBadge")}
            </div>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-owl-amber fill-owl-amber" /> {t("elitePlanTitle")}
              </CardTitle>
              <CardDescription>{t("elitePlanDesc")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-6">{t("price")}<span className="text-sm font-normal text-muted-foreground">{t("mo")}</span></div>
              <ul className="space-y-3 text-sm font-medium">
                <li className="flex items-center gap-2"><Zap className="h-4 w-4 text-owl-violet" /> {t("priority")}</li>
                <li className="flex items-center gap-2"><Shield className="h-4 w-4 text-owl-emerald" /> {t("noComm")}</li>
                <li className="flex items-center gap-2"><Star className="h-4 w-4 text-owl-amber" /> {t("eliteBadge")}</li>
              </ul>
            </CardContent>
            <CardFooter>
              {/* Note: This will be connected to Stripe/Payfast later */}
              <form action={async () => {
                "use server"
                // Simulate subscription
                const supabaseServer = await createClient()
                const { data: { user: currentUser } } = await supabaseServer.auth.getUser()
                if (!currentUser) return
                
                const { data: userProfile } = await supabaseServer
                  .from("profiles")
                  .select("id")
                  .eq("auth_id", currentUser.id)
                  .single()

                if (!userProfile) return

                // Update profile to elite
                await supabaseServer.from("tasker_profiles").update({ elite: true }).eq("profile_id", userProfile.id)
                
                // Create sub record
                const end = new Date()
                end.setMonth(end.getMonth() + 1)
                await supabaseServer.from("subscriptions").insert({
                  profile_id: userProfile.id,
                  plan_type: "pro",
                  status: "active",
                  current_period_end: end.toISOString(),
                })
                redirect("/dashboard/subscription")
              }}>
                <Button className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white">{t("subscribeBtn")}</Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  )
}
