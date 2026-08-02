"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface TaskerMapInnerProps {
  taskers: any[];
}

const PAKISTAN_CENTER: [number, number] = [30.3753, 69.3451];

export default function TaskerMapInner({ taskers }: TaskerMapInnerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: PAKISTAN_CENTER,
        zoom: 6,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // CARTO Voyager Tiles (Vibrant, high quality modern style)
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Fix Leaflet container size bug (grey screen)
      setTimeout(() => { map.invalidateSize(); }, 200);

      mapInstanceRef.current = map;
      markersLayerRef.current = L.layerGroup().addTo(map);
    }

    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;

    if (markersLayer) {
      markersLayer.clearLayers();
    }

    if (taskers && taskers.length > 0 && map && markersLayer) {
      const bounds: [number, number][] = [];

      taskers.forEach((tasker) => {
        const lat = parseFloat(tasker.lat) || 31.5204; // Default to Lahore coordinates if null
        const lng = parseFloat(tasker.lng) || 74.3587;

        bounds.push([lat, lng]);

        // Custom HTML Marker Pill with Price & Owl Styling
        const customIcon = L.divIcon({
          className: "custom-leaflet-marker",
          html: `
            <div style="
              background: #6366f1;
              color: white;
              padding: 6px 12px;
              border-radius: 20px;
              font-weight: 700;
              font-size: 12px;
              box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
              border: 2px solid white;
              display: flex;
              align-items: center;
              gap: 4px;
              white-space: nowrap;
              cursor: pointer;
              transition: transform 0.2s ease;
            ">
              <span>🦉</span>
              <span>Rs ${tasker.pricing_mode === 'hourly' ? tasker.hourly_rate : (tasker.fixed_rate || tasker.hourly_rate || 500)}</span>
            </div>
          `,
          iconSize: [110, 32],
          iconAnchor: [55, 16],
        });

        const popupContent = `
          <div style="padding: 4px; min-width: 160px; font-family: system-ui, sans-serif;">
            <div style="font-weight: 700; font-size: 14px; color: #0f172a; margin-bottom: 2px;">${tasker.name || "Tasker"}</div>
            <div style="font-size: 12px; color: #64748b; margin-bottom: 6px;">${tasker.location || tasker.city || "Pakistan"}</div>
            <div style="display: flex; justify-space-between; align-items: center;">
              <span style="font-size: 12px; font-weight: 600; color: #6366f1;">⭐ ${tasker.rating_avg || 5.0} (${tasker.review_count || 0})</span>
            </div>
            <a href="/tasker/${tasker.profile_id || tasker.id}" style="
              display: block;
              margin-top: 8px;
              padding: 6px 10px;
              background: #6366f1;
              color: white;
              text-align: center;
              border-radius: 8px;
              text-decoration: none;
              font-size: 11px;
              font-weight: 600;
            ">View Profile</a>
          </div>
        `;

        const marker = L.marker([lat, lng], { icon: customIcon });
        marker.bindPopup(popupContent);
        markersLayer.addLayer(marker);
      });

      // Adjust map bounds if multiple taskers exist
      if (bounds.length > 1) {
        map.fitBounds(bounds, { padding: [40, 40], maxZoom: 13 });
      } else if (bounds.length === 1) {
        map.setView(bounds[0], 12);
      }
    }
  }, [taskers]);

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative w-full h-[450px]">
      <div ref={mapContainerRef} className="w-full h-full z-0" />
      <button
        onClick={() => mapInstanceRef.current?.locate({ setView: true, maxZoom: 14 })}
        className="absolute top-4 right-4 z-[400] bg-white text-owl-violet px-4 py-2 rounded-xl shadow-lg font-semibold text-sm hover:bg-gray-50 flex items-center gap-2 border border-border"
      >
        <span>📍</span> Use My Location
      </button>
    </div>
  );
}
