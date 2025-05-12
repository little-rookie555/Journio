import { Skeleton } from 'antd-mobile';
import React from 'react';
import './index.scss';

const TravelDetailSkeleton: React.FC = () => {
  return (
    <div className="travel-detail-skeleton">
      {/* 头部骨架 */}
      <div className="header-skeleton">
        <div className="avatar-skeleton">
          <Skeleton.Title />
        </div>
        <div className="info-skeleton">
          <Skeleton.Title />
        </div>
      </div>

      {/* 封面图骨架 */}
      <div className="cover-skeleton">
        <Skeleton.Title />
      </div>

      {/* 标题骨架 */}
      <div className="title-skeleton">
        <Skeleton.Title />
      </div>

      {/* 信息卡片骨架 */}
      <div className="info-card-skeleton">
        <div className="info-item">
          <Skeleton.Title />
          <Skeleton.Title />
        </div>
        <div className="info-item">
          <Skeleton.Title />
          <Skeleton.Title />
        </div>
        <div className="info-item">
          <Skeleton.Title />
          <Skeleton.Title />
        </div>
      </div>

      {/* 内容骨架 */}
      <div className="content-skeleton">
        <Skeleton.Paragraph lineCount={6} />
      </div>

      {/* 评论骨架 */}
      <div className="comments-skeleton">
        <Skeleton.Title />
        <div className="comment-item">
          <Skeleton.Title />
          <div className="comment-content">
            <Skeleton.Title />
            <Skeleton.Paragraph lineCount={2} />
          </div>
        </div>
        <div className="comment-item">
          <Skeleton.Title />
          <div className="comment-content">
            <Skeleton.Title />
            <Skeleton.Paragraph lineCount={2} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelDetailSkeleton;
