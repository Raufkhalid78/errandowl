"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, Star, Shield, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

// Popular searches are defined inside the component to use translations

function AnimatedCounter({
  target,
  suffix = "",
  decimal = false,
  duration = 2000,
}: {
  target: number;
  suffix?: string;
  decimal?: boolean;
  duration?: number;
}) {
  const [count, setCount] = useState(target);
  const ref = useRef<HTMLDivElement>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted && !hasAnimated) {
          setHasStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hasStarted, hasAnimated]);

  useEffect(() => {
    if (!hasStarted || hasAnimated) return;
    
    setHasAnimated(true); // Ensure it only runs once
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    setCount(0); // Jump to 0 immediately before animating

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(current);
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [hasStarted, target, duration, hasAnimated]);

  return (
    <div ref={ref}>
      {decimal ? count.toFixed(1) : Math.floor(count).toLocaleString()}
      {suffix}
    </div>
  );
}

export function HeroSection() {
  const t = useTranslations("Hero");
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  const popularSearches = [
    { label: t("popularSearches.homeCleaning"), href: "/search?category=cat-2" },
    { label: t("popularSearches.plumbing"), href: "/search?category=cat-5" },
    { label: t("popularSearches.electrician"), href: "/search?category=cat-6" },
    { label: t("popularSearches.delivery"), href: "/search?category=cat-9" },
  ];

  return (
    <section className="relative min-h-[100vh] flex items-center gradient-hero overflow-hidden">
      {/* Animated orbs */}
      <div className="hero-orb hero-orb-1" />
      <div className="hero-orb hero-orb-2" />
      <div className="hero-orb hero-orb-3" />

      {/* Grid pattern overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="container mx-auto px-4 md:px-6 relative z-10 pt-24 pb-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Trust badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-white/90 text-sm mb-8"
          >
            <span className="text-lg">🦉</span>
            <span>{t("trustBadge")}</span>
            <span className="w-2 h-2 rounded-full bg-owl-emerald animate-pulse" />
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white mb-6"
          >
            {t.rich('title', {
                h: (chunks) => (
                    <span className="relative">
                        <span className="gradient-text">{chunks}</span>
                        <motion.span
                            className="absolute -bottom-2 left-0 right-0 h-1 rounded-full bg-gradient-to-r from-owl-violet to-owl-amber"
                            initial={{ scaleX: 0 }}
                            animate={{ scaleX: 1 }}
                            transition={{ duration: 0.8, delay: 0.8 }}
                        />
                    </span>
                ),
                handled: t('handled')
            })}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {t.rich('subtitle', {
                availability: (chunks) => <span className="text-owl-amber-light font-medium">{chunks}</span>
            })}
          </motion.p>

          {/* Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="max-w-2xl mx-auto mb-6"
          >
            <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-2 focus-within:border-owl-violet/50 transition-all focus-within:bg-white/15">
              <Search className="ml-4 text-white/40 h-5 w-5 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t("searchPlaceholder")}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 px-4 py-3 text-base"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && searchQuery) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
              />
              <Button
                className="bg-owl-violet hover:bg-owl-violet-dark text-white px-6 py-3 h-12 rounded-xl shadow-lg shadow-owl-violet/30 hover:shadow-owl-violet/50 transition-all"
                onClick={() => {
                  if (searchQuery) {
                    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
                  }
                }}
              >
                <span className="hidden sm:inline">{t("searchButton")}</span>
                <ArrowRight className="sm:ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Popular searches */}
            <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
              <span className="text-white/40 text-sm">{t("popular")}</span>
              {popularSearches.map((item) => (
                <Link
                  key={item.label}
                  href={item.href as never}
                  className="text-sm px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-white/70 hover:bg-white/10 hover:text-white transition-all"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="max-w-3xl mx-auto mt-16 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {[
            { value: 15000, suffix: "+", label: t("stats.tasks") },
            { value: 500, suffix: "+", label: t("stats.taskers") },
            { value: 4.9, suffix: "★", label: t("stats.rating"), decimal: true },
            { value: 12, suffix: "", label: t("stats.cities") },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-white">
                <AnimatedCounter
                  target={stat.value}
                  suffix={stat.suffix}
                  decimal={stat.decimal}
                />
              </div>
              <div className="text-sm text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 1 }}
          className="flex justify-center gap-6 md:gap-8 mt-12 flex-wrap"
        >
          {[
            { icon: <Shield className="h-4 w-4" />, text: t("trustIndicators.verified") },
            { icon: <Clock className="h-4 w-4" />, text: t("trustIndicators.sameDay") },
            { icon: <Star className="h-4 w-4" />, text: t("trustIndicators.satisfaction") },
            { icon: <MapPin className="h-4 w-4" />, text: t("trustIndicators.cities") },
          ].map((badge, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-white/40"
            >
              <span className="text-owl-violet-light">{badge.icon}</span>
              {badge.text}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
