import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how ErrandOwl works — describe your task, choose a tasker, and get it done securely.",
};

const clientSteps = (t: any) => [
  { icon: "📝", title: t("step1"), desc: t("step1Desc") },
  { icon: "🦉", title: t("step2"), desc: t("step2Desc") },
  { icon: "💬", title: t("step3"), desc: t("step3Desc") },
];

const taskerSteps = (t: any) => [
  { icon: "📋", title: t("tStep1"), desc: t("tStep1Desc") },
  { icon: "🔍", title: t("tStep2"), desc: t("tStep2Desc") },
  { icon: "💪", title: t("tStep3"), desc: t("tStep3Desc") },
  { icon: "💰", title: t("tStep4"), desc: t("tStep4Desc") },
];

const faqs = (t: any) => [
  { q: t("faqs.q1"), a: t("faqs.a1") },
  { q: t("faqs.q2"), a: t("faqs.a2") },
  { q: t("faqs.q3"), a: t("faqs.a3") },
  { q: t("faqs.q4"), a: t("faqs.a4") },
  { q: t("faqs.q5"), a: t("faqs.a5") },
  { q: t("faqs.q6"), a: t("faqs.a6") },
];

export default function HowItWorksPage() {
  const t = useTranslations("HowItWorks");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative py-20 gradient-hero overflow-hidden">
          <div className="hero-orb hero-orb-1 opacity-20" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm mb-4">
              {t("ctaTitle")}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.rich('title', {
                h: (chunks) => <span className="gradient-text">{chunks}</span>
              })}
            </h1>
            <p className="text-white/60 text-lg">
              {t("subtitle")}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* For Clients */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-2xl font-bold mb-2 text-center">{t("forClients")}</h2>
            <p className="text-muted-foreground text-center mb-10">
              {t("forClientsSub")}
            </p>
            <div className="space-y-6">
              {clientSteps(t).map((step, i) => (
                <div
                  key={i}
                  className="flex gap-5 p-5 rounded-2xl border border-border/50 hover-lift transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-owl-violet text-white flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <span>{step.icon}</span> {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/services"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-owl-violet text-white font-medium hover:bg-owl-violet-dark transition-colors"
              >
                {t("browseBtn")}
              </Link>
            </div>
          </div>
        </section>

        {/* For Taskers */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-2xl font-bold mb-2 text-center">{t("forTaskers")}</h2>
            <p className="text-muted-foreground text-center mb-10">
              {t("forTaskersSub")}
            </p>
            <div className="space-y-6">
              {taskerSteps(t).map((step, i) => (
                <div
                  key={i}
                  className="flex gap-5 p-5 rounded-2xl border border-border/50 bg-card hover-lift transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-owl-amber text-white flex items-center justify-center font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1 flex items-center gap-2">
                      <span>{step.icon}</span> {step.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link
                href="/become-a-tasker"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-owl-amber text-white font-medium hover:bg-owl-amber/90 transition-colors"
              >
                {t("tCta")}
              </Link>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-2xl">
            <h2 className="text-2xl font-bold mb-8 text-center">
              {t("faqTitle")}
            </h2>
            <div className="space-y-3">
              {faqs(t).map((faq, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-border/50 overflow-hidden"
                >
                  <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm hover:bg-muted/50 transition-colors">
                    {faq.q}
                    <span className="ml-4 text-owl-violet text-lg group-open:rotate-45 transition-transform">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
