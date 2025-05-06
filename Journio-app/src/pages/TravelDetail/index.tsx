import { getTravelDetail } from '@/api/travel';
import { TravelItem } from '@/mock/travel';
import { Image, NavBar, Toast, Swiper } from 'antd-mobile';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './index.scss';

const TravelDetail: React.FC = () => {
  const { id } = useParams();
  const [travel, setTravel] = useState<TravelItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getTravelDetail(Number(id));
        if (res.code === 200) {
          setTravel(res.data);
        }
      } catch (error: any) {
        Toast.show({
          icon: 'fail',
          content: error?.response?.data?.message || error?.message || '发布失败，请稍后重试',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetail();
    }
  }, [id]);

  if (loading) {
    return <div className="loading">加载中...</div>;
  }

  if (!travel) {
    return <div className="empty">暂无游记数据</div>;
  }

  const sanitizedContent = travel.content ? DOMPurify.sanitize(travel.content, {
    ALLOWED_TAGS: ['p', 'h1', 'h2', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'br'],
    ALLOWED_ATTR: [], // 不允许任何属性
  }) : '';
  // console.log(sanitizedContent);
  return (
    <div className="travel-detail">
      <NavBar onBack={() => window.history.back()}>游记详情</NavBar>

      <div className="detail-content">
        <h1 className="title">{travel.title}</h1>

        <div className="author-info">
          <Image src={travel.author.avatar} className="avatar" />
          <span className="name">{travel.author.nickname}</span>
          <span className="time">{travel.createTime}</span>
        </div>

        {travel.images.length > 0 && (
          <div className="swiper-container">
            <Swiper>
              {travel.images.map((img, index) => (
                <Swiper.Item key={index}>
                  <Image src={img} className="swiper-image" />
                </Swiper.Item>
              ))}
            </Swiper>
          </div>
        )}

        <div 
          className="content"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </div>
    </div>
  );
};

export default TravelDetail;
