import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms of Service", description: "Read the ErrandOwl Pakistan terms of service and user agreement." };

export default function TermsPage() {
  const t = useTranslations("Legal");
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">{t("termsTitle")}</h1>
            <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>

            <div className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("terms.s1Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("terms.s1Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("terms.s2Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("terms.s2Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("terms.s3Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("terms.s3Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("terms.s4Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("terms.s4Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("terms.s5Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("terms.s5Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("terms.s6Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("terms.s6Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("terms.s7Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("terms.s7Text")} <a href="mailto:legal@errandowl.com.pk" className="text-owl-violet hover:underline">legal@errandowl.com.pk</a></p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
