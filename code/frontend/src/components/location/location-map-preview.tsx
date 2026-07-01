"use client";

import { useEffect, useRef } from "react";

interface MapPreviewProps {
  latitude: number;
  longitude: number;
}

export function LocationMapPreview({ latitude, longitude }: MapPreviewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  useEffect(() => {
    // Load Leaflet CSS dynamically if not present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    const initMap = () => {
      const L = (window as any).L;
      if (!L || !mapRef.current) return;

      if (!leafletInstance.current) {
        leafletInstance.current = L.map(mapRef.current).setView([latitude, longitude], 15);
        
        const apiKey = process.env.NEXT_PUBLIC_VIETMAP_API_KEY || "7a45350d010dc9414c4a0149d8eb129b6adb5601c6eb6c4e";
        
        // Define tile URL candidates
        const vietmapTileUrl1 = `https://maps.vietmap.vn/tm/{z}/{x}/{y}.png?apikey=${apiKey}`;
        const vietmapTileUrl2 = `https://maps.vietmap.vn/api/tiles/{z}/{x}/{y}.png?apikey=${apiKey}`;
        const osmTileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

        const tileLayer = L.tileLayer(vietmapTileUrl1, {
          attribution: "© VietMap",
          maxZoom: 19
        }).addTo(leafletInstance.current);

        // Fallback logic if any tile request fails (e.g. key domain restriction, incorrect api style, etc.)
        let errorCount = 0;
        tileLayer.on("tileerror", () => {
          errorCount++;
          if (errorCount === 1) {
            console.warn("VietMap Tile URL 1 failed, trying URL 2...");
            tileLayer.setUrl(vietmapTileUrl2);
          } else if (errorCount === 2) {
            console.warn("VietMap Tile URL 2 failed, falling back to OpenStreetMap...");
            tileLayer.setUrl(osmTileUrl);
            tileLayer.options.attribution = "© OpenStreetMap";
          }
        });

        // Customize marker icon to avoid default Leaflet asset path resolution issues in Next.js
        const defaultIcon = L.icon({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        markerInstance.current = L.marker([latitude, longitude], { icon: defaultIcon }).addTo(leafletInstance.current);
      } else {
        leafletInstance.current.setView([latitude, longitude], 15);
        if (markerInstance.current) {
          markerInstance.current.setLatLng([latitude, longitude]);
        }
      }
    };

    // Load Leaflet Script dynamically if not present
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = initMap;
      document.body.appendChild(script);
    } else {
      initMap();
    }

    return () => {
      if (leafletInstance.current) {
        leafletInstance.current.remove();
        leafletInstance.current = null;
        markerInstance.current = null;
      }
    };
  }, [latitude, longitude]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-zinc-200 shadow-sm relative z-0">
      <div ref={mapRef} className="w-full h-[300px] bg-zinc-50" />
    </div>
  );
}
