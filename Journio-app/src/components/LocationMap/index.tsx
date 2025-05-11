import { Popup, Space, Tag } from 'antd-mobile';
import { LocationFill } from 'antd-mobile-icons';
import React, { useState } from 'react';
import MapDisplay from '../MapDisplay';
import './index.scss';

interface Location {
  name: string;
  address: string;
  coordinates: [number, number];
}

interface LocationMapProps {
  locations: Location[];
}

const LocationMap: React.FC<LocationMapProps> = ({ locations }) => {
  const [mapVisible, setMapVisible] = useState(false);
  const [currentCenter, setCurrentCenter] = useState<[number, number]>(
    locations?.[0]?.coordinates || [116.397428, 39.90923],
  );

  if (!locations || locations.length === 0) return null;

  const handleTagClick = (location: Location) => {
    setCurrentCenter(location.coordinates);
  };

  return (
    <>
      <div className="location-section" onClick={() => setMapVisible(true)}>
        <div className="location-tags">
          <LocationFill style={{ fontSize: 16 }} />
          <span className="location-text">
            {locations[0].name}
            {locations.length > 1 && ` 等${locations.length}个地点`}
          </span>
        </div>
      </div>

      <Popup
        visible={mapVisible}
        onMaskClick={() => setMapVisible(false)}
        bodyStyle={{
          height: '60vh',
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
        }}
      >
        <div className="map-popup">
          <div className="map-header">
            <div className="location-tags">
              <Space wrap>
                {locations.map((loc, index) => (
                  <Tag
                    key={index}
                    color="primary"
                    onClick={() => handleTagClick(loc)}
                    className={`location-tag ${
                      loc.coordinates[0] === currentCenter[0] &&
                      loc.coordinates[1] === currentCenter[1]
                        ? 'active'
                        : ''
                    }`}
                  >
                    {loc.name}
                  </Tag>
                ))}
              </Space>
            </div>
          </div>
          <div className="map-container">
            <MapDisplay
              center={currentCenter}
              locations={locations.map((loc) => ({
                name: loc.name,
                address: loc.address,
                location: loc.coordinates,
              }))}
              zoom={12}
            />
          </div>
        </div>
      </Popup>
    </>
  );
};

export default LocationMap;
