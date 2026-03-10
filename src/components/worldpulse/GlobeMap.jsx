import React from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import "leaflet/dist/leaflet.css";
import HotspotMarker from "./HotspotMarker";
import MapArcLayer from "./MapArcLayer";

function MapResizeSync({ isExpanded = false }) {
  const map = useMap();

  React.useEffect(() => {
    const t = setTimeout(() => {
      map.invalidateSize();
    }, 80);
    return () => clearTimeout(t);
  }, [map, isExpanded]);

  return null;
}

function MapActionControls({ isExpanded = false, onToggleExpand = () => {} }) {
  const map = useMap();

  return (
    <div className="absolute bottom-3 right-3 z-[1000] flex flex-col overflow-hidden rounded-lg border border-white/20 bg-[#091227]/90 shadow-[0_8px_24px_rgba(0,0,0,0.45)]">
      <button
        type="button"
        onClick={onToggleExpand}
        className="flex h-9 w-9 items-center justify-center border-b border-white/15 text-slate-200 transition hover:bg-white/10"
        aria-label={isExpanded ? "Shrink spillover map" : "Expand spillover map"}
        title={isExpanded ? "Shrink map" : "Expand map"}
      >
        {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
      </button>
      <button
        type="button"
        onClick={() => map.zoomIn()}
        className="flex h-9 w-9 items-center justify-center border-b border-white/15 text-slate-200 transition hover:bg-white/10"
        aria-label="Zoom in"
        title="Zoom in"
      >
        <Plus className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => map.zoomOut()}
        className="flex h-9 w-9 items-center justify-center text-slate-200 transition hover:bg-white/10"
        aria-label="Zoom out"
        title="Zoom out"
      >
        <Minus className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function GlobeMap({
  hotspots = [],
  arcs = [],
  manualArc = null,
  onSelectCountry = () => {},
  isExpanded = false,
  onToggleExpand = () => {},
}) {
  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={[18, 12]}
        zoom={2.7}
        minZoom={2.4}
        maxZoom={6}
        zoomSnap={0.1}
        zoomDelta={0.25}
        className="h-full w-full"
        zoomControl={false}
        attributionControl={false}
        scrollWheelZoom={true}
        worldCopyJump={false}
        maxBounds={[[-62, -179.9], [84, 179.9]]}
        maxBoundsViscosity={1}
        preferCanvas={true}
        style={{ background: "#0d1529" }}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={6}
          noWrap={true}
        />
        <MapResizeSync isExpanded={isExpanded} />
        <MapArcLayer arcs={arcs} hotspots={hotspots} manualArc={manualArc} />
        {hotspots.map((spot) => (
          <HotspotMarker key={spot.id} spot={spot} onClick={() => onSelectCountry(spot)} />
        ))}
        <MapActionControls isExpanded={isExpanded} onToggleExpand={onToggleExpand} />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-10 left-4 z-[1000] select-none text-[11px] text-slate-500">
        Scroll to zoom | Click two countries to trace spillover
      </div>
    </div>
  );
}
