import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";
import { getPricingSettings } from "@/lib/pricing";
import { SearchResults } from "./search-results";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Taskers | ErrandOwl",
  description: "Search and hire verified taskers in Pakistan.",
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const initialCategory = typeof sp.category === "string" ? sp.category : "";
  const initialQuery = typeof sp.q === "string" ? sp.q : "";

  const supabase = await createClient();
  const settings = await getPricingSettings();

  const [taskersRes, categoriesRes] = await Promise.all([
    supabase.from("tasker_profiles").select("*").eq("active", true),
    supabase.from("categories").select("*").eq("active", true).order("sort_order"),
  ]);

  let taskersList = taskersRes.data || [];

  if (taskersList.length > 0) {
    const profileIds = taskersList.map((t) => t.profile_id);
    const { data: profilesData } = await supabase
      .from("public_profiles")
      .select("*")
      .in("id", profileIds)
      .eq("cnic_status", "approved");

    const profileMap = new Map((profilesData || []).map((p) => [p.id, p]));

    taskersList = taskersList
      .filter((t) => profileMap.has(t.profile_id))
      .map((t) => {
        const profile = profileMap.get(t.profile_id);
        return {
          ...t,
          public_profiles: profile,
          name: profile?.name,
          verified: profile?.is_verified || profile?.cnic_status === "approved",
          location: t.city || profile?.city || profile?.location,
          bio: profile?.bio,
        };
      });
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 pt-24">
        <SearchResults
          initialTaskers={taskersList}
          initialCategories={categoriesRes.data || []}
          initialSettings={settings}
          initialCategory={initialCategory}
          initialQuery={initialQuery}
        />
      </main>
      <Footer />
    </div>
  );
}
