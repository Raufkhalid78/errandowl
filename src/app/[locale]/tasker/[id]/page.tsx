import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { Link } from "@/i18n/routing";
import { Star, MapPin, Shield, Clock, Calendar, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";
import { getPricingSettings, formatRate } from "@/lib/pricing";
import { ReviewList } from "@/components/reviews/review-list";
import { getTranslations } from "next-intl/server";
import { FavoriteButton } from "@/components/taskers/favorite-button";
import { JsonLd } from "@/components/seo/json-ld";

export async function generateMetadata({ params }: { params: Promise<{ id: string, locale: string }> }): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: tasker } = await supabase
    .from("tasker_profiles")
    .select("*")
    .or(`id.eq.${id},profile_id.eq.${id}`)
    .maybeSingle();

  let profile = null;
  if (tasker) {
    const { data: profileData } = await supabase
      .from("public_profiles")
      .select("name, city")
      .eq("id", tasker.profile_id ?? "")
      .maybeSingle();
    profile = profileData || (tasker as any).profiles;
  }
  const name = profile?.name || "Tasker";
  const city = profile?.city || "Pakistan";

  return {
    title: `${name} — ErrandOwl Pakistan`,
    description: `Hire ${name} in ${city} for professional errands, cleaning, and repairs on ErrandOwl.`,
  };
}


