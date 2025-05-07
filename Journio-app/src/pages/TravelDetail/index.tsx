import { getTravelDetail, getCommentList, createComment, likeTravel, starTravel } from '@/api/travel';
import { TravelItem } from '@/mock/travel';
import { Image, NavBar, Toast, Swiper, Popup, TextArea, Button } from 'antd-mobile';
import DOMPurify from 'dompurify';
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './index.scss';
import CommentList, {Comment} from './CommentList';
import { useUserStore } from '@/store/user';
import ActionBar from './ActionBar';

const TravelDetail: React.FC = () => {
  const { id } = useParams();
  const [travel, setTravel] = useState<TravelItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [showCommentPopup, setShowCommentPopup] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [isStarred, setIsStarred] = useState(false);
  const [showCommentList, setShowCommentList] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]); // 添加评论列表状态
  const { userInfo } = useUserStore();
  const navigator = useNavigate();
  const [likeCount, setLikeCount] = useState(0); // 添加点赞数状态
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const res = await getTravelDetail(Number(id));
        if (res.code === 200) {
          setTravel(res.data);
          setLikeCount(res.data.likeCount); // 设置初始点赞数
          
          // 获取用户的点赞和收藏状态
          if (userInfo) {
            // 获取点赞状态
            const likeRes = await likeTravel({
              travelId: Number(id),
              userId: userInfo.id
            });
            if (likeRes.code === 200) {
              setIsLiked(likeRes.data.liked);
            }
  
            // 获取收藏状态
            const starRes = await starTravel({
              travelId: Number(id),
              userId: userInfo.id
            });
            if (starRes.code === 200) {
              setIsStarred(starRes.data.starred);
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
      } catch (error: any) {
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
  const handleComment = async () => {
    if (!id) return;
    
    try {
      const res = await createComment({
        travelId: Number(id),
        content: commentText,
        userId: userInfo!.id, // 这里应该使用当前登录用户的ID
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
    setIsLiked(liked);
  };

  const handleStarChange = (starred: boolean) => {
    setIsStarred(starred);
  };

  const handleLikeCountChange = (count: number) => {
    setLikeCount(count);
  };

  return (
    <div className="travel-detail">
      <NavBar onBack={() => navigator(-1)}>游记详情</NavBar>

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

      {/* 新增底部固定栏 */}
      <ActionBar
        onComment={() => setShowCommentPopup(true)}
        commentCount={comments.length}
        likeCount={likeCount}
        isLiked={isLiked}
        isStarred={isStarred}
        travelId={Number(id)}
        userId={userInfo!.id}
        onLikeChange={handleLikeChange}
        onStarChange={handleStarChange}
        onLikeCountChange={handleLikeCountChange} // 添加点赞数更新处理
      />

      {/* 评论列表弹出框 */}
      <CommentList
        visible={showCommentList}
        onClose={() => setShowCommentList(false)}
        comments={comments}
      />

      {/* 评论弹出框 */}
      <Popup
        visible={showCommentPopup}
        onMaskClick={() => setShowCommentPopup(false)}
        bodyStyle={{
          borderTopLeftRadius: '8px',
          borderTopRightRadius: '8px',
          padding: '16px'
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
            <Button
              block
              color="primary"
              onClick={handleComment}
              disabled={!commentText.trim()}
            >
              发送
            </Button>
          </div>
        </div>
      </Popup>
    </div>
  );
};

export default TravelDetail;
