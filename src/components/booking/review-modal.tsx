"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Loader2, MessageSquare, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ReviewModalProps {
  bookingId: string;
  taskerId: string;
  taskerName: string;
  serviceName: string;
  buttonClass?: string;
  onSuccess?: () => void;
}

export function ReviewModal({ bookingId, taskerId, taskerName, serviceName, buttonClass, onSuccess }: ReviewModalProps) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const supabase = createClient();

  const handleSubmit = async () => {
    if (rating === 0) return;
    
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from("reviews")
      .insert({
        booking_id: bookingId,
        tasker_id: taskerId,
        client_id: user.id,
        rating,
        comment,
      });

    if (!error) {
      setSuccess(true);
      if (onSuccess) onSuccess();
      setTimeout(() => setOpen(false), 2000);
    }
    
    setLoading(false);
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        className={buttonClass || "bg-owl-violet hover:bg-owl-violet-dark text-white shadow-md shadow-owl-violet/20"}
      >
        <Star className="mr-2 h-4 w-4 fill-current" />
        Leave a Review
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md p-6 bg-background rounded-2xl shadow-xl glass border-owl-violet/20 m-4">
            <button 
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-5 w-5" />
            </button>
            
            <div className="mb-4">
              <h2 className="text-xl font-bold">Rate your experience</h2>
              <p className="text-sm text-muted-foreground">
                How was your {serviceName} experience with {taskerName}?
              </p>
            </div>

            {success ? (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <div className="w-12 h-12 rounded-full bg-owl-emerald/10 flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-owl-emerald fill-owl-emerald" />
                </div>
                <h3 className="text-lg font-medium text-owl-emerald">Thank you!</h3>
                <p className="text-sm text-muted-foreground mt-1">Your review has been submitted successfully.</p>
              </div>
            ) : (
              <div className="space-y-6 py-4">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        className={`transition-all p-1 ${
                          (hoverRating || rating) >= star 
                            ? "text-owl-amber scale-110" 
                            : "text-muted-foreground/30 hover:text-muted-foreground/60"
                        }`}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => setRating(star)}
                      >
                        <Star className={`h-8 w-8 ${(hoverRating || rating) >= star ? "fill-current" : ""}`} />
                      </button>
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground font-medium">
                    {rating === 0 ? "Select a rating" : 
                     rating === 1 ? "Poor" : 
                     rating === 2 ? "Fair" : 
                     rating === 3 ? "Good" : 
                     rating === 4 ? "Very Good" : "Excellent!"}
                  </p>
                </div>

                <div className="space-y-2">
                  <label htmlFor="comment" className="text-sm font-medium flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-owl-violet" />
                    Add a written review (Optional)
                  </label>
                  <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder={`Describe your experience with ${taskerName}...`}
                    className="w-full min-h-[100px] p-3 rounded-lg border border-input bg-background text-sm focus:ring-2 focus:ring-owl-violet/20 outline-none transition-all resize-none"
                  />
                </div>

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || rating === 0}
                  className="w-full bg-owl-violet hover:bg-owl-violet-dark text-white"
                >
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {loading ? "Submitting..." : "Submit Review"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
