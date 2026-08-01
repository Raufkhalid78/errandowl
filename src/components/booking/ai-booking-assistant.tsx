"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, Tag, Coins, Check, Loader2 } from "lucide-react";

interface AiBookingAssistantProps {
  description: string;
  onApplyEstimate: (data: {
    category_id: string;
    estimated_hours: number;
    quoted_rate: number;
  }) => void;
}

export function AiBookingAssistant({ description, onApplyEstimate }: AiBookingAssistantProps) {
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<{
    category_id: string;
    estimated_hours: number;
    min_price: number;
    max_price: number;
    reasoning: string;
  } | null>(null);

  const handleGenerateEstimate = async () => {
    if (!description || description.trim().length < 10) return;

    setLoading(true);
    try {
      const res = await fetch("/api/estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description }),
      });
      const data = await res.json();
      if (data && !data.error) {
        setEstimate(data);
      }
    } catch (err) {
      console.error("AI estimation error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 rounded-2xl border border-owl-violet/20 bg-gradient-to-br from-owl-violet/5 via-background to-owl-amber/5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-owl-amber animate-pulse" />
          <h4 className="font-bold text-sm">Gemini AI Booking Assistant</h4>
        </div>

        <Button
          type="button"
          onClick={handleGenerateEstimate}
          disabled={loading || !description || description.trim().length < 10}
          size="sm"
          className="bg-owl-violet hover:bg-owl-violet-dark text-white text-xs font-bold gap-1 rounded-xl"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Auto-Suggest Task Details
        </Button>
      </div>

      {estimate && (
        <div className="p-4 rounded-xl border border-border bg-card/80 space-y-3 animate-in fade-in">
          <p className="text-xs text-muted-foreground leading-relaxed italic">
            "{estimate.reasoning}"
          </p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-muted/40 border">
              <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                <Tag className="h-3 w-3 text-owl-violet" /> Category
              </span>
              <span className="font-bold capitalize">{estimate.category_id.replace("_", " ")}</span>
            </div>

            <div className="p-2 rounded-lg bg-muted/40 border">
              <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                <Clock className="h-3 w-3 text-owl-violet" /> Duration
              </span>
              <span className="font-bold">{estimate.estimated_hours} Hours</span>
            </div>

            <div className="p-2 rounded-lg bg-muted/40 border">
              <span className="text-[10px] text-muted-foreground block flex items-center gap-1">
                <Coins className="h-3 w-3 text-owl-amber" /> Price Range
              </span>
              <span className="font-bold text-owl-violet">
                Rs {estimate.min_price} - {estimate.max_price}
              </span>
            </div>
          </div>

          <Button
            type="button"
            onClick={() =>
              onApplyEstimate({
                category_id: estimate.category_id,
                estimated_hours: estimate.estimated_hours,
                quoted_rate: Math.round((estimate.min_price + estimate.max_price) / 2),
              })
            }
            className="w-full bg-owl-emerald hover:bg-owl-emerald-dark text-white text-xs font-bold h-9 rounded-lg gap-1"
          >
            <Check className="h-4 w-4" /> Apply AI Suggestions to Booking Form
          </Button>
        </div>
      )}
    </div>
  );
}
