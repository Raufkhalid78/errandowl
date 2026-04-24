"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";

interface ReviewListProps {
  taskerId: string;
}

export function ReviewList({ taskerId }: ReviewListProps) {
  const t = useTranslations("Reviews");
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchReviews = async () => {
      const { data } = await supabase
        .from("reviews")
        .select("*, profiles!client_id(name, avatar_url)")
        .eq("tasker_id", taskerId)
        .order("created_at", { ascending: false });

      if (data) setReviews(data);
      setLoading(false);
    };
    fetchReviews();
  }, [taskerId]);

  if (loading) return <div className="flex justify-center py-10"><Loader2 className="animate-spin h-6 w-6 text-owl-violet" /></div>;

  if (reviews.length === 0) {
    return <div className="text-center py-10 text-muted-foreground text-sm border border-dashed rounded-2xl">{t('noReviews')}</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div key={review.id} className="p-4 rounded-xl border border-border/50 bg-card/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                {review.profiles?.name?.[0]?.toUpperCase() || "C"}
              </div>
              <span className="font-medium text-sm">{review.profiles?.name}</span>
            </div>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`h-3 w-3 ${
                    review.rating >= star ? "fill-owl-amber text-owl-amber" : "text-muted-foreground/20"
                  }`}
                />
              ))}
            </div>
          </div>
          <p className="text-sm text-foreground/80 leading-relaxed">{review.text}</p>
          <div className="mt-2 text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
}
