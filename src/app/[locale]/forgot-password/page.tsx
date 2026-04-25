import { Link } from "@/i18n/routing";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import type { Metadata } from "next";
import { useTranslations } from "next-intl";

export const metadata: Metadata = { title: "Forgot Password" };

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24 flex items-center justify-center py-16">
        <div className="w-full max-w-md mx-auto px-4">
          <div className="text-center mb-8">
            <span className="text-4xl mb-4 block">🦉</span>
            <h1 className="text-2xl font-bold">{t("title")}</h1>
            <p className="text-sm text-muted-foreground mt-2">{t("subtitle")}</p>
          </div>
          <form className="space-y-4">
            <div>
              <label className="text-sm font-medium block mb-1.5">{t("emailLabel")}</label>
              <input type="email" required placeholder={t("emailPlaceholder")} className="w-full px-3 py-2.5 rounded-xl border border-border text-sm bg-background focus:border-owl-violet focus:outline-none" />
            </div>
            <button type="submit" className="w-full py-2.5 rounded-xl bg-owl-violet text-white font-medium hover:bg-owl-violet-dark transition-colors">{t("submitBtn")}</button>
          </form>
          <p className="text-center text-sm mt-6">
            <Link href="/login" className="text-owl-violet hover:underline">{t("backToLogin")}</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}
