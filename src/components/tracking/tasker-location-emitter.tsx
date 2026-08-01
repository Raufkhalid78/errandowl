"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface TaskerLocationEmitterProps {
  bookingId: string;
  taskerProfileId: string;
}

export function TaskerLocationEmitter({ bookingId, taskerProfileId }: TaskerLocationEmitterProps) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [watchId, setWatchId] = useState<number | null>(null);
  const supabase = createClient();

  const startStreaming = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    const id = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, heading } = pos.coords;

        // Upsert into tracking_sessions
        const { error } = await supabase.from("tracking_sessions").upsert(
          {
            booking_id: bookingId,
            tasker_id: taskerProfileId,
            lat: latitude,
            lng: longitude,
            heading: heading || 0,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "booking_id" }
        );

        if (error) {
          console.error("Error streaming location:", error);
        } else {
          setIsStreaming(true);
        }
      },
      (err) => {
        console.error("GPS watch error:", err.message);
        toast.error("GPS signal error: " + err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    setWatchId(id);
    toast.success("Live GPS Location Streaming Started");
  };

  const stopStreaming = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
    setIsStreaming(false);
    toast.info("GPS Streaming Stopped");
  };

  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return (
    <div className="p-4 rounded-2xl border border-owl-violet/20 bg-owl-violet/5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${isStreaming ? "bg-owl-emerald text-white animate-pulse" : "bg-muted text-muted-foreground"}`}>
          <Navigation className="h-5 w-5" />
        </div>
        <div>
          <h4 className="font-semibold text-sm">GPS Location Broadcast</h4>
          <p className="text-xs text-muted-foreground">
            {isStreaming ? "Broadcasting live coordinates to client" : "Tap start when heading to client's location"}
          </p>
        </div>
      </div>

      <Button
        onClick={isStreaming ? stopStreaming : startStreaming}
        variant={isStreaming ? "destructive" : "default"}
        className={!isStreaming ? "bg-owl-violet hover:bg-owl-violet-dark text-white" : ""}
      >
        {isStreaming ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Stop GPS
          </>
        ) : (
          "Start GPS Stream"
        )}
      </Button>
    </div>
  );
}
