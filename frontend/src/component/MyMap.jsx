import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";

function FitBounds({ bounds }) {
  const map = useMapEvents({});
  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds);
    }
  }, [bounds, map]);
  return null;
}

// ✅ هذا المكوّن يحرك الخريطة عند تغيّر pos
function MapUpdater({ pos }) {
  const map = useMap();
  useEffect(() => {
    if (pos) {
      map.flyTo([pos.lat, pos.lon], map.getZoom()); 
      // أو map.setView([pos.lat, pos.lon], map.getZoom());
    }
  }, [pos, map]);
  return null;
}

export default function MyMap({ value, onChange, bounds, zoom }) {
  const [pos, setPos] = useState(value || { lat: 15.3694, lon: 44.1910 });

  useEffect(() => {
    if (value) setPos(value);
  }, [value]);

  const handleDragEnd = (e) => {
    const p = e.target.getLatLng();
    const newPos = { lat: p.lat, lon: p.lng };
    setPos(newPos);
    onChange(newPos);
  };

  const MapClick = () => {
    useMapEvents({
      click(e) {
        const newPos = { lat: e.latlng.lat, lon: e.latlng.lng };
        setPos(newPos);
        onChange(newPos);
      },
    });
    return null;
  };

  return (
    <MapContainer
      center={[pos.lat, pos.lon]}
      zoom={zoom}
      style={{ height: 300, width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <FitBounds bounds={bounds} />
      <Marker
        position={[pos.lat, pos.lon]}
        draggable
        eventHandlers={{ dragend: handleDragEnd }}
      />
      <MapClick />
      <MapUpdater pos={pos} zoom={zoom} /> {/* ✅ يحرك الخريطة مع الماركر */}
    </MapContainer>
  );
}