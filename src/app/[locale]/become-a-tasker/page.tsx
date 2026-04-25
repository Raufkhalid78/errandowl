import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BecomeTasker" });
  return {
    title: t("badge") + " - ErrandOwl",
    description: "Earn money on your own schedule. Join ErrandOwl Pakistan as a tasker today.",
  };
}

const benefits = (t: any) => [
  { icon: "🕐", title: t("benefits.b1"), desc: t("benefits.b1Desc") },
  { icon: "💰", title: t("benefits.b2"), desc: t("benefits.b2Desc") },
  { icon: "📈", title: t("benefits.b3"), desc: t("benefits.b3Desc") },
];

export default async function BecomeATaskerPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BecomeTasker" });
  const th = await getTranslations({ locale, namespace: "HowItWorks" });

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-20 gradient-hero overflow-hidden">
          <div className="hero-orb hero-orb-1 opacity-20" />
          <div className="hero-orb hero-orb-2 opacity-20" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center max-w-3xl">
            <span className="inline-block px-3 py-1 rounded-full bg-owl-amber/20 text-owl-amber text-sm font-medium mb-4">{t("badge")}</span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.rich('title', {
                h: (chunks) => <span className="gradient-text">{chunks}</span>
              })}
            </h1>
            <p className="text-white/60 text-lg mb-8">{t("subtitle")}</p>
            <Link href="/signup?role=tasker" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-owl-amber text-white font-semibold hover:bg-owl-amber/90 shadow-lg shadow-owl-amber/30 transition-all text-lg">
              {t("ctaButton")} →
            </Link>
            <div className="flex justify-center gap-8 mt-10 text-white/60 text-sm">
              <span>{t("freeToJoin")}</span>
              <span>{t("keep85")}</span>
              <span>{t("noCommitments")}</span>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-4xl">
            <h2 className="text-2xl font-bold text-center mb-10">{t("benefitsTitle")}</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {benefits(t).map((b) => (
                <div key={b.title} className="p-6 rounded-2xl border border-border/50 hover-lift transition-all">
                  <span className="text-3xl mb-3 block">{b.icon}</span>
                  <h3 className="font-semibold mb-2">{b.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-2xl text-center">
            <div className="space-y-6 text-left mt-8">
              {[
                { n: 1, title: th("tStep1"), desc: th("tStep1Desc") },
                { n: 2, title: th("tStep2"), desc: th("tStep2Desc") },
                { n: 3, title: th("tStep3"), desc: th("tStep3Desc") },
                { n: 4, title: th("tStep4"), desc: th("tStep4Desc") },
              ].map((s) => (
                <div key={s.n} className="flex gap-4 p-5 rounded-2xl border border-border/50 bg-card">
                  <div className="w-10 h-10 rounded-xl bg-owl-violet text-white flex items-center justify-center font-bold shrink-0">{s.n}</div>
                  <div>
                    <h3 className="font-semibold mb-1">{s.title}</h3>
                    <p className="text-sm text-muted-foreground">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/signup?role=tasker" className="inline-flex items-center gap-2 px-8 py-3 mt-8 rounded-xl bg-owl-violet text-white font-medium hover:bg-owl-violet-dark transition-colors">
              {t("ctaButton")} →
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
