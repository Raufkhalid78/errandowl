"use client"

import * as React from "react"
import { createClient } from "@/lib/supabase/client"
import { APIProvider, Map, AdvancedMarker, Pin } from "@vis.gl/react-google-maps"
import { Loader2, Navigation, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

interface LiveMapProps {
  bookingId: string
  taskerId: string
  isTasker: boolean
}

export function LiveMap({ bookingId, taskerId, isTasker }: LiveMapProps) {
  const [position, setPosition] = React.useState<{ lat: number, lng: number } | null>(null)
  const [isBroadcasting, setIsBroadcasting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()
  const watchIdRef = React.useRef<number | null>(null)

  // Client side: Subscribe to realtime updates
  React.useEffect(() => {
    if (isTasker) return // Taskers broadcast, clients subscribe

    const fetchInitial = async () => {
      const { data } = await supabase.from("tracking_sessions").select("*").eq("booking_id", bookingId).maybeSingle()
      if (data) setPosition({ lat: data.lat, lng: data.lng })
    }
    fetchInitial()

    const channel = supabase.channel(`tracking_${bookingId}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tracking_sessions', filter: `booking_id=eq.${bookingId}` }, 
      (payload) => {
        setPosition({ lat: payload.new.lat, lng: payload.new.lng })
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tracking_sessions', filter: `booking_id=eq.${bookingId}` }, 
      (payload) => {
        setPosition({ lat: payload.new.lat, lng: payload.new.lng })
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [bookingId, isTasker, supabase])

  // Tasker side: Broadcast location
  const toggleBroadcast = async () => {
    if (isBroadcasting) {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
      setIsBroadcasting(false)
      return
    }

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.")
      return
    }

    setIsBroadcasting(true)
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        const { latitude, longitude, heading } = pos.coords
        setPosition({ lat: latitude, lng: longitude })

        // Upsert to Supabase
        await supabase.from("tracking_sessions").upsert({
          booking_id: bookingId,
          tasker_id: taskerId,
          lat: latitude,
          lng: longitude,
          heading: heading,
          updated_at: new Date()
        }, { onConflict: "booking_id" })
      },
      (err) => {
        setError("Error getting location: " + err.message)
        setIsBroadcasting(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  React.useEffect(() => {
    return () => {
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current)
    }
  }, [])

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  return (
    <div className="space-y-4">
      {isTasker && (
        <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border">
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <Navigation className="h-4 w-4" /> Live Tracking
            </h4>
            <p className="text-sm text-muted-foreground">Share your location with the client</p>
          </div>
          <Button 
            onClick={toggleBroadcast}
            variant={isBroadcasting ? "destructive" : "default"}
            className={isBroadcasting ? "" : "bg-owl-emerald hover:bg-owl-emerald/90"}
          >
            {isBroadcasting ? "Stop Sharing" : "Start Journey"}
          </Button>
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="h-[300px] w-full rounded-xl overflow-hidden border bg-muted flex items-center justify-center relative">
        {!apiKey ? (
          <div className="text-center text-muted-foreground p-6">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-20" />
            <p className="text-sm">Map rendering disabled.</p>
            <p className="text-xs">Google Maps API key not configured.</p>
            {position && (
              <p className="text-xs mt-4 font-mono">Current: {position.lat.toFixed(4)}, {position.lng.toFixed(4)}</p>
            )}
          </div>
        ) : position ? (
          <APIProvider apiKey={apiKey}>
            <Map defaultZoom={15} defaultCenter={position} mapId="live-tracking-map">
              <AdvancedMarker position={position}>
                <Pin background={'#8b5cf6'} borderColor={'#5b21b6'} glyphColor={'#ffffff'} />
              </AdvancedMarker>
            </Map>
          </APIProvider>
        ) : (
          <div className="text-center text-muted-foreground">
            {isTasker ? "Click Start Journey to begin tracking" : "Waiting for Tasker to start journey..."}
          </div>
        )}
      </div>
    </div>
  )
}
