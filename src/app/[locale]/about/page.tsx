import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about ErrandOwl's mission to connect people with skilled taskers for everyday needs across Pakistan.",
};

const stats = (t: any) => [
  { value: "10K+", label: "Happy Customers" },
  { value: "500+", label: "Trusted Taskers" },
  { value: "15K+", label: "Tasks Completed" },
  { value: "4.9★", label: "Average Rating" },
];

const values = [
  {
    icon: "🤝",
    title: "Trust & Safety",
    desc: "Every tasker is background-checked and CNIC-verified. Your safety is our top priority.",
  },
  {
    icon: "⚡",
    title: "Speed & Reliability",
    desc: "Same-day availability for most services in major Pakistani cities.",
  },
  {
    icon: "💰",
    title: "Fair Pricing",
    desc: "Transparent pricing with no hidden fees. You agree on the price before booking.",
  },
  {
    icon: "🌍",
    title: "Community Impact",
    desc: "We're empowering local workers to build sustainable careers and serve their communities.",
  },
];

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative py-20 gradient-hero overflow-hidden">
          <div className="hero-orb hero-orb-1 opacity-20" />
          <div className="hero-orb hero-orb-2 opacity-20" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.rich('title', {
                h: (chunks) => <span className="gradient-text">{chunks}</span>
              })}
            </h1>
            <p className="text-white/60 text-lg max-w-xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        {/* Mission */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <div className="glass-card rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span className="text-2xl">🦉</span> {t("mission")}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                {t("missionText1")}
              </p>
              <p className="text-muted-foreground leading-relaxed">
                {t("missionText2")}
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-xl font-bold mb-8 text-center">📊 By the Numbers</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              {stats(t).map((s) => (
                <div key={s.label}>
                  <div className="text-3xl font-bold gradient-text">{s.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h2 className="text-xl font-bold mb-8 text-center">💡 Our Values</h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((v) => (
                <div
                  key={v.title}
                  className="p-6 rounded-2xl border border-border/50 hover-lift transition-all"
                >
                  <span className="text-3xl mb-3 block">{v.icon}</span>
                  <h3 className="font-semibold mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {v.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl text-center">
            <h2 className="text-xl font-bold mb-6">{t("visitTitle")}</h2>
            <div className="glass-card rounded-2xl p-8">
              <p className="font-semibold mb-2">{t("hq")}</p>
              <p className="text-muted-foreground text-sm mb-4">
                {t("address")}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm">
                <span>
                  <strong>{t("phone")}</strong>{" "}
                  <a href="tel:+923001234567" className="text-owl-violet hover:underline">
                    +92 300 1234 567
                  </a>
                </span>
                <span>
                  <strong>{t("email")}</strong>{" "}
                  <a href="mailto:support@errandowl.com.pk" className="text-owl-violet hover:underline">
                    support@errandowl.com.pk
                  </a>
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
