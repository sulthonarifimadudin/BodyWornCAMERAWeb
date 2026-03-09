import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Personnel } from "@/hooks/useRealtimePersonnel";

interface SecurityMapProps {
  personnel: Personnel[];
  onSelectPersonnel: (id: string | null) => void;
}

const SecurityMap = ({ personnel, onSelectPersonnel }: SecurityMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const hasFitted = useRef(false);

  // Inisialisasi map sekali saja
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    mapRef.current = L.map(mapContainer.current, {
      center: [-6.973, 107.637],
      zoom: 17,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(mapRef.current);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current.clear();
      }
    };
  }, []);

  // Update markers setiap data personnel berubah
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkers = markersRef.current;
    const activeIds = new Set(personnel.map((p) => p.id));

    // Hapus marker yang sudah tidak ada
    currentMarkers.forEach((marker, id) => {
      if (!activeIds.has(id)) {
        marker.remove();
        currentMarkers.delete(id);
      }
    });

    // Update atau buat marker baru
    personnel.forEach((person) => {
      const color =
        person.status === "online"
          ? "#22c55e"
          : person.status === "alert"
            ? "#ef4444"
            : person.status === "idle"
              ? "#eab308"
              : "#6b7280";

      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div style="
            width: 24px;
            height: 24px;
            background: ${color};
            border: 3px solid rgba(255,255,255,0.9);
            border-radius: 50%;
            box-shadow: 0 0 10px ${color}, 0 0 20px ${color}80;
            position: relative;
          ">
            <div style="
              position: absolute;
              inset: 0;
              border-radius: 50%;
              background: ${color};
              animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
              opacity: 0.4;
            "></div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const popupContent = `
        <div style="min-width: 170px;">
          <strong style="font-size: 14px;">${person.name}</strong>
          <div style="font-size: 11px; color: #888; margin-top: 2px;">${person.role}</div>
          <div style="margin-top: 8px; display: flex; align-items: center; gap: 6px;">
            <span style="
              width: 8px;
              height: 8px;
              border-radius: 50%;
              background: ${color};
            "></span>
            <span style="font-size: 12px; text-transform: capitalize;">${person.status}</span>
          </div>
          <div style="margin-top: 6px; font-size: 11px; color: #aaa;">
            📍 ${person.lat.toFixed(6)}, ${person.lng.toFixed(6)}
          </div>
          <div style="font-size: 11px; color: #aaa;">
            🚀 ${person.speed !== null ? person.speed.toFixed(1) + ' km/h' : 'N/A'}
          </div>
        </div>
      `;

      const existingMarker = currentMarkers.get(person.id);

      if (existingMarker) {
        // Update posisi marker yang sudah ada (smooth move)
        existingMarker.setLatLng([person.lat, person.lng]);
        existingMarker.setIcon(icon);
        existingMarker.getPopup()?.setContent(popupContent);
      } else {
        // Buat marker baru
        const marker = L.marker([person.lat, person.lng], { icon }).addTo(map);
        marker.bindPopup(popupContent);
        marker.on("click", () => {
          onSelectPersonnel(person.id);
        });
        currentMarkers.set(person.id, marker);
      }
    });

    // Auto-fit bounds ke semua marker saat pertama kali data masuk
    if (!hasFitted.current && personnel.length > 0) {
      const bounds = L.latLngBounds(personnel.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 17 });
      hasFitted.current = true;
    }
  }, [personnel, onSelectPersonnel]);

  return (
    <div className="relative w-full h-[calc(100%-57px)]">
      <div ref={mapContainer} className="absolute inset-0" />
      {/* Overlay gradient */}
      <div className="absolute inset-0 pointer-events-none border-t border-border/30">
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-card to-transparent" />
      </div>
    </div>
  );
};

export default SecurityMap;
