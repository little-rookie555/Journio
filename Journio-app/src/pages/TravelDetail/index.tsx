import { checkFollowStatus, followUser } from '@/api/follow';
import {
  createComment,
  getCommentList,
  getTravelDetail,
  likeTravel,
  starTravel,
} from '@/api/travel';
import LocationMap from '@/components/LocationMap';
import { useTheme } from '@/contexts/ThemeContext';
import { TravelItem } from '@/mock/travel';
import { useUserStore } from '@/store/user';
import { Button, Image, ImageViewer, Popup, Swiper, TextArea, Toast } from 'antd-mobile';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ActionBar from './ActionBar';
import CommentList, { Comment } from './CommentList';
import Header from './Header';
import './index.scss';
import TravelDetailSkeleton from './TravelDetailSkeleton';

const TravelDetail: React.FC = () => {
  const { id } = useParams();
  const { theme } = useTheme();
  const [travel, setTravel] = useState<TravelItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]); // 添加评论列表状态
  const { userInfo } = useUserStore();
  const navigator = useNavigate();
  const [likeCount, setLikeCount] = useState(0); // 添加点赞数状态
  const [isFollowed, setIsFollowed] = useState(false);
  const [showVideo, setShowVideo] = useState(false); // 添加视频显示状态

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getTravelDetail(Number(id));
        if (res.code === 200) {
          setTravel(res.data);
          console.log('res', res.data);
          setLikeCount(res.data.likeCount); // 设置初始点赞数

          // 获取用户的点赞、收藏和关注状态
          if (userInfo) {
            // 获取点赞状态
            const likeRes = await likeTravel({
              travelId: Number(id),
              userId: userInfo.id,
            });
            if (likeRes.code === 200) {
              setIsLiked(likeRes.data.liked);
            }

            // 获取收藏状态
            const starRes = await starTravel({
              travelId: Number(id),
              userId: userInfo.id,
            });
            if (starRes.code === 200) {
              setIsStarred(starRes.data.starred);
            }

            // 获取关注状态
            const followRes = await checkFollowStatus({
              userId: userInfo.id,
              followUserId: res.data.author.id,
            });
            if (followRes.code === 200) {
              setIsFollowed(followRes.data);
            }
          }
        }
      } catch (error: any) {
        Toast.show({
          icon: 'fail',
          content: error?.response?.data?.message || error?.message || '获取数据失败，请稍后重试',
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchComments = async () => {
      try {
        const res = await getCommentList(Number(id));
        if (res.code === 200) {
          setComments(res.data);
        }
      } catch {
        Toast.show({
          icon: 'fail',
          content: '获取评论失败',
        });
      }
    };

    if (id) {
      fetchDetail();
      fetchComments(); // 添加获取评论的调用
    }
  }, [id, userInfo]); // 添加userInfo作为依赖

  if (loading) {
    return <TravelDetailSkeleton />;
  }

  if (!travel) {
    return <div className="empty">暂无游记数据</div>;
  }

  const sanitizedContent = travel.content
    ? DOMPurify.sanitize(travel.content, {
        ALLOWED_TAGS: ['p', 'h1', 'h2', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'br'],
        ALLOWED_ATTR: [], // 不允许任何属性
      })
    : '';
  // console.log(sanitizedContent);
  // 添加登录检查工具函数
  const checkLogin = () => {
    if (!userInfo) {
      Toast.show({
        content: '请先登录',
        icon: 'fail',
      });
      navigator('/login');
      return false;
    }
    return true;
  };

  // 修改处理函数
  const handleComment = async () => {
    if (!id || !checkLogin()) return;

    try {
      const res = await createComment({
        travelId: Number(id),
        content: commentText,
        userId: userInfo!.id,
      });

      if (res.code === 200) {
        Toast.show({
          icon: 'success',
          content: '评论成功',
        });

        // 重新获取评论列表
        const commentsRes = await getCommentList(Number(id));
        if (commentsRes.code === 200) {
          setComments(commentsRes.data);
        }

        // 清空输入框并关闭弹窗
        setCommentText('');
        setShowCommentPopup(false);
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.response?.data?.message || error?.message || '评论失败，请稍后重试',
      });
    }
  };

  const handleLikeChange = (liked: boolean) => {
    if (!checkLogin()) return;
    setIsLiked(liked);
  };

  const handleStarChange = (starred: boolean) => {
    if (!checkLogin()) return;
    setIsStarred(starred);
  };

  const handleLikeCountChange = (count: number) => {
    setLikeCount(count);
  };

  // 添加关注处理函数
  const handleFollow = async () => {
    if (!checkLogin()) return;

    // 检查是否是自己的文章
    if (userInfo && userInfo.id === travel.author.id) {
      Toast.show({
        content: '不能关注自己',
        icon: 'fail',
      });
      return;
    }

    try {
      const res = await followUser({
        userId: userInfo!.id,
        followUserId: travel.author.id,
        isFollow: !isFollowed,
      });

      if (res.code === 200) {
        setIsFollowed(!isFollowed);
        Toast.show({
          icon: 'success',
          content: !isFollowed ? '关注成功' : '已取消关注',
        });
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.message || '操作失败',
      });
    }
  };

  // 添加分享处理函数
  const handleShare = () => {
    // TODO: 实现分享功能
    Toast.show({
      content: '分享功能开发中',
    });
  };

  // 添加视频弹窗处理函数
  const handleVideoClick = () => {
    setShowVideo(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${year}年${month}月${day}日 ${hours}:${minutes}`;
  };

  return (
    <div className={`travel-detail ${theme === 'dark' ? 'dark' : ''}`}>
      <Header
        avatar={travel.author.avatar}
        nickname={travel.author.nickname}
        theme={theme}
        onBack={() => navigator(-1)}
        onFollow={handleFollow}
        onShare={handleShare}
        isFollowed={isFollowed}
        authorId={travel.author.id} // 添加作者ID
      />

      <div className="detail-content">
        {(travel.images.length > 0 || travel.video) && (
          <div className="swiper-container">
            <Swiper>
              {[
                // 视频项（条件渲染）
                ...(travel.video
                  ? [
                      <Swiper.Item key="video">
                        <div className="video-preview" onClick={handleVideoClick}>
                          <Image lazy src={travel.coverImage} className="swiper-image" />
                          <div className="play-button">
                            <i className="play-icon" />
                          </div>
                        </div>
                      </Swiper.Item>,
                    ]
                  : []),

                // 图片项（始终渲染）
                ...travel.images.map((img, index) => (
                  <Swiper.Item key={index}>
                    <Image
                      lazy
                      src={img}
                      className="swiper-image"
                      onClick={() => {
                        ImageViewer.Multi.show({
                          images: travel.images,
                          defaultIndex: index,
                        });
                      }}
                    />
                  </Swiper.Item>
                )),
              ]}
            </Swiper>
          </div>
        )}

        {/* 使用新的LocationMap组件 */}
        <LocationMap locations={travel.locations} />

        <h1 className="title">{travel.title}</h1>

        {/* 添加游玩信息卡片 */}
        <div className="travel-info-card">
          <div className="info-item">
            <span className="label">出发时间</span>
            <span className="value">
              {new Date(travel.travelDate).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
          <div className="info-item">
            <span className="label">行程天数</span>
            <span className="value">{travel.duration}天</span>
          </div>
          <div className="info-item">
            <span className="label">人均花费</span>
            <span className="value">¥{travel.cost}</span>
          </div>
        </div>
        <div className="content" dangerouslySetInnerHTML={{ __html: sanitizedContent }} />

        <div className="create-time">发布于 {formatDate(travel.createTime)}</div>

        {/* 评论列表 */}
        <div id="comments-section">
          <CommentList
            comments={comments}
            onShowPopup={() => {
              if (checkLogin()) {
                setShowCommentPopup(true);
              }
            }}
            authorId={travel.author.id} // 传入作者ID
          />
        </div>
      </div>

      {/* 新增底部固定栏 */}
      <ActionBar
        onComment={() => {
          if (checkLogin()) {
            setShowCommentPopup(true);
          }
        }}
        onCommentList={() => {
          const commentsSection = document.getElementById('comments-section');
          if (commentsSection) {
            commentsSection.scrollIntoView({ behavior: 'smooth' });
          }
        }}
        commentCount={comments.length}
        likeCount={likeCount}
        isLiked={isLiked}
        isStarred={isStarred}
        travelId={Number(id)}
        userId={userInfo?.id} // 改为可选链操作符
        onLikeChange={handleLikeChange}
        onStarChange={handleStarChange}
        onLikeCountChange={handleLikeCountChange} // 添加点赞数更新处理
      />

      {/* 评论弹出框 */}
      <Popup
        visible={showCommentPopup}
        onMaskClick={() => setShowCommentPopup(false)}
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          padding: '16px',
        }}
      >
        <div className="comment-popup">
          <TextArea
            placeholder="写下你的评论..."
            value={commentText}
            onChange={setCommentText}
            rows={4}
          />
          <div className="comment-actions">
            <Button block color="primary" onClick={handleComment} disabled={!commentText.trim()}>
              发送
            </Button>
          </div>
        </div>
      </Popup>

      {/* 添加视频弹窗 */}
      <Popup
        visible={showVideo}
        onMaskClick={() => setShowVideo(false)}
        bodyStyle={{
          width: '100vw',
          height: '100vh',
          background: '#000',
        }}
      >
        <div className="video-popup">
          <div className="video-close" onClick={() => setShowVideo(false)}>
            <span className="close-icon">×</span>
          </div>
          <video
            src={travel.video}
            controls
            autoPlay
            className="fullscreen-video"
            poster={travel.coverImage}
          />
        </div>
      </Popup>
    </div>
  );
};

export default TravelDetail;
