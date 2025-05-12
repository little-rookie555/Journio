import { Skeleton } from 'antd-mobile';
import React from 'react';
import './index.scss';
const TravelCardSkeleton: React.FC = () => {
  return (
    <div className="skeleton-card">
      <Skeleton.Title className="skeleton-image" />
      <div className="skeleton-content">
        <Skeleton.Title className="skeleton-title" />
        <div className="skeleton-bottom">
          <div className="skeleton-author">
            {/* <Skeleton.Avatar /> */}
            <Skeleton.Title className="skeleton-name" />
          </div>
          <Skeleton.Title className="skeleton-action" />
        </div>
      </div>
    </div>
  );
};

export default TravelCardSkeleton;
