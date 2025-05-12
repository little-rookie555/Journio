import { Skeleton } from 'antd-mobile';
import React from 'react';
import './index.scss';

const TravelSkeleton: React.FC = () => {
  return (
    <div className="travel-skeleton">
      <div className="skeleton-card">
        <div className="card-left">
          <Skeleton animated className="cover-skeleton" />
        </div>
        <div className="card-right">
          <Skeleton.Title animated />
          <Skeleton.Paragraph lineCount={2} animated />
          <div className="action-skeleton">
            <Skeleton.Title animated />
            <Skeleton.Title animated />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelSkeleton;
