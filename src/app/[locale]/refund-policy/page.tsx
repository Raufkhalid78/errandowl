import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { useTranslations } from "next-intl";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Refund Policy", description: "ErrandOwl Pakistan refund and cancellation policy." };

export default function RefundPolicyPage() {
  const t = useTranslations("Legal");
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6 max-w-3xl">
            <h1 className="text-3xl font-bold mb-2">{t("refundTitle")}</h1>
            <p className="text-sm text-muted-foreground mb-8">{t("lastUpdated")}</p>
            <div className="prose prose-sm max-w-none space-y-6">
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("refund.s1Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("refund.s1Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("refund.s2Title")}</h2>
                <ul className="list-disc pl-5 text-muted-foreground space-y-1 text-sm">
                  <li>{t("refund.s2L1")}</li>
                  <li>{t("refund.s2L2")}</li>
                  <li>{t("refund.s2L3")}</li>
                  <li>{t("refund.s2L4")}</li>
                </ul>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("refund.s3Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("refund.s3Text")}</p>
              </section>
              <section>
                <h2 className="text-lg font-semibold mb-2">{t("refund.s4Title")}</h2>
                <p className="text-muted-foreground leading-relaxed">{t("refund.s4Text")}</p>
              </section>
              <section className="mt-8 border-t border-border/50 pt-8">
                <h3 className="font-medium text-foreground mb-2">Contact Us</h3>
                <p className="text-muted-foreground leading-relaxed">
                  To request a refund or if you have any questions about our Refund Policy, please contact us:
                  <br /><br />
                  <strong>Phone:</strong> <a href="tel:+447517879333" className="text-owl-violet hover:underline">+447517879333</a><br />
                  <strong>Email:</strong> <a href="mailto:hello@techydez.com" className="text-owl-violet hover:underline">hello@techydez.com</a><br />
                  <strong>Address:</strong> TechyDez, Jhelum, Punjab, Pakistan
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
