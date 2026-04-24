import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy", description: "Read the ErrandOwl Pakistan privacy policy and data protection practices." };

export default function PrivacyPage() {
  const t = useTranslations("Legal");
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">{t("privacyTitle")}</h1>
            <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>

            <div className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("privacy.s1Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.s1Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("privacy.s2Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.s2Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("privacy.s3Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.s3Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("privacy.s4Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.s4Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("privacy.s5Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.s5Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("privacy.s6Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("privacy.s6Text")} <a href="mailto:privacy@errandowl.com.pk" className="text-owl-violet hover:underline">privacy@errandowl.com.pk</a></p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
