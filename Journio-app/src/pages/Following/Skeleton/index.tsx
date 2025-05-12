import { Skeleton } from 'antd-mobile';
import React from 'react';
import './index.scss';

const FollowingSkeleton: React.FC = () => {
  return (
    <div className="following-skeleton">
      <div className="nav-skeleton">
        <Skeleton.Title className="nav-title" />
      </div>

      <div className="list-skeleton">
        {[1, 2, 3, 4, 5].map((item) => (
          <div key={item} className="list-item-skeleton">
            <div className="item-left">
              <Skeleton.Title className="avatar-skeleton" />
              <div className="text-content">
                <Skeleton.Title className="name-skeleton" />
                <Skeleton.Paragraph lineCount={1} className="desc-skeleton" />
              </div>
            </div>
            <Skeleton.Title className="button-skeleton" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FollowingSkeleton;
