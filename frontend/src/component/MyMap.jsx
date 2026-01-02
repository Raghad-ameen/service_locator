// src/components/MyMap.jsx
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import { useState } from "react";

export default function MyMap({ value, onChange }) {
  const [pos, setPos] = useState(value || { lat: 15.3694, lon: 44.1910 }); // موقع افتراضي (صنعاء)

  const handleDragEnd = (e) => {
    const marker = e.target;
    const newPos = { lat: marker.getLatLng().lat, lon: marker.getLatLng().lng };
    setPos(newPos);
    onChange?.(newPos); // نرسل الإحداثيات للـ parent
  };

  return (
    <MapContainer center={[pos.lat, pos.lon]} zoom={13} style={{ height: 300, width: "100%" }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker
        position={[pos.lat, pos.lon]}
        draggable={true} // هنا نخلي الـ Marker قابل للسحب
        eventHandlers={{ dragend: handleDragEnd }}
      />
    </MapContainer>
  );
}
