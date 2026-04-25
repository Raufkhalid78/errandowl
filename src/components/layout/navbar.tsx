"use client";

import { Link, usePathname } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { ThemeSwitcher } from "./theme-switcher";
import { LanguageSwitcher } from "./language-switcher";
import { createClient } from "@/lib/supabase/client";

export function Navbar({ initialUser }: { initialUser?: any }) {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const tl = useTranslations("Logo");
  const supabase = createClient();
  const [user, setUser] = useState<any>(initialUser);

  const navLinks = [
    { href: "/services", label: t("services") },
    { href: "/search", label: t("findTaskers") },
    { href: "/how-it-works", label: t("howItWorks") },
    { href: "/about", label: t("about") },
  ];

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();
  // In next-intl, usePathname returns the pathname WITHOUT the locale prefix.
  // So "/" is home regardless of locale.
  const isHome = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    // Check auth status
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
    };
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const useScrolledStyle = isScrolled || !isHome;

  return (
    <header
      className={`fixed top-0 inset-x-0 w-full z-50 transition-all duration-300 ${useScrolledStyle
        ? "glass shadow-lg shadow-owl-violet/5 py-2"
        : "bg-transparent py-4"
        }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between gap-4 min-h-[3rem] lg:min-h-[3.5rem]">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl">🦉</span>
              <span className="font-bold text-xl tracking-tight">
                <span className="gradient-text">{tl("text1")}</span>
                <span className={useScrolledStyle ? "text-foreground" : "text-white"}>
                  {tl("text2")}
                </span>
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href as any}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors hover:bg-white/10 ${useScrolledStyle
                  ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                  : "text-foreground/80 dark:text-white/80 hover:text-foreground dark:hover:text-white"
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            <div className="flex items-center border-e border-border/20 pe-2 me-2 gap-1">
              <LanguageSwitcher />
              <ThemeSwitcher />
            </div>

            {user ? (
              <Button
                render={<Link href="/dashboard" />}
                className="bg-owl-violet hover:bg-owl-violet-dark text-white shadow-lg shadow-owl-violet/25 hover:shadow-owl-violet/40 transition-all h-10 px-5 rounded-xl"
              >
                {t("dashboard") || "Dashboard"}
              </Button>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${useScrolledStyle
                    ? "text-foreground/70 hover:text-foreground hover:bg-muted"
                    : "text-white/80 hover:text-white"
                    }`}
                >
                  {tCommon("login")}
                </Link>
                <Button
                  render={<Link href="/signup" />}
                  className="bg-owl-violet hover:bg-owl-violet-dark text-white shadow-lg shadow-owl-violet/25 hover:shadow-owl-violet/40 transition-all h-10 px-5 rounded-xl"
                >
                  {t("getStarted")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={`p-2 rounded-lg transition-colors ${useScrolledStyle
                ? "text-foreground hover:bg-muted"
                : "text-white hover:bg-white/10"
                }`}
              aria-label="Toggle menu"
            >
              {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden glass mt-2 mx-4 rounded-xl overflow-hidden shadow-lg border border-border/50"
          >
            <nav className="flex flex-col p-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setIsMobileOpen(false)}
                  className="px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors text-foreground/80 hover:text-foreground"
                >
                  {link.label}
                </Link>
              ))}

              <div className="pt-3 mt-2 border-t border-border/50 flex flex-col space-y-4">
                <div className="flex items-center justify-center gap-4 py-2">
                  <LanguageSwitcher />
                  <ThemeSwitcher />
                </div>

                {user ? (
                  <Button
                    render={<Link href="/dashboard" />}
                    className="bg-owl-violet hover:bg-owl-violet-dark text-white w-full"
                    onClick={() => setIsMobileOpen(false)}
                  >
                    {t("dashboard") || "Dashboard"}
                  </Button>
                ) : (
                  <>
                    <Link
                      href="/login"
                      onClick={() => setIsMobileOpen(false)}
                      className="px-4 py-3 text-sm font-medium text-center rounded-lg hover:bg-muted text-foreground/80"
                    >
                      {tCommon("login")}
                    </Link>
                    <Button
                      render={<Link href="/signup" />}
                      className="bg-owl-violet hover:bg-owl-violet-dark text-white w-full"
                      onClick={() => setIsMobileOpen(false)}
                    >
                      {t("getStarted")}
                    </Button>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
