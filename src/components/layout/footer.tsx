"use client";

import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const footerLinks = (t: any) => ({
  company: [
    { href: "/about", label: t("links.aboutUs") },
    { href: "/how-it-works", label: t("links.howItWorks") },
    { href: "/become-a-tasker", label: t("links.becomeTasker") },
    { href: "/help", label: t("links.helpCenter") },
  ],
  services: [
    { href: "/services", label: t("links.allServices") },
    { href: "/search", label: t("links.findTaskers") },
    { href: "/services?category=cat-2", label: t("links.homeCleaning") },
    { href: "/services?category=cat-5", label: t("links.plumbing") },
    { href: "/services?category=cat-6", label: t("links.electrical") },
  ],
  legal: [
    { href: "/terms", label: t("links.terms") },
    { href: "/privacy", label: t("links.privacy") },
    { href: "/refund-policy", label: t("links.refund") },
  ],
  cities: [t("cityNames.karachi"), t("cityNames.lahore"), t("cityNames.islamabad"), t("cityNames.rawalpindi"), t("cityNames.faisalabad"), t("cityNames.multan")],
});

export function Footer() {
  const t = useTranslations("Footer");
  const tl = useTranslations("Logo");

  return (
    <footer className="bg-gradient-to-b from-background to-muted/50 border-t border-border/50">
      <div className="container mx-auto px-4 md:px-6 py-16">
        {/* Main Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🦉</span>
              <span className="font-bold text-xl tracking-tight">
                <span className="gradient-text">{tl("text1")}</span>
                <span className="text-foreground">{tl("text2")}</span>
              </span>
            </Link>
            <p className="text-sm text-foreground/70 leading-relaxed mb-6 max-w-xs">
              {t("description")}
            </p>

          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{t("company")}</h4>
            <ul className="space-y-2.5">
              {footerLinks(t).company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-foreground/70 hover:text-owl-violet transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{t("services")}</h4>
            <ul className="space-y-2.5">
              {footerLinks(t).services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-foreground/70 hover:text-owl-violet transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-sm mb-4 text-foreground">{t("legal")}</h4>
            <ul className="space-y-2.5">
              {footerLinks(t).legal.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href as never}
                    className="text-sm text-foreground/70 hover:text-owl-violet transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <h4 className="font-semibold text-sm mt-6 mb-3 text-foreground">{t("cities")}</h4>
            <div className="flex flex-wrap gap-1.5">
              {footerLinks(t).cities.map((city) => (
                <span
                  key={city}
                  className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground"
                >
                  {city}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="section-divider mt-12 mb-6" />
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            {t("rights", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center space-x-4">
            <span className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-owl-emerald animate-pulse" />
              {t("status")}
            </span>
            <span className="text-xs text-muted-foreground">
              🇵🇰 {t("madeIn")}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
