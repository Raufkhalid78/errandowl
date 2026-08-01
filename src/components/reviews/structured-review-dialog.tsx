"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Star, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface StructuredReviewDialogProps {
  bookingId: string;
  clientId: string;
  taskerId: string;
  onSuccess?: () => void;
}

export function StructuredReviewDialog({
  bookingId,
  clientId,
  taskerId,
  onSuccess,
}: StructuredReviewDialogProps) {
  const [punctuality, setPunctuality] = useState(5);
  const [quality, setQuality] = useState(5);
  const [professionalism, setProfessionalism] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const overallRating = Math.round((punctuality + quality + professionalism) / 3);

  const handleSubmitReview = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from("reviews").insert({
        booking_id: bookingId,
        client_id: clientId,
        tasker_id: taskerId,
        rating: overallRating,
        punctuality_rating: punctuality,
        quality_rating: quality,
        professionalism_rating: professionalism,
        comment,
      });

      if (error) throw error;

      toast.success("Thank you! Review submitted successfully.");
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error("Error submitting review: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStarSelector = (value: number, onChange: (v: number) => void) => (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform"
        >
          <Star
            className={`h-6 w-6 ${
              star <= value
                ? "fill-owl-amber text-owl-amber"
                : "text-muted-foreground/30"
            }`}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 rounded-3xl border border-border/50 glass space-y-6">
      <div>
        <h3 className="text-xl font-bold">Rate Tasker Performance</h3>
        <p className="text-sm text-muted-foreground">
          Provide category ratings to help maintain service quality.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">⏰ Punctuality & Timeliness</span>
          {renderStarSelector(punctuality, setPunctuality)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">🛠️ Work Quality & Skill</span>
          {renderStarSelector(quality, setQuality)}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">🤝 Professionalism & Conduct</span>
          {renderStarSelector(professionalism, setProfessionalism)}
        </div>

        <div className="pt-2">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
            Written Feedback
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience working with this tasker..."
            rows={3}
            className="w-full rounded-xl border border-border bg-background p-3 text-sm outline-none focus:border-owl-violet"
          />
        </div>
      </div>

      <Button
        onClick={handleSubmitReview}
        disabled={loading}
        className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white font-bold h-12 rounded-xl"
      >
        {loading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
        Submit Review ({overallRating} ★ Overall)
      </Button>
    </div>
  );
}
