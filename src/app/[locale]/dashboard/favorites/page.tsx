import { createClient } from "@/lib/supabase/server";

import { redirect } from "next/navigation";
import { Link } from "@/i18n/routing";
import { Heart, Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function FavoritesPage() {
  const supabase = await createClient();


  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("auth_id", user.id)
    .single();

  if (!profile) redirect("/login");

  const { data: favorites } = await supabase
    .from("favorite_taskers")
    .select(`
      tasker_id,
      profiles:tasker_id (
        name,
        city,
        tasker_profiles (
          id,
          hourly_rate,
          rating_avg,
          review_count
        )
      )
    `)
    .eq("client_id", profile.id);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Favorite Taskers</h2>
        <p className="text-muted-foreground">
          Quickly access your preferred taskers for re-booking.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(!favorites || favorites.length === 0) ? (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
            <Heart className="h-10 w-10 mx-auto mb-3 opacity-20" />
            <p>You haven&apos;t saved any taskers to your favorites yet.</p>
            <Button render={<Link href="/search">Browse Taskers</Link>} variant="link" />
          </div>
        ) : (
          favorites.map((fav: any) => {
            const userProfile = fav.profiles;
            const tProfile = userProfile?.tasker_profiles;
            if (!userProfile || !tProfile) return null;
            return (
              <div key={fav.tasker_id} className="border rounded-2xl p-5 bg-card hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-owl-violet flex items-center justify-center text-white font-bold">
                    {userProfile.name[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold">{userProfile.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {userProfile.city}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-owl-amber text-owl-amber" />
                    <span className="font-medium">{tProfile.rating_avg}</span>
                    <span className="text-muted-foreground">({tProfile.review_count})</span>
                  </div>
                  <div className="font-semibold text-owl-violet">
                    Rs. {tProfile.hourly_rate}/hr
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    render={<Link href={`/tasker/${tProfile.id}`}>View Profile</Link>}
                    variant="outline"
                    className="flex-1"
                  />
                  <Button
                    render={<Link href={`/dashboard/book?tasker=${tProfile.id}`}>Book Now</Link>}
                    className="flex-1 bg-owl-violet hover:bg-owl-violet-dark text-white"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
