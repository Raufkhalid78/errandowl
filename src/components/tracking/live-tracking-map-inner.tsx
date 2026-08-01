"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LiveTrackingMapInnerProps {
  taskerLat: number;
  taskerLng: number;
  taskerHeading?: number;
  clientLat: number;
  clientLng: number;
}

export default function LiveTrackingMapInner({
  taskerLat,
  taskerLng,
  taskerHeading,
  clientLat,
  clientLng,
}: LiveTrackingMapInnerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const taskerMarkerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(containerRef.current, {
        center: [taskerLat, taskerLng],
        zoom: 14,
        zoomControl: true,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Client destination marker
      const clientIcon = L.divIcon({
        className: "client-destination-pin",
        html: `
          <div style="background: #10b981; color: white; padding: 6px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(16,185,129,0.5);">
            🏠
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      L.marker([clientLat, clientLng], { icon: clientIcon })
        .addTo(map)
        .bindPopup("<b>Job Location</b>");

      // Tasker live marker
      const headingRotate = taskerHeading !== undefined ? `transform: rotate(${taskerHeading}deg); transform-origin: center; display: inline-block;` : "";
      
      const taskerIcon = L.divIcon({
        className: "tasker-live-pin",
        html: `
          <div style="background: #6366f1; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 12px rgba(99,102,241,0.5); display: flex; align-items: center; gap: 4px; animation: pulse 2s infinite;">
            <span style="${headingRotate}">⬆️</span> <span>Tasker</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });

      const marker = L.marker([taskerLat, taskerLng], { icon: taskerIcon })
        .addTo(map)
        .bindPopup("<b>Tasker Location</b>");

      taskerMarkerRef.current = marker;
      mapRef.current = map;
    }

    if (mapRef.current && taskerMarkerRef.current) {
      taskerMarkerRef.current.setLatLng([taskerLat, taskerLng]);
      
      const headingRotate = taskerHeading !== undefined ? `transform: rotate(${taskerHeading}deg); transform-origin: center; display: inline-block;` : "";
      const taskerIcon = L.divIcon({
        className: "tasker-live-pin",
        html: `
          <div style="background: #6366f1; color: white; padding: 6px 12px; border-radius: 20px; font-weight: bold; font-size: 11px; border: 2px solid white; box-shadow: 0 4px 12px rgba(99,102,241,0.5); display: flex; align-items: center; gap: 4px; animation: pulse 2s infinite;">
            <span style="${headingRotate}">⬆️</span> <span>Tasker</span>
          </div>
        `,
        iconSize: [80, 30],
        iconAnchor: [40, 15],
      });
      taskerMarkerRef.current.setIcon(taskerIcon);

      const bounds = L.latLngBounds([
        [taskerLat, taskerLng],
        [clientLat, clientLng],
      ]);
      mapRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [taskerLat, taskerLng, taskerHeading, clientLat, clientLng]);

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return <div ref={containerRef} className="w-full h-[350px]" />;
}
