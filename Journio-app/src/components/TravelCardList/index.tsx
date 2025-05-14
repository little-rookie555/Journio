import LikeButton from '@/components/LikeButton';

import { Avatar, DotLoading, Image, Result, Skeleton, Toast } from 'antd-mobile';
import React, { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import TravelCardSkeleton from './CardSkeleton';
import './index.scss';

interface TravelCardListProps {
  list: any[];
  loading?: boolean;
  emptyText?: string;
  onLike: (item: any, liked: boolean) => void;
  userInfo: any;
}

const TravelCardList: React.FC<TravelCardListProps> = memo(
  ({ list, loading, emptyText = '暂无游记', onLike, userInfo }) => {
    const navigate = useNavigate();

    // 将列表分成左右两列
    const leftList = list.filter((_, index) => index % 2 === 0);
    const rightList = list.filter((_, index) => index % 2 === 1);

    // 添加登录检查工具函数
    const checkLogin = () => {
      if (!userInfo) {
        Toast.show({
          content: '请先登录',
          icon: 'fail',
        });
        navigate('/login');
        return false;
      }
      return true;
    };

    // 处理点赞
    const handleLike = async (item: any) => {
      if (!checkLogin()) return;
      onLike(item, !item.isLiked);
    };

    const renderCard = (item: any, columnIndex: number) => (
      <div
        key={`${columnIndex}-${item.id}`}
        className="travel-card"
        onClick={() => navigate(`/detail/${item.id}`)}
      >
        <Image
          lazy
          src={item.coverImage}
          className="travel-image"
          placeholder={
            <Skeleton
              animated
              style={{
                width: '100%',
                height: '150px',
                // '--height': '200px',
                // '--width': '100%',
                // '--border-radius': '8px'
              }}
            />
          }
        />
        <div className="travel-info">
          <h3 className="travel-title">{item.title}</h3>
          <div className="card-bottom">
            <div className="author-info">
              <Avatar src={item.author.avatar} />
              <span className="author-name">{item.author.nickname}</span>
            </div>
            <div className="action-item" onClick={(e) => e.stopPropagation()}>
              <LikeButton
                isLiked={item.isLiked}
                onChange={() => handleLike(item)}
                likeCount={item.likeCount}
              />
            </div>
          </div>
        </div>
      </div>
    );

    if (list.length === 0 && !loading) {
      return <Result status="info" title="暂无游记" description={emptyText} />;
    }

    return (
      <>
        <div className="masonry-grid">
          <div className="masonry-column">
            {loading && !list.length ? (
              <>
                {[1, 2, 3].map((i) => (
                  <TravelCardSkeleton key={`skeleton-left-${i}`} />
                ))}
              </>
            ) : (
              leftList.map((item) => renderCard(item, 0))
            )}
          </div>
          <div className="masonry-column">
            {loading && !list.length ? (
              <>
                {[1, 2, 3].map((i) => (
                  <TravelCardSkeleton key={`skeleton-right-${i}`} />
                ))}
              </>
            ) : (
              rightList.map((item) => renderCard(item, 1))
            )}
          </div>
        </div>

        {loading && list.length > 0 && (
          <div className="loading">
            <span>加载中</span>
            <DotLoading />
          </div>
        )}
      </>
    );
  },
);

export default TravelCardList;
