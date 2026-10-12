import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default icon issue with Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom green marker
const createCustomIcon = (color = '#22c55e') =>
  L.divIcon({
    html: `
      <div style="
        width: 32px; height: 32px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 3px 10px rgba(0,0,0,0.3);
      ">
        <span style="
          display: block;
          transform: rotate(45deg);
          text-align: center;
          line-height: 26px;
          font-size: 14px;
        ">🏔️</span>
      </div>
    `,
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -35],
  });

const PlaceMap = ({ places = [], center = [34.7, 72.5], zoom = 10, height = '500px', singlePlace = null }) => {
  const mapRef = useRef(null);

  const mapPlaces = singlePlace ? [singlePlace] : places;
  const mapCenter = singlePlace
    ? [singlePlace.coordinates.lat, singlePlace.coordinates.lng]
    : center;

  return (
    <div style={{ height, width: '100%' }} className="rounded-2xl overflow-hidden border border-white/10">
      <MapContainer
        ref={mapRef}
        center={mapCenter}
        zoom={singlePlace ? 13 : zoom}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mapPlaces.map((place) =>
          place?.coordinates?.lat && place?.coordinates?.lng ? (
            <Marker
              key={place._id || place.slug}
              position={[place.coordinates.lat, place.coordinates.lng]}
              icon={createCustomIcon()}
            >
              <Popup>
                <div className="p-2 min-w-[180px]">
                  {place.images?.[0]?.url && (
                    <img
                      src={place.images[0].url}
                      alt={place.nameEn}
                      className="w-full h-28 object-cover rounded-lg mb-2"
                    />
                  )}
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{place.nameEn}</h3>
                  {place.averageRating > 0 && (
                    <p className="text-yellow-600 text-xs mb-2">⭐ {place.averageRating}</p>
                  )}
                  {place.slug && (
                    <a
                      href={`/places/${place.slug}`}
                      className="text-xs text-green-600 font-semibold hover:underline"
                    >
                      View Details →
                    </a>
                  )}
                </div>
              </Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  );
};

export default PlaceMap;