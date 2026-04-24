"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const steps = (t: any) => [
  {
    num: 1,
    icon: "📋",
    title: t("steps.step1Title"),
    description: t("steps.step1Desc"),
    color: "bg-owl-violet",
  },
  {
    num: 2,
    icon: "🤝",
    title: t("steps.step2Title"),
    description: t("steps.step2Desc"),
    color: "bg-owl-amber",
  },
  {
    num: 3,
    icon: "✨",
    title: t("steps.step3Title"),
    description: t("steps.step3Desc"),
    color: "bg-owl-emerald",
  },
];

export function HowItWorksSection() {
  const t = useTranslations("HomeHowItWorks");

  return (
    <section className="py-20 md:py-28 bg-muted/30" id="how-it-works">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-owl-amber/10 text-owl-amber text-sm font-medium mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t.rich("title", {
              h: (chunks) => <span className="gradient-text">{chunks}</span>
            })}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[calc(16.66%+24px)] right-[calc(16.66%+24px)] h-0.5 bg-gradient-to-r from-owl-violet via-owl-amber to-owl-emerald opacity-20" />

            {steps(t).map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative text-center"
              >
                {/* Step number */}
                <div className="relative z-10 mx-auto mb-6">
                  <div
                    className={`w-14 h-14 ${step.color} rounded-2xl flex items-center justify-center text-white font-bold text-xl mx-auto shadow-lg`}
                    style={{
                      boxShadow: `0 8px 30px ${
                        step.color.includes("violet")
                          ? "rgba(124,58,237,0.3)"
                          : step.color.includes("amber")
                          ? "rgba(245,158,11,0.3)"
                          : "rgba(16,185,129,0.3)"
                      }`,
                    }}
                  >
                    {step.num}
                  </div>
                </div>

                {/* Icon */}
                <div className="text-4xl mb-4">{step.icon}</div>

                {/* Content */}
                <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
