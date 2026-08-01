"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navigation, Clock, MapPin, ShieldAlert, Loader2 } from "lucide-react";

interface LiveTrackingMapProps {
  bookingId: string;
  clientLat?: number;
  clientLng?: number;
}

const LeafletTrackingMapInner = dynamic(() => import("./live-tracking-map-inner"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[350px] bg-muted/20 rounded-2xl flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-8 w-8 animate-spin text-owl-violet" />
      <span className="text-sm font-medium text-muted-foreground">Connecting Live GPS Feed...</span>
    </div>
  ),
});

export function LiveTrackingMap({ bookingId, clientLat = 31.5204, clientLng = 74.3587 }: LiveTrackingMapProps) {
  const [taskerLocation, setTaskerLocation] = useState<{ lat: number; lng: number; heading?: number } | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | null>(null);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const supabase = createClient();

  // Calculate straight line distance and rough ETA
  const calculateDistanceAndEta = (tLat: number, tLng: number, cLat: number, cLng: number) => {
    const R = 6371; // Earth radius in km
    const dLat = ((cLat - tLat) * Math.PI) / 180;
    const dLng = ((cLng - tLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((tLat * Math.PI) / 180) *
        Math.cos((cLat * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const dist = R * c; // Distance in km

    setDistanceKm(parseFloat(dist.toFixed(2)));
    // Assume average speed 25 km/h in city traffic
    const eta = Math.ceil((dist / 25) * 60);
    setEtaMinutes(Math.max(eta, 2));
  };

  useEffect(() => {
    const fetchInitialLocation = async () => {
      const { data } = await supabase
        .from("tracking_sessions")
        .select("current_lat, current_lng, last_updated, heading")
        .eq("booking_id", bookingId)
        .maybeSingle();

      if (data && data.current_lat && data.current_lng) {
        const lat = parseFloat(data.current_lat as unknown as string);
        const lng = parseFloat(data.current_lng as unknown as string);
        const heading = data.heading ? parseFloat(data.heading as unknown as string) : undefined;
        setTaskerLocation({ lat, lng, heading });
        setLastUpdated(new Date(data.last_updated as string));
        calculateDistanceAndEta(lat, lng, clientLat, clientLng);
      }
    };

    fetchInitialLocation();

    // Subscribe to Supabase Realtime updates
    const channel = supabase
      .channel(`tracking:${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tracking_sessions",
          filter: `booking_id=eq.${bookingId}`,
        },
        (payload: any) => {
          if (payload.new && payload.new.current_lat && payload.new.current_lng) {
            const lat = parseFloat(payload.new.current_lat);
            const lng = parseFloat(payload.new.current_lng);
            const heading = payload.new.heading !== null && payload.new.heading !== undefined ? parseFloat(payload.new.heading) : undefined;
            setTaskerLocation({ lat, lng, heading });
            setLastUpdated(new Date());
            calculateDistanceAndEta(lat, lng, clientLat, clientLng);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, clientLat, clientLng, supabase]);

  return (
    <Card className="glass overflow-hidden border-owl-violet/20 shadow-lg">
      <div className="p-4 bg-owl-violet/5 border-b border-border/50 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Navigation className="h-5 w-5 text-owl-violet animate-pulse" />
          <h3 className="font-bold text-base">Live Job Tracking</h3>
        </div>

        <div className="flex items-center gap-3">
          {distanceKm !== null && (
            <Badge variant="outline" className="bg-background/80 text-owl-violet border-owl-violet/30 font-semibold gap-1">
              <MapPin className="h-3 w-3" /> {distanceKm} km away
            </Badge>
          )}

          {etaMinutes !== null && (
            <Badge className="bg-owl-emerald text-white font-bold gap-1">
              <Clock className="h-3 w-3" /> ETA ~{etaMinutes} mins
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-0 relative">
        <LeafletTrackingMapInner
          taskerLat={taskerLocation?.lat || clientLat + 0.01}
          taskerLng={taskerLocation?.lng || clientLng + 0.01}
          taskerHeading={taskerLocation?.heading}
          clientLat={clientLat}
          clientLng={clientLng}
        />

        {!taskerLocation && (
          <div className="absolute top-4 left-4 right-4 bg-background/90 backdrop-blur-md border border-border p-3 rounded-xl shadow-md text-xs flex items-center justify-between">
            <span className="flex items-center gap-2 text-muted-foreground">
              <ShieldAlert className="h-4 w-4 text-amber-500" /> Waiting for Tasker GPS stream to start...
            </span>
            <span className="text-[10px] bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded font-mono">STANDBY</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
