"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CheckCircle2, Star } from "lucide-react";
import { useTranslations } from "next-intl";

// Mock data representing recent platform activity to build social proof
const activities = [
  { id: 1, text: "Ali in Lahore just booked Furniture Assembly", icon: <Clock className="h-4 w-4 text-owl-violet" />, time: "2 mins ago" },
  { id: 2, text: "Sara completed a Deep Cleaning task", icon: <CheckCircle2 className="h-4 w-4 text-owl-emerald" />, time: "5 mins ago" },
  { id: 3, text: "Usman received a 5-star review for Plumbing", icon: <Star className="h-4 w-4 text-owl-amber" />, time: "12 mins ago" },
  { id: 4, text: "Fatima in Karachi just booked AC Repair", icon: <Clock className="h-4 w-4 text-owl-violet" />, time: "18 mins ago" },
  { id: 5, text: "Ahmed completed an Electrical Repair task", icon: <CheckCircle2 className="h-4 w-4 text-owl-emerald" />, time: "25 mins ago" },
];

export function RecentActivityTicker() {
  const t = useTranslations("Ticker");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activities.length);
    }, 5000); // Rotate every 5 seconds

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="w-full bg-muted/30 border-b border-border/50 py-2.5 overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3 text-sm">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-owl-emerald opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-owl-emerald"></span>
            </span>
            <span className="font-semibold text-xs tracking-wider uppercase text-muted-foreground mr-2 whitespace-nowrap">{t("liveActivity")}</span>
            
            <div className="relative h-6 w-[280px] sm:w-[400px] md:w-[600px] overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -20, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 flex items-center gap-2 text-muted-foreground whitespace-nowrap"
                >
                  <span className="shrink-0">{activities[currentIndex].icon}</span>
                  <span className="font-medium text-foreground truncate">{activities[currentIndex].text}</span>
                  <span className="text-xs opacity-70 shrink-0">({activities[currentIndex].time})</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
