import { Navbar } from "@/components/layout/navbar";
import { createClient } from "@/lib/supabase/server";
import { RecentActivityTicker } from "@/components/home/recent-activity-ticker";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesSection } from "@/components/home/categories-section";
import { HowItWorksSection } from "@/components/home/how-it-works-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CTASection } from "@/components/home/cta-section";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar initialUser={user} />
      <div className="pt-20">
        <RecentActivityTicker />
      </div>

      <main className="flex-1">
        <HeroSection />

        <div className="section-divider" />
        <CategoriesSection />

        <div className="section-divider" />
        <HowItWorksSection />

        <div className="section-divider" />
        <TestimonialsSection />

        <div className="section-divider" />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
