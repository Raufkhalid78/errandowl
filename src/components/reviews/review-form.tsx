"use client";

import { useState } from "react";
import { Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useTranslations } from "next-intl";

interface ReviewFormProps {
  bookingId: string;
  clientId: string;
  taskerId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ bookingId, clientId, taskerId, onSuccess }: ReviewFormProps) {
  const t = useTranslations("Reviews");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return alert(t('selectRating'));

    setLoading(true);
    const { error } = await supabase.from("reviews").insert({
      booking_id: bookingId,
      client_id: clientId,
      tasker_id: taskerId,
      rating,
      text,
    });

    if (error) {
      alert(error.message);
    } else {
      setRating(0);
      setText("");
      if (onSuccess) onSuccess();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border border-border/50 bg-card glass">
      <h3 className="font-semibold">{t('leaveReview')}</h3>
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="transition-all hover:scale-110 focus:outline-none"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`h-8 w-8 ${
                (hover || rating) >= star ? "fill-owl-amber text-owl-amber" : "text-muted-foreground/30"
              }`}
            />
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={t('placeholder')}
        className="w-full min-h-[100px] p-3 rounded-xl border border-input bg-background text-sm focus:ring-2 focus:ring-owl-violet/20 outline-none transition-all"
        required
      />

      <Button
        disabled={loading || rating === 0}
        className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white"
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {t('submit')}
      </Button>
    </form>
  );
}
