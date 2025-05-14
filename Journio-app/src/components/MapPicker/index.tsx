import { Amap, Marker, usePlugins } from '@amap/amap-react';
import { Button, Cascader, Popup } from 'antd-mobile';
import React, { useEffect, useRef, useState } from 'react';
import DeletableTag from '../DeletableTag';
import './index.scss';

interface MapPickerProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (locations: { name: string; address: string; location: [number, number] }[]) => void;
  value?: { name: string; address: string; location: [number, number] }[]; // 新增：由父组件传入的选中地点
  onChange?: (locations: { name: string; address: string; location: [number, number] }[]) => void; // 新增：地点变化的回调
}

interface DistrictOption {
  label: string;
  value: string;
  children?: DistrictOption[];
}

const MapPicker: React.FC<MapPickerProps> = ({
  visible,
  onClose,
  onSelect,
  value = [],
  onChange,
}) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([116.397428, 39.90923]);
  const [CascaderVisible, setCascaderValue] = useState<boolean>(false);
  const [options, setOptions] = useState<DistrictOption[]>([]);
  const [selectedValue, setSelectedValue] = useState<string[]>([]);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState<number | null>(null);
  const districtSearchRef = useRef<any>(null);

  // 使用高德地图插件
  const AMap = usePlugins(['AMap.DistrictSearch']);

  // 初始化省份数据
  useEffect(() => {
    if (!AMap || !visible) return;

    districtSearchRef.current = new (AMap as any).DistrictSearch({
      level: 'province',
      subdistrict: 2, // 获取下两级行政区
    });

    // 获取省份列表
    districtSearchRef.current.search('中国', (status: string, result: any) => {
      if (status === 'complete' && result.districtList?.length > 0) {
        const provinces = result.districtList[0].districtList || [];
        // console.log('provinces', provinces);
        const provinceOptions = provinces.map((province: any) => ({
          label: province.name,
          value: province.name,
          children: (province.districtList || []).map((city: any) => ({
            label: city.name,
            value: city.name,
            center: city.center,
          })),
        }));
        // console.log('provinceOptions', provinceOptions);
        setOptions(provinceOptions);
      }
    });

    return () => {
      if (districtSearchRef.current) {
        districtSearchRef.current.clearEvents();
      }
    };
  }, [AMap, visible]);

  // 修改处理级联选择的函数
  const handleCascaderChange = (values: string[], items: any[]) => {
    setSelectedValue(values);

    if (items.length === 2) {
      const cityItem = items[1];
      const location: [number, number] = [cityItem.center.lng, cityItem.center.lat];
      const newLocation = {
        name: cityItem.label,
        address: `${items[0].label}${cityItem.label}`,
        location: location,
      };

      if (!value.some((loc) => loc.name === newLocation.name)) {
        const newLocations = [...value, newLocation];
        onChange?.(newLocations);
        setMapCenter(newLocation.location);
      }
      setCascaderValue(false);
    }
  };

  // 移除选中的地点
  const handleRemoveLocation = (locationToRemove: any) => {
    const newLocations = value.filter((loc) => loc.name !== locationToRemove.name);
    onChange?.(newLocations);
  };

  // 确认选择
  const handleConfirm = () => {
    if (value.length > 0 && onSelect) {
      onSelect(value);
    }
    onClose();
  };

  const handleTagClick = (location: any, index: number) => {
    setSelectedLocationIndex(index);
    setMapCenter(location.location);
  };

  // 添加useEffect来设置初始中心点
  useEffect(() => {
    if (value && value.length > 0) {
      setMapCenter(value[0].location);
      setSelectedLocationIndex(0);
    }
  }, [value]);

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      bodyStyle={{
        height: '80vh',
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      }}
    >
      <div className="map-picker">
        <div className="cascader-container">
          <div className="cascader-header">
            <div className="cascader-title" onClick={() => setCascaderValue(!CascaderVisible)}>
              选择地点
            </div>
            <div className="selected-locations">
              {value.map((loc, index) => (
                <DeletableTag
                  key={index}
                  text={loc.name}
                  onDelete={() => handleRemoveLocation(loc)}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTagClick(loc, index);
                  }}
                  color="primary"
                  isSelected={selectedLocationIndex === index}
                />
              ))}
            </div>
          </div>
          <Cascader
            visible={CascaderVisible}
            options={options}
            value={selectedValue}
            placeholder="请选择省市"
            onClose={() => setCascaderValue(false)}
            onConfirm={(values, extend) => handleCascaderChange(values as string[], extend.items)}
            onSelect={(values, extend) => handleCascaderChange(values as string[], extend.items)}
          />
        </div>

        <div className="map-container">
          <Amap zoom={12} center={mapCenter}>
            {value.map((location, index) => (
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

        <div className="button-container">
          <Button block color="primary" onClick={handleConfirm} disabled={value.length === 0}>
            确定
          </Button>
        </div>
      </div>
    </Popup>
  );
};

export default MapPicker;
