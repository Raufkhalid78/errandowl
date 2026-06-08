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
            {/* Social */}
            <div className="flex space-x-3">
              {[
                {
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                  label: "Twitter",
                  href: "#",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" />
                    </svg>
                  ),
                  label: "Facebook",
                  href: "#",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                  ),
                  label: "Instagram",
                  href: "#",
                },
                {
                  icon: (
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  ),
                  label: "LinkedIn",
                  href: "#",
                },
              ].map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-muted hover:bg-owl-violet hover:text-white flex items-center justify-center text-muted-foreground transition-all hover:scale-110 border border-border/40 hover:border-owl-violet"
                >
                  {social.icon}
                </a>
              ))}
            </div>
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
