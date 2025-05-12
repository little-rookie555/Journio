import { Modal } from 'antd-mobile';
import React from 'react';
import './index.scss';

interface StatsModalProps {
  visible: boolean;
  onClose: () => void;
  likedCount?: number;
  starredCount?: number;
}

const StatsModal: React.FC<StatsModalProps> = ({
  visible,
  onClose,
  likedCount = 0,
  starredCount = 0,
}) => {
  return (
    <Modal
      visible={visible}
      onClose={onClose}
      content={
        <div className="stats-modal">
          <div className="stats-content">
            <div className="stats-item">
              <div className="icon">❤️</div>
              <div className="info">
                <div className="label">当前发布笔记数</div>
                <div className="value">{likedCount}</div>
              </div>
            </div>
            <div className="stats-item">
              <div className="icon">⭐</div>
              <div className="info">
                <div className="label">当前获得收藏数</div>
                <div className="value">{starredCount}</div>
              </div>
            </div>
          </div>
        </div>
      }
      closeOnAction
      title="获赞与收藏"
      actions={[
        {
          key: 'confirm',
          text: '我知道了',
        },
      ]}
    />
  );
};

export default StatsModal;
