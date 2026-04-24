"use client";

import { Link } from "@/i18n/routing";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CTASection() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl gradient-hero p-10 md:p-16 text-center"
        >
          {/* Orbs */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-owl-violet/20 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-owl-amber/15 rounded-full blur-[80px]" />

          <div className="relative z-10 max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-sm mb-6">
              <Sparkles className="h-3.5 w-3.5 text-owl-amber" />
              Join 10,000+ happy users
            </div>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-white/60 text-lg mb-8 max-w-lg mx-auto">
              Join ErrandOwl today and make your life easier. Skill up or hire
              up, the choice is yours.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                render={
                  <Link href="/signup" className="flex items-center gap-2">
                    Join ErrandOwl Pakistan
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                }
                size="lg"
                className="bg-white text-owl-violet-dark hover:bg-white/90 font-semibold shadow-xl shadow-black/20 h-12 px-8"
              />
              <Button
                render={<Link href="/search">Browse Taskers</Link>}
                size="lg"
                variant="glass"
                className="h-12 px-8"
              />
            </div>
          </div>

          {/* Decorative owl */}
          <div className="absolute -bottom-4 -right-4 text-8xl opacity-10 select-none pointer-events-none">
            🦉
          </div>
        </motion.div>
      </div>
    </section>
  );
}
