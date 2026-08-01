"use client";

import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Link } from "@/i18n/routing";
import { useSearchParams } from "next/navigation";
import { useState, useEffect, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search, Star, MapPin, List, Map as MapIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTranslations, useLocale } from "next-intl";
import { getPricingSettings, formatRate, type PricingSettings } from "@/lib/pricing";
import { TaskerMap } from "@/components/search/tasker-map";
import { motion } from "framer-motion";

const avatarColors = ["bg-owl-violet", "bg-owl-amber", "bg-owl-emerald", "bg-indigo-500", "bg-rose-500", "bg-cyan-500", "bg-purple-500", "bg-orange-500"];

function SearchContent() {
  const t = useTranslations("Search");
  const locale = useLocale();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get("category") || "");
  const [ratingFilter, setRatingFilter] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [verifiedFilter, setVerifiedFilter] = useState(false);
  const [sortBy, setSortBy] = useState("rating");
  const [view, setView] = useState<"list" | "map">("list");
  
  const [taskers, setTaskers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PricingSettings | null>(null);


  useEffect(() => {
    getPricingSettings().then(setSettings);
    
    const fetchData = async () => {
      const supabase = createClient();
      setLoading(true);
      
      const [taskersRes, categoriesRes] = await Promise.all([
        supabase.from("tasker_profiles").select("*, public_profiles!inner(*)").eq("active", true).eq("public_profiles.cnic_status", "approved"),
        supabase.from("categories").select("*").eq("active", true).order("sort_order")
      ]);

      if (categoriesRes.data) {
        setCategories(categoriesRes.data);
      }

      if (taskersRes.data) {
        setTaskers(taskersRes.data.map(t => {
          const profile = t.public_profiles || t.profiles;
          return {
            ...t,
            name: profile?.name,
            verified: profile?.is_verified || profile?.cnic_status === 'approved',
            location: t.city || profile?.city || profile?.location,
            bio: profile?.bio
          };
        }));
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = taskers
    .filter((t) => {
      if (query) {
        const q = query.toLowerCase();
        if (!t.name?.toLowerCase().includes(q) && !t.bio?.toLowerCase().includes(q) && !t.location?.toLowerCase().includes(q)) return false;
      }
      if (categoryFilter && t.categories && !t.categories.includes(categoryFilter)) return false;
      if (ratingFilter && t.rating_avg < parseFloat(ratingFilter)) return false;
      if (cityFilter && t.location?.toLowerCase() !== cityFilter.toLowerCase()) return false;
      if (verifiedFilter && !t.verified) return false;
      
      const rate = settings?.pricing_mode === 'hourly' ? t.hourly_rate : t.fixed_rate;
      if (priceFilter && rate > parseInt(priceFilter)) return false;
      
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "rating") return (b.rating_avg || 0) - (a.rating_avg || 0);
      if (sortBy === "reviews") return (b.review_count || 0) - (a.review_count || 0);
      
      const rateA = settings?.pricing_mode === 'hourly' ? a.hourly_rate : a.fixed_rate;
      const rateB = settings?.pricing_mode === 'hourly' ? b.hourly_rate : b.fixed_rate;
      
      if (sortBy === "price_low") return (rateA || 0) - (rateB || 0);
      if (sortBy === "price_high") return (rateB || 0) - (rateA || 0);
      return 0;
    });

  if (!settings) return <div className="flex justify-center p-20"><Loader2 className="animate-spin h-10 w-10 text-owl-violet" /></div>;

  return (
    <>
      <section className="relative py-16 gradient-hero overflow-hidden">
        <div className="hero-orb hero-orb-1 opacity-20" />
        <div className="container mx-auto px-4 md:px-6 relative z-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 tracking-tight">
            {t.rich('title', {
                h: (chunks) => <span className="gradient-text">{chunks}</span>
            })}
          </h1>
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center bg-white/10 backdrop-blur-lg border border-white/15 rounded-2xl p-2">
              <Search className="ml-4 text-white/40 h-5 w-5 shrink-0" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('placeholder')}
                className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-white/40 px-4 py-3 text-base"
              />
              <Button className="bg-owl-violet hover:bg-owl-violet-dark text-white px-6 h-12 rounded-xl">
                {t('button')}
              </Button>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-8">
            <select
              value={cityFilter}
              onChange={(e) => setCityFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border text-sm bg-card focus:border-owl-violet focus:outline-none"
            >
              <option value="">{t('filters.allCities')}</option>
              <option value="Karachi">{t('filters.karachi')}</option>
              <option value="Lahore">{t('filters.lahore')}</option>
              <option value="Islamabad">{t('filters.islamabad')}</option>
              <option value="Rawalpindi">{t('filters.rawalpindi')}</option>
              <option value="Faisalabad">{t('filters.faisalabad')}</option>
              <option value="Multan">{t('filters.multan')}</option>
              <option value="Peshawar">{t('filters.peshawar')}</option>
              <option value="Quetta">{t('filters.quetta')}</option>
            </select>
            <label className="flex items-center space-x-2 px-3 py-2.5 rounded-xl border border-border text-sm bg-card cursor-pointer">
              <input
                type="checkbox"
                checked={verifiedFilter}
                onChange={(e) => setVerifiedFilter(e.target.checked)}
                className="rounded border-gray-300 text-owl-violet focus:ring-owl-violet"
              />
              <span>{t('filters.verifiedOnly')}</span>
            </label>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border text-sm bg-card focus:border-owl-violet focus:outline-none"
            >
              <option value="">{t('filters.allCategories')}</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {locale === 'ur' ? c.name_ur : c.name_en}
                </option>
              ))}
            </select>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border text-sm bg-card focus:border-owl-violet focus:outline-none"
            >
              <option value="">{t('filters.anyRating')}</option>
              <option value="4.5">{t('filters.stars', { rating: 4.5 })}</option>
              <option value="4">{t('filters.stars', { rating: 4 })}</option>
              <option value="3.5">{t('filters.stars', { rating: 3.5 })}</option>
            </select>
            <select
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border text-sm bg-card focus:border-owl-violet focus:outline-none"
            >
              <option value="">{t('filters.anyPrice')}</option>
              {[500, 1000, 2000, 5000].map(amount => (
                <option key={amount} value={amount}>
                  {settings.pricing_mode === 'hourly' 
                    ? t('filters.underPriceHr', { amount: amount.toLocaleString() })
                    : t('filters.underPrice', { amount: amount.toLocaleString() })}
                </option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-border text-sm bg-card focus:border-owl-violet focus:outline-none"
            >
              <option value="rating">{t('filters.topRated')}</option>
              <option value="reviews">{t('filters.mostReviews')}</option>
              <option value="price_low">{t('filters.priceLow')}</option>
              <option value="price_high">{t('filters.priceHigh')}</option>
            </select>
          </div>

          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-muted-foreground">
              {filtered.length === 1 ? t('results', { count: 1 }) : t('results_plural', { count: filtered.length })}
            </div>
            <div className="flex items-center bg-muted/50 p-1 rounded-xl border border-border/50">
              <button
                onClick={() => setView("list")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "list" ? "bg-card text-owl-violet shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <List className="h-3.5 w-3.5" /> {t('viewList')}
              </button>
              <button
                onClick={() => setView("map")}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  view === "map" ? "bg-card text-owl-violet shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MapIcon className="h-3.5 w-3.5" /> {t('viewMap')}
              </button>
            </div>
          </div>

          {loading ? (
             <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {[1, 2, 3, 4, 5, 6].map((i) => (
                 <div key={i} className="p-6 rounded-2xl border border-border/50 bg-card animate-pulse">
                   <div className="flex items-start gap-4 mb-4">
                     <div className="w-14 h-14 rounded-2xl bg-muted" />
                     <div className="flex-1 space-y-2 py-1">
                       <div className="h-4 bg-muted rounded w-3/4" />
                       <div className="h-3 bg-muted rounded w-1/2" />
                     </div>
                   </div>
                   <div className="space-y-2 mb-4">
                     <div className="h-3 bg-muted rounded w-full" />
                     <div className="h-3 bg-muted rounded w-5/6" />
                   </div>
                   <div className="flex justify-between">
                     <div className="h-4 bg-muted rounded w-16" />
                     <div className="h-4 bg-muted rounded w-16" />
                   </div>
                 </div>
               ))}
             </div>
          ) : view === "map" ? (
            <TaskerMap taskers={filtered} />
          ) : filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className="text-center py-16 border border-dashed border-border/50 rounded-2xl bg-muted/20 flex flex-col items-center justify-center min-h-[300px]"
            >
              <div className="text-6xl mb-4 opacity-50">🦉</div>
              <h3 className="font-semibold text-lg mb-2">{t('noResults')}</h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t('noResultsSub')}
              </p>
              <Button 
                variant="outline" 
                className="mt-6 rounded-xl"
                onClick={() => { setQuery(""); setCategoryFilter(""); setCityFilter(""); setPriceFilter(""); }}
              >
                {t('clearFilters')}
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }}
              initial="hidden" animate="show"
              className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
            >
              {filtered.map((t_data, i) => {
                const initials = t_data.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase() || "T";
                const rate = settings.pricing_mode === 'hourly' ? t_data.hourly_rate : t_data.fixed_rate;
                
                return (
                  <motion.div variants={{ hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }} key={t_data.id}>
                  <Link
                    href={`/tasker/${t_data.profile_id || t_data.id}`}
                    className="group p-6 rounded-2xl border border-border/50 hover:border-owl-violet/30 hover-lift transition-all bg-card"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl ${avatarColors[i % avatarColors.length]} flex items-center justify-center text-white font-bold text-lg`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold group-hover:text-owl-violet transition-colors truncate">
                            {t_data.name}
                          </h3>
                          {t_data.verified && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-owl-emerald/10 text-owl-emerald">✓</span>
                          )}
                          {t_data.elite && (
                            <span className="text-xs px-1.5 py-0.5 rounded-full bg-owl-amber/10 text-owl-amber">⭐ Elite</span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {t_data.location}
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
                      {t_data.bio}
                    </p>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-owl-amber text-owl-amber" />
                        <span className="font-semibold">{t_data.rating_avg || 0}</span>
                        <span className="text-muted-foreground">
                          ({t_data.review_count || 0})
                        </span>
                      </div>
                      <div className="font-semibold text-owl-violet">
                        {formatRate(rate || 0, settings.pricing_mode, locale)}
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-muted-foreground">
                      {t('tasksCompleted', { count: t_data.completed_tasks || 0 })}
                    </div>
                  </Link>
                 </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-owl-violet animate-spin" />
            </div>
          }
        >
          <SearchContent />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
