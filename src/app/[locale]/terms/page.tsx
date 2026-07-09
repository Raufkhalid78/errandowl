import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
  return {
    title: t("termsTitle") + " - ErrandOwl",
    description: "Read the ErrandOwl Pakistan terms of service and user agreement.",
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Legal" });
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

              {/* TechyDez KYC Standard Compliance */}
              <section className="mt-8 border-t border-border/50 pt-8">
                <h2 className="text-lg font-semibold mb-2">8. Business Entity & Governing Law</h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These Terms and Conditions constitute a legally binding agreement between you and <strong>TechyDez</strong> (the parent company operating ErrandOwl). Our registered business address is Jhelum, Punjab, Pakistan.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  These terms are governed by the laws of the Islamic Republic of Pakistan and you agree that the courts of Jhelum will have exclusive jurisdiction in any dispute.
                </p>
                <h3 className="font-medium text-foreground mb-2">Complaint Handling Mechanism</h3>
                <p className="text-muted-foreground leading-relaxed">
                  In order to resolve a complaint regarding our services or require support, please contact us by calling <a href="tel:+447517879333" className="text-owl-violet hover:underline">+447517879333</a> or send us an email at <a href="mailto:hello@techydez.com" className="text-owl-violet hover:underline">hello@techydez.com</a>.
                </p>
              </section>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
