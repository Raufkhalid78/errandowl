"use client";

import { useEffect, useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Review } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { useTranslations } from "next-intl";

interface ReviewListProps {
  taskerId: string;
}

export function ReviewList({ taskerId }: ReviewListProps) {
  const t = useTranslations("Reviews");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabaseClient = createClient();
    const fetchReviews = async () => {
      const { data } = await supabaseClient
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
          
          {(review.rating_punctuality || review.rating_quality || review.rating_communication) && (
            <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border/30 text-[10px] text-muted-foreground">
              {review.rating_punctuality && <div>Punctuality: {review.rating_punctuality}/5</div>}
              {review.rating_quality && <div>Quality: {review.rating_quality}/5</div>}
              {review.rating_communication && <div>Communication: {review.rating_communication}/5</div>}
            </div>
          )}

          {review.tasker_reply && (
            <div className="mt-3 bg-muted/30 p-3 rounded-lg border-l-2 border-owl-amber text-sm">
              <div className="text-[10px] font-bold text-owl-amber mb-1 uppercase">Tasker Reply</div>
              <p className="text-foreground/80 text-xs">{review.tasker_reply}</p>
            </div>
          )}

          <div className="mt-2 text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </div>
        </div>
      ))}
    </div>
  );
}
