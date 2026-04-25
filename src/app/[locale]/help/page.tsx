import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Help" });
  return {
    title: t("titlePlain") + " - ErrandOwl",
    description: "Get help with ErrandOwl — FAQs, contact support, and troubleshooting guides.",
  };
}

export default async function HelpPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Help" });

  const faqSections = [
    {
      title: t("forClients"),
      items: [
        { q: t("faqs.clientQ1"), a: t("faqs.clientA1") },
        { q: t("faqs.clientQ2"), a: t("faqs.clientA2") },
        { q: t("faqs.clientQ3"), a: t("faqs.clientA3") },
        { q: t("faqs.clientQ4"), a: t("faqs.clientA4") },
        { q: t("faqs.clientQ5"), a: t("faqs.clientA5") },
      ],
    },
    {
      title: t("forTaskers"),
      items: [
        { q: t("faqs.taskerQ1"), a: t("faqs.taskerA1") },
        { q: t("faqs.taskerQ2"), a: t("faqs.taskerA2") },
        { q: t("faqs.taskerQ3"), a: t("faqs.taskerA3") },
        { q: t("faqs.taskerQ4"), a: t("faqs.taskerA4") },
      ],
    },
    {
      title: t("accountSecurity"),
      items: [
        { q: t("faqs.accountQ1"), a: t("faqs.accountA1") },
        { q: t("faqs.accountQ2"), a: t("faqs.accountA2") },
        { q: t("faqs.accountQ3"), a: t("faqs.accountA3") },
      ],
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="relative py-16 gradient-hero overflow-hidden">
          <div className="hero-orb hero-orb-1 opacity-20" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.rich('title', {
                h: (chunks) => <span className="gradient-text">{chunks}</span>
              })}
            </h1>
            <p className="text-white/60 text-lg">{t("subtitle")}</p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl space-y-12">
            {faqSections.map((section) => (
              <div key={section.title}>
                <h2 className="text-xl font-bold mb-4">{section.title}</h2>
                <div className="space-y-3">
                  {section.items.map((faq, i) => (
                    <details key={i} className="group rounded-xl border border-border/50 overflow-hidden">
                      <summary className="flex items-center justify-between p-5 cursor-pointer font-medium text-sm hover:bg-muted/50 transition-colors">
                        {faq.q}
                        <span className="ml-4 text-owl-violet text-lg group-open:rotate-45 transition-transform">+</span>
                      </summary>
                      <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</div>
                    </details>
                  ))}
                </div>
              </div>
            ))}

            {/* Contact */}
            <div className="glass-card rounded-2xl p-8 text-center">
              <h2 className="text-lg font-bold mb-2">{t("stillNeedHelp")}</h2>
              <p className="text-sm text-muted-foreground mb-4">{t("supportDesc")}</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
                <a href="mailto:support@errandowl.com.pk" className="px-6 py-3 rounded-xl bg-owl-violet text-white hover:bg-owl-violet-dark transition-colors">
                  {t("emailBtn")}
                </a>
                <a href="tel:+923001234567" className="px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors">
                  {t("callBtn")}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
