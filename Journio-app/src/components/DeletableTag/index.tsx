import { Tag } from 'antd-mobile';
import React from 'react';
import './index.scss';

interface DeletableTagProps {
  text: string;
  onDelete?: () => void;
  onClick?: (e: React.MouseEvent) => void;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  isSelected?: boolean; // 新增：由父组件控制选中状态
}

const DeletableTag: React.FC<DeletableTagProps> = ({
  text,
  onDelete,
  onClick,
  color = 'primary',
  isSelected = false, // 默认未选中
}) => {
  return (
    <div className="custom-tag" onClick={onClick}>
      <Tag color={color} className={`location-tag ${isSelected ? 'selected' : ''}`}>
        {text}
        {onDelete && (
          <span
            className="delete-icon"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            ×
          </span>
        )}
      </Tag>
    </div>
  );
};

export default DeletableTag;
