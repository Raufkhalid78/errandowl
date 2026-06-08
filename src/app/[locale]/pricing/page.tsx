import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { Button } from "@/components/ui/button"
import { Check, Star, Shield, Zap } from "lucide-react"
import { Link } from "@/i18n/routing"
import { getTranslations } from "next-intl/server"

export default async function PricingPage() {
  const t = await getTranslations("PricingPage")
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <section className="container mx-auto px-4 md:px-6 mb-16 text-center max-w-3xl">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
            {t("title")}
          </h1>
          <p className="text-xl text-muted-foreground">
            {t("subtitle")}
          </p>
        </section>

        <section className="container mx-auto px-4 md:px-6 max-w-5xl grid md:grid-cols-2 gap-8 items-start">
          {/* Basic Plan */}
          <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2">{t("basicPlan.title")}</h3>
              <p className="text-muted-foreground">{t("basicPlan.desc")}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">{t("basicPlan.price")}</span>
            </div>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-owl-emerald shrink-0" />
                <span>{t("basicPlan.f1")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-owl-emerald shrink-0" />
                <span>{t("basicPlan.f2")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-owl-emerald shrink-0" />
                <span>{t("basicPlan.f3")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-owl-emerald shrink-0" />
                <span>{t("basicPlan.f4")}</span>
              </li>
            </ul>
            <Button render={<Link href="/signup" />} className="w-full" variant="outline">
              {t("basicPlan.btn")}
            </Button>
          </div>

          {/* Elite Plan */}
          <div className="rounded-3xl border-2 border-owl-violet bg-owl-violet/5 p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-owl-violet text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
              {t("elitePlan.badge")}
            </div>
            <div className="mb-6">
              <h3 className="text-2xl font-semibold mb-2 flex items-center gap-2">
                <Star className="h-6 w-6 text-owl-amber fill-owl-amber" /> 
                {t("elitePlan.title")}
              </h3>
              <p className="text-muted-foreground">{t("elitePlan.desc")}</p>
            </div>
            <div className="mb-6">
              <span className="text-4xl font-bold">{t("elitePlan.price")}</span>
              <span className="text-muted-foreground">{t("elitePlan.month")}</span>
            </div>
            <ul className="space-y-4 mb-8 font-medium">
              <li className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-owl-violet shrink-0" />
                <span>{t("elitePlan.f1")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Star className="h-5 w-5 text-owl-amber shrink-0" />
                <span>{t("elitePlan.f2")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-owl-emerald shrink-0" />
                <span>{t("elitePlan.f3")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-owl-violet shrink-0" />
                <span>{t("elitePlan.f4")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Check className="h-5 w-5 text-owl-violet shrink-0" />
                <span>{t("elitePlan.f5")}</span>
              </li>
            </ul>
            <Button render={<Link href="/dashboard/subscription" />} className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white">
              {t("elitePlan.btn")}
            </Button>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}
