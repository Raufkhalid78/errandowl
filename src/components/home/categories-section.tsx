"use client";

import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";

const categories = (t: any) => [
  { id: "cat-1", name: t("categories.cat-1"), icon: "🪑", desc: t("categories.cat-1-desc"), color: "from-violet-500/10 to-violet-600/5" },
  { id: "cat-2", name: t("categories.cat-2"), icon: "🧹", desc: t("categories.cat-2-desc"), color: "from-blue-500/10 to-blue-600/5" },
  { id: "cat-3", name: t("categories.cat-3"), icon: "📦", desc: t("categories.cat-3-desc"), color: "from-amber-500/10 to-amber-600/5" },
  { id: "cat-4", name: t("categories.cat-4"), icon: "🔧", desc: t("categories.cat-4-desc"), color: "from-emerald-500/10 to-emerald-600/5" },
  { id: "cat-5", name: t("categories.cat-5"), icon: "🔩", desc: t("categories.cat-5-desc"), color: "from-cyan-500/10 to-cyan-600/5" },
  { id: "cat-6", name: t("categories.cat-6"), icon: "⚡", desc: t("categories.cat-6-desc"), color: "from-yellow-500/10 to-yellow-600/5" },
  { id: "cat-7", name: t("categories.cat-7"), icon: "🎨", desc: t("categories.cat-7-desc"), color: "from-rose-500/10 to-rose-600/5" },
  { id: "cat-8", name: t("categories.cat-8"), icon: "🌿", desc: t("categories.cat-8-desc"), color: "from-green-500/10 to-green-600/5" },
  { id: "cat-9", name: t("categories.cat-9"), icon: "🚗", desc: t("categories.cat-9-desc"), color: "from-orange-500/10 to-orange-600/5" },
  { id: "cat-10", name: t("categories.cat-10"), icon: "📋", desc: t("categories.cat-10-desc"), color: "from-purple-500/10 to-purple-600/5" },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function CategoriesSection() {
  const t = useTranslations("HomeCategories");
  const ts = useTranslations("Services");
  
  return (
    <section className="py-20 md:py-28 relative">
      <div className="container mx-auto px-4 md:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="text-center mb-14"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-owl-violet/10 text-owl-violet text-sm font-medium mb-4">
            {t("badge")}
          </span>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
            {t.rich("title", {
              h: (chunks) => <span className="gradient-text">{chunks}</span>
            })}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </motion.div>

        {/* Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {categories(ts).map((cat) => (
            <motion.div key={cat.id} variants={itemVariants}>
              <Link
                href={`/services?category=${cat.id}` as never}
                className={`group block p-5 rounded-2xl bg-gradient-to-br ${cat.color} border border-border/50 hover:border-owl-violet/30 hover-lift transition-all`}
              >
                <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                  {cat.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-owl-violet transition-colors">
                  {cat.name}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                  {cat.desc}
                </p>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center mt-10"
        >
          <Link
            href="/services"
            className="inline-flex items-center gap-2 text-owl-violet font-medium text-sm hover:gap-3 transition-all"
          >
            {t("viewAll")}
            <span>→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
