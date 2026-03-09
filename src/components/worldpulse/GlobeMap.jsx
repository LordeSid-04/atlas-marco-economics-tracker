import React from "react";
import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import HotspotMarker from "./HotspotMarker";
import MapArcLayer from "./MapArcLayer";

export default function GlobeMap({ hotspots = [], arcs = [], manualArc = null, onSelectCountry = () => {} }) {
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
        <MapArcLayer arcs={arcs} hotspots={hotspots} manualArc={manualArc} />
        {hotspots.map((spot) => (
          <HotspotMarker key={spot.id} spot={spot} onClick={() => onSelectCountry(spot)} />
        ))}
        <ZoomControl position="bottomright" />
      </MapContainer>

      <div className="pointer-events-none absolute bottom-10 left-4 z-[1000] select-none text-[11px] text-slate-500">
        Scroll to zoom | Click two countries to trace spillover
      </div>
    </div>
  );
}
