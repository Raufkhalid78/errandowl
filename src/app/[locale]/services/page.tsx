import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Browse all ErrandOwl services — from furniture assembly to cleaning, moving, electrical and more across Pakistan.",
};

const fallbackCategories = [
  { id: "cat-1", name: "Furniture Assembly", icon: "🪑", description: "Assemble or disassemble furniture items", task_count: 3420 },
  { id: "cat-2", name: "Home Cleaning", icon: "🧹", description: "Professional home and apartment cleaning", task_count: 2890 },
  { id: "cat-3", name: "Moving Help", icon: "📦", description: "Loading, unloading, and packing assistance", task_count: 1540 },
  { id: "cat-4", name: "Mounting & Installation", icon: "🔧", description: "Mount TVs, shelves, art, and more", task_count: 1980 },
  { id: "cat-5", name: "Plumbing", icon: "🔩", description: "Fix leaks, clogs, and plumbing issues", task_count: 870 },
  { id: "cat-6", name: "Electrical", icon: "⚡", description: "Light fixtures, outlets, and wiring", task_count: 720 },
  { id: "cat-7", name: "Painting", icon: "🎨", description: "Interior and exterior painting services", task_count: 1120 },
  { id: "cat-8", name: "Yard Work", icon: "🌿", description: "Lawn mowing, gardening, and landscaping", task_count: 960 },
  { id: "cat-9", name: "Delivery & Errands", icon: "🚗", description: "Pickup, delivery, and errand running", task_count: 2100 },
  { id: "cat-10", name: "Personal Assistant", icon: "📋", description: "Administrative tasks and personal help", task_count: 650 },
  { id: "cat-11", name: "Home Repairs", icon: "🏠", description: "General handyman and repair services", task_count: 1430 },
  { id: "cat-12", name: "Heavy Lifting", icon: "💪", description: "Move heavy items, rearrange furniture", task_count: 780 },
];

const fallbackServices: Record<string, Array<{ id: string; name: string; starting_price: number; description: string }>> = {
  "cat-1": [
    { id: "svc-1", name: "IKEA Furniture Assembly", starting_price: 1500, description: "Expert IKEA furniture assembly service" },
    { id: "svc-2", name: "Desk Assembly", starting_price: 1200, description: "Assemble office and computer desks" },
  ],
  "cat-2": [
    { id: "svc-5", name: "Standard Cleaning", starting_price: 1500, description: "Regular home cleaning service" },
    { id: "svc-6", name: "Deep Cleaning", starting_price: 3500, description: "Thorough deep cleaning of your home" },
  ],
  "cat-3": [
    { id: "svc-8", name: "Local Moving", starting_price: 4000, description: "Help with local moves" },
  ],
  "cat-4": [
    { id: "svc-10", name: "TV Mounting", starting_price: 1000, description: "Professional TV wall mounting" },
  ],
  "cat-5": [
    { id: "svc-13", name: "Faucet Repair", starting_price: 1200, description: "Fix leaky or broken faucets" },
  ],
  "cat-6": [
    { id: "svc-15", name: "Light Installation", starting_price: 1000, description: "Install light fixtures and ceiling fans" },
  ],
  "cat-9": [
    { id: "svc-21", name: "Grocery Delivery", starting_price: 500, description: "Shop and deliver groceries" },
  ],
};

export default async function ServicesPage() {
  const t = await getTranslations("Services");
  const supabase = await createClient();

  const { data: catData } = await supabase.from("categories").select("*").eq("active", true);
  const categories = catData && catData.length > 0 ? catData : fallbackCategories;

  const { data: svcData } = await supabase.from("services").select("*").eq("active", true);

  const servicesByCategory: Record<string, any[]> = {};
  if (svcData && svcData.length > 0) {
    svcData.forEach((s: any) => {
      if (!servicesByCategory[s.category_id]) servicesByCategory[s.category_id] = [];
      servicesByCategory[s.category_id]!.push(s);
    });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative py-16 gradient-hero overflow-hidden">
          <div className="hero-orb hero-orb-1 opacity-20" />
          <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
              {t.rich('title', {
                h: (chunks) => <span className="gradient-text">{chunks}</span>
              })}
            </h1>
            <p className="text-white/60 text-lg">
              {t("subtitle")}
            </p>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 md:px-6">
            <div className="space-y-16">
              {categories.map((cat: any) => {
                const services = servicesByCategory[cat.id] || fallbackServices[cat.id] || [];
                return (
                  <div key={cat.id}>
                    {/* Category Header */}
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-3xl">{cat.icon}</span>
                      <div className="flex-1">
                        <h2 className="text-xl font-bold">{t(`categories.${cat.id}`) || cat.name}</h2>
                        <p className="text-sm text-muted-foreground">
                          {t(`categories.${cat.id}-desc`) || cat.description}
                        </p>
                      </div>
                      <Link
                        href={`/search?category=${cat.id}`}
                        className="text-sm text-owl-violet hover:underline font-medium"
                      >
                        {t("viewTaskers")} →
                      </Link>
                    </div>

                    {/* Services */}
                    {services.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {services.map((svc: any) => (
                          <Link
                            key={svc.id}
                            href={`/search?service=${svc.id}`}
                            className="p-5 rounded-xl border border-border/50 hover:border-owl-violet/30 hover-lift transition-all group"
                          >
                            <h3 className="font-medium text-sm mb-1 group-hover:text-owl-violet transition-colors">
                              {svc.name}
                            </h3>
                            <p className="text-xs text-muted-foreground mb-2">
                              {svc.description}
                            </p>
                            <span className="text-sm font-semibold text-owl-violet">
                              Starting at Rs {(svc.starting_price || 0).toLocaleString()}
                            </span>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-sm text-muted-foreground border border-dashed rounded-xl">
                        <Link
                          href={`/search?category=${cat.id}`}
                          className="text-owl-violet hover:underline"
                        >
                          Browse taskers for {cat.name} →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
