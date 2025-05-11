import { Amap, Marker } from '@amap/amap-react';
import React from 'react';

interface Location {
  name: string;
  address: string;
  location: [number, number];
}

interface MapDisplayProps {
  center: [number, number];
  locations: Location[];
  zoom?: number;
}

const MapDisplay: React.FC<MapDisplayProps> = ({ center, locations, zoom = 12 }) => {
  console.log('MapDisplay props:', { center, locations, zoom });
  return (
    <div className="map-display">
      <Amap zoom={zoom} center={center}>
        {locations.map((location, index) => (
          <Marker
            key={index}
            position={location.location}
            label={{
              content: location.name,
              direction: 'bottom',
            }}
          />
        ))}
      </Amap>
    </div>
  );
};

export default MapDisplay;
