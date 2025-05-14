import { Form } from 'antd-mobile';
import { useState } from 'react';

interface Location {
  name: string;
  address: string;
  location: [number, number];
}

export const useLocationManagement = (form: ReturnType<typeof Form.useForm>[0]) => {
  const [mapVisible, setMapVisible] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<Location[]>([]);

  const handleLocationSelect = (locations: Location[]) => {
    const currentLocations = form.getFieldValue('locations') || [];
    const newLocations = locations
      .filter((newLoc) => !currentLocations.some((loc: any) => loc.name === newLoc.name))
      .map((location) => ({
        name: location.name,
        address: location.address,
        coordinates: location.location,
      }));

    form.setFieldsValue({
      locations: [...currentLocations, ...newLocations],
    });
  };

  const handleLocationChange = (locations: Location[]) => {
    setSelectedLocations(locations);
    form.setFieldsValue({
      locations: locations.map((location) => ({
        name: location.name,
        address: location.address,
        coordinates: location.location,
      })),
    });
  };

  const handleRemoveLocation = (locationName: string) => {
    const newLocations = selectedLocations.filter((loc) => loc.name !== locationName);
    setSelectedLocations(newLocations);

    const formLocations = newLocations.map((loc) => ({
      name: loc.name,
      address: loc.address,
      coordinates: loc.location,
    }));

    form.setFieldsValue({
      locations: formLocations,
    });
  };

  return {
    mapVisible,
    setMapVisible,
    selectedLocations,
    handleLocationSelect,
    handleLocationChange,
    handleRemoveLocation,
    setSelectedLocations,
  };
};
