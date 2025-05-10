import React from 'react';
import { List, Popup } from 'antd-mobile';
import './index.scss';
import { useTemplateStore } from '@/store/templates';

interface TemplateListProps {
  visible: boolean;
  onClose: () => void;
  onTemplateSelect: (template: string) => void;
}

import { useTheme } from '@/contexts/ThemeContext';

const TemplateList: React.FC<TemplateListProps> = ({ visible, onClose, onTemplateSelect }) => {
  const { theme } = useTheme();
  const { templates } = useTemplateStore(); // 直接从store获取模板列表

  const handleTemplateClick = (template: string) => {
    onTemplateSelect(template);
    onClose();
  };

  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        minHeight: '60vh',
        maxHeight: '80vh',
        backgroundColor: theme === 'dark' ? 'var(--adm-color-box)' : '#fff',
      }}
    >
      <div className={`template-list`}>
        <div className="template-header">
          <span className="title">需要使用模板吗~</span>
          <span className="close" onClick={onClose}>
            ×
          </span>
        </div>

        <List className="template-items">
          {/* 对每一行进行切割显示，虚化后面的具体描述 */}
          {templates.map((template, index) => {
            const templateItems = template.split('\n').map((line) => {
              const [title, description] = line.split('：');
              return (
                <div key={title} className="template-line">
                  <span className="template-title">{title}：</span>
                  <span className="template-description">{description}</span>
                </div>
              );
            });
            return (
              <List.Item
                key={index}
                onClick={() => handleTemplateClick(template)}
                arrow={false}
                className="template-item"
              >
                {templateItems}
              </List.Item>
            );
          })}
        </List>
      </div>
    </Popup>
  );
};

export default TemplateList;