export default async function TaskerProfilePage({ params }: { params: Promise<{ id: string, locale: string }> }) {
  const { id, locale } = await params; // locale is kept because it's passed to formatRate
  const supabase = await createClient();
  const t = await getTranslations("TaskerProfile");

  const { data: rawTasker } = await supabase
    .from("tasker_profiles")
    .select("*")
    .or(`id.eq.${id},profile_id.eq.${id}`)
    .maybeSingle();

  let profile = null;
  if (rawTasker) {
    const { data: profileData } = await supabase
      .from("public_profiles")
      .select("*")
      .eq("id", rawTasker.profile_id ?? "")
      .maybeSingle();
    profile = profileData;
  }

  const tasker = rawTasker ? {
    ...rawTasker,
    profiles: profile || (rawTasker as any).profiles
  } : null;

  const profileId = tasker?.profile_id ?? "";

  const { data: portfolioItems } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("tasker_id", profileId)
    .order("created_at", { ascending: false });

  const { data: availabilityRows } = await supabase
    .from("tasker_availability")
    .select("*")
    .eq("tasker_id", profileId);

  if (!tasker) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">{t("notFound")}</h1>
          <Link href="/search" className="text-owl-violet hover:underline">{t("returnSearch")}</Link>
        </div>
      </div>
    );
  }

  const settings = await getPricingSettings();
  const initials = tasker.profiles?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "T";
  const rateMode = tasker.pricing_mode || settings.pricing_mode;
  const rate = rateMode === 'hourly' ? tasker.hourly_rate : tasker.fixed_rate;

  const taskerSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: tasker.profiles?.name || "Tasker",
    jobTitle: "Service Provider",
    address: {
      "@type": "PostalAddress",
      addressLocality: tasker.profiles?.city || tasker.city,
      addressCountry: "PK",
    },
    ...(tasker.rating_avg && tasker.review_count ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: tasker.rating_avg,
        reviewCount: tasker.review_count,
        bestRating: 5,
        worstRating: 1,
      },
    } : {}),
    offers: {
      "@type": "Offer",
      priceCurrency: "PKR",
      price: rate || 0,
      priceSpecification: {
        "@type": rateMode === 'hourly' ? "UnitPriceSpecification" : "PriceSpecification",
        price: rate || 0,
        priceCurrency: "PKR",
        ...(rateMode === 'hourly' ? { unitCode: "HUR" } : {}),
      },
    },
  };

  return (
    <div className="flex flex-col min-h-screen">
      <JsonLd schema={taskerSchema} />
      <Navbar />

      <main className="flex-1 pt-24">
        {/* Profile Header */}
        <section className="relative py-16 gradient-hero overflow-hidden">
          <div className="hero-orb hero-orb-1 opacity-20" />
          <div className="container mx-auto px-4 md:px-6 relative z-10">
            <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-start gap-6">
              {/* Avatar */}
              <div className="w-24 h-24 rounded-3xl bg-owl-violet flex items-center justify-center text-white text-3xl font-bold shadow-xl">
                {initials}
              </div>

              <div className="flex-1 text-white">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h1 className="text-3xl font-bold">{tasker.profiles.name}</h1>
                  {tasker.profiles.is_verified && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-owl-emerald/20 text-owl-emerald">
                      <Shield className="h-3 w-3" /> {t("verified")}
                    </span>
                  )}
                  {tasker.elite && (
                    <span className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-owl-amber/20 text-owl-amber">
                      ⭐ {t("elite")}
                    </span>
                  )}
                  {(tasker as any).badges?.map((badge: string) => (
                    <span key={badge} className="flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-owl-violet-light/20 text-owl-violet-light border border-owl-violet-light/30">
                      <Shield className="h-3 w-3" /> {badge}
                    </span>
                  ))}
                  <FavoriteButton taskerId={tasker.profile_id ?? ""} className="ml-auto" />
                </div>
                <div className="flex items-center gap-1 text-white/60 text-sm mb-3">
                  <MapPin className="h-4 w-4" />
                  {tasker.profiles.city || "Pakistan"}
                </div>
                <p className="text-white/70 text-sm leading-relaxed max-w-xl">
                  {tasker.profiles.bio}
                </p>

                {/* Stats row */}
                <div className="flex flex-wrap gap-6 mt-4">
                  <div className="flex items-center gap-1.5 text-white/80">
                    <Star className="h-4 w-4 fill-owl-amber text-owl-amber" />
                    <span className="font-semibold">{tasker.rating_avg || 0}</span>
                    <span className="text-white/50 text-sm">({tasker.review_count || 0} {t("reviews")})</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-white/80 text-sm">
                    <Clock className="h-4 w-4 text-owl-violet-light" />
                    {tasker.completed_tasks || 0} {t("tasksDone")}
                  </div>
                  <div className="text-owl-amber-light font-bold text-lg">
                    {formatRate(rate || 0, (tasker.pricing_mode || settings.pricing_mode) as any, locale)}
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-col gap-3 mt-4 md:mt-0">
                <Button
                  render={<Link href={`/dashboard/book?tasker=${id}`}>{t("bookBtn")}</Link>}
                  className="bg-owl-violet hover:bg-owl-violet-dark text-white px-8 h-12 shadow-lg"
                />
                <Button
                  render={<Link href={`/dashboard/messages?tasker=${id}`} className="flex items-center gap-2"><MessageCircle className="h-4 w-4" /> {t("msgBtn")}</Link>}
                  variant="glass"
                  className="h-12"
                />
              </div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
        </section>

        <div className="container mx-auto px-4 md:px-6 py-12 max-w-4xl">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Left — Skills & Info */}
            <div className="space-y-6">
              {/* Skills */}
              <div className="p-5 rounded-2xl border border-border/50 glass">
                <h3 className="font-semibold text-sm mb-3">{t("skills")}</h3>
                <div className="flex flex-wrap gap-2">
                  {(tasker.skills || ["General Tasks"]).map((skill: string) => {
                    const isVerified = (tasker as any).verified_skills?.includes(skill);
                    return (
                      <span
                        key={skill}
                        className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full ${
                          isVerified 
                            ? "bg-owl-emerald/10 text-owl-emerald border border-owl-emerald/20" 
                            : "bg-owl-violet/10 text-owl-violet border border-transparent"
                        }`}
                      >
                        {isVerified && <Shield className="h-3 w-3" />}
                        {skill}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Availability */}
              <div className="p-5 rounded-2xl border border-border/50 glass">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> {t("availability")}
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center text-xs">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                    const isAvailable = availabilityRows?.some(row => row.day_of_week === day);
                    return (
                      <div
                        key={day}
                        className={`py-2 rounded-lg ${isAvailable ? "bg-owl-emerald/10 text-owl-emerald font-bold" : "bg-muted text-muted-foreground"}`}
                      >
                        {t(`days.${day}`)}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — Portfolio & Reviews */}
            <div className="md:col-span-2 space-y-12">
              {portfolioItems && portfolioItems.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 text-xl">Portfolio</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {portfolioItems.map((item: any) => (
                      <div key={item.id} className="relative group rounded-xl overflow-hidden aspect-square border bg-muted">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image_url} alt="Portfolio" className="object-cover w-full h-full hover:scale-105 transition-transform duration-300" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-4 text-xl">
                  {t("reviewsTitle")}
                </h3>
                <ReviewList taskerId={tasker.profile_id ?? ""} />
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
