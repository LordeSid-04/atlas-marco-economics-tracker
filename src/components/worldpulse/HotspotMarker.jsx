import React from "react";
import { Marker } from "react-leaflet";
import L from "leaflet";

export default function HotspotMarker({ spot, onClick }) {
  const pinSize = 16 + Math.round((spot.heat / 100) * 3);

  const icon = L.divIcon({
    html: `
      <div style="position:relative;width:${pinSize * 2.6}px;height:${pinSize * 2.6}px;display:flex;align-items:center;justify-content:center;">
        <div style="
          position:absolute;
          width:${pinSize * 2.3}px;height:${pinSize * 2.3}px;
          border-radius:50%;
          background:#ef4444;
          opacity:0.12;
          animation:pin-heartbeat 1.6s ease-in-out infinite;
        "></div>
        <div style="
          position:absolute;
          width:${pinSize * 1.3}px;height:${pinSize * 1.3}px;
          border-radius:50%;
          border:1px solid #fca5a5;
          opacity:0.3;
          animation:pin-heartbeat 1.6s ease-in-out infinite 0.22s;
        "></div>
        <div style="
          position:relative;
          width:${pinSize}px;height:${pinSize}px;
          cursor:pointer;
          animation:pin-bounce 2.3s ease-in-out infinite;
        ">
          <svg viewBox="0 0 24 24" width="${pinSize}" height="${pinSize}" fill="#ef4444" style="filter: drop-shadow(0 0 8px rgba(239,68,68,0.75));">
            <path d="M12 2C7.58 2 4 5.58 4 10c0 5.25 6.44 11.24 7.02 11.77a1.5 1.5 0 0 0 1.96 0C13.56 21.24 20 15.25 20 10c0-4.42-3.58-8-8-8z"></path>
            <circle cx="12" cy="10" r="2.9" fill="#fee2e2"></circle>
          </svg>
        </div>
      </div>
    `,
    className: "",
    iconSize: [pinSize * 2.6, pinSize * 2.6],
    iconAnchor: [pinSize * 1.3, pinSize * 2.2],
    tooltipAnchor: [0, -pinSize * 1.1],
  });

  return (
    <Marker position={[spot.lat, spot.lng]} icon={icon} eventHandlers={{ click: onClick }} />
  );
}
