"use client";

import { useState } from "react";
import { APIProvider, Map, Marker, InfoWindow } from "@vis.gl/react-google-maps";

interface TaskerMapProps {
  taskers: any[];
}

const PAKISTAN_CENTER = { lat: 30.3753, lng: 69.3451 };

export function TaskerMap({ taskers }: TaskerMapProps) {
  const [selectedTasker, setSelectedTasker] = useState<any | null>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  if (!apiKey) {
    return (
      <div className="w-full h-[400px] bg-muted rounded-2xl flex items-center justify-center border border-dashed text-center p-8">
        <div>
          <div className="text-4xl mb-4">🗺️</div>
          <h3 className="font-semibold mb-2">Google Maps Key Missing</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your .env.local file to enable the map view.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] rounded-2xl overflow-hidden border border-border/50 shadow-sm">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={PAKISTAN_CENTER}
          defaultZoom={5}
          gestureHandling={"greedy"}
          disableDefaultUI={false}
          mapId={"errandowl_map"}
        >
          {taskers.map((tasker) => (
            <Marker
              key={tasker.id}
              position={{
                lat: tasker.lat || 31.5204, // Default to Lahore if missing
                lng: tasker.lng || 74.3587,
              }}
              onClick={() => setSelectedTasker(tasker)}
            />
          ))}

          {selectedTasker && (
            <InfoWindow
              position={{
                lat: selectedTasker.lat || 31.5204,
                lng: selectedTasker.lng || 74.3587,
              }}
              onCloseClick={() => setSelectedTasker(null)}
            >
              <div className="p-2">
                <h4 className="font-bold text-sm">{selectedTasker.name}</h4>
                <p className="text-xs text-muted-foreground">{selectedTasker.location}</p>
                <p className="text-xs font-semibold text-owl-violet mt-1">
                  Rs {selectedTasker.hourly_rate}/hr
                </p>
              </div>
            </InfoWindow>
          )}
        </Map>
      </APIProvider>
    </div>
  );
}
