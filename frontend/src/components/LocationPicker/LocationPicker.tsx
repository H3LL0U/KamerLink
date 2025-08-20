import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import { useState, useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Default Leaflet marker
const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function LocationMarker({ position }: { position: [number, number] | null }) {
  return position ? <Marker position={position} icon={markerIcon} /> : null;
}

// helper to recenter the map
function Recenter({ coords }: { coords: [number, number] }) {
  const map = useMap();
  map.setView(coords, 15);
  return null;
}

export function LocationPicker({ onChange }: { onChange: (coords: [number, number]) => void }) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [address, setAddress] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Handle map clicks
  function MapClickHandler() {
    useMapEvents({
      click(e) {
        const coords: [number, number] = [e.latlng.lng, e.latlng.lat];
        setPosition([e.latlng.lat, e.latlng.lng]);
        onChange(coords);

        setSuggestions([]); // clear suggestions when clicking map
      },
    });
    return null;
  }

  // Fetch suggestions when typing
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (address.length < 3) {
        setSuggestions([]);
        return;
      }

        const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=5&countrycodes=nl&q=${encodeURIComponent(
            address
        )}`
        );
      const data = await res.json();
      setSuggestions(data);
    };

    const timeout = setTimeout(fetchSuggestions, 300); // debounce 300ms
    return () => clearTimeout(timeout);
  }, [address]);

  // When user selects a suggestion
  const handleSelect = (s: any) => {
    const coords: [number, number] = [parseFloat(s.lon), parseFloat(s.lat)];
    setPosition([parseFloat(s.lat), parseFloat(s.lon)]);
    onChange(coords);
    setAddress(s.display_name); // fill input with chosen address
    setSuggestions([]);
  };

  return (
    <div style={{ marginTop: 15,  }}>
      <div style={{ marginBottom: 10, position: "relative", display:"block", textAlign:"center", width:"100%"}}>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter an address"
          style={{ padding: 6, width: "70%" }}
        />

        {suggestions.length > 0 && (
          <ul
            style={{
              position: "absolute",
              background: "white",
              border: "1px solid #ccc",
              listStyle: "none",
              margin: 0,
              padding: 0,
              color:"black",
              width: "70%",
              maxHeight: "150px",
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
            {suggestions.map((s, idx) => (
              <li
                key={idx}
                onClick={() => handleSelect(s)}
                style={{
                  padding: "6px 8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #eee",
                }}
              >
                {s.display_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ height: "300px", borderRadius: 8, overflow: "hidden" }}>

<MapContainer
  center={[52.3676, 4.9041]} // Amsterdam
  zoom={13}
  style={{ height: "100%", width: "100%" }}
maxBounds={[
  [50, 2],   // Southwest: further south & west
  [54, 12],  // Northeast: further north & east
]}
  maxBoundsViscosity={0} // makes map "bounce" at the border
>
  <TileLayer
    attribution='&copy; <a href="https://osm.org/copyright">OpenStreetMap</a> contributors'
    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
  />
  <MapClickHandler />
  {position && <LocationMarker position={position} />}
  {position && <Recenter coords={position} />}
</MapContainer>
      </div>
    </div>
  );
}
