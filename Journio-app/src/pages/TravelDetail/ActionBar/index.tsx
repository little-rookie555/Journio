import { likeTravel, starTravel } from '@/api/travel';
import LikeButton from '@/components/LikeButton';
import StarButton from '@/components/StarButton';
import { useTheme } from '@/contexts/ThemeContext';
import { Toast } from 'antd-mobile';
import { EditSOutline, MessageOutline } from 'antd-mobile-icons';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

interface ActionBarProps {
  onComment: () => void;
  commentCount: number;
  likeCount: number;
  isLiked: boolean;
  isStarred: boolean;
  travelId: number;
  userId: number | undefined;
  onLikeChange: (liked: boolean) => void;
  onStarChange: (starred: boolean) => void;
  onLikeCountChange: (count: number) => void; // 添加点赞数更新回调
  onCommentList: () => void;
}

const ActionBar: React.FC<ActionBarProps> = ({
  commentCount,
  likeCount,
  isLiked,
  isStarred,
  travelId,
  userId,
  onLikeChange,
  onStarChange,
  onLikeCountChange,
  onComment,
  onCommentList,
}) => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  // 添加登录检查工具函数
  const checkLogin = () => {
    if (!userId) {
      Toast.show({
        content: '请先登录',
        icon: 'fail',
      });
      navigate('/login');
      return false;
    }
    return true;
  };

  const handleLike = async () => {
    try {
      if (!checkLogin()) return;
      const res = await likeTravel({
        travelId,
        userId,
        liked: !isLiked,
      });

      if (res.code === 200) {
        onLikeChange(!isLiked);
        onLikeCountChange(res.data.likeCount); // 更新点赞数
        // Toast.show({
        //   icon: 'success',
        //   content: !isLiked ? '点赞成功' : '取消点赞',
        // });
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.message || '操作失败',
      });
    }
  };

  const handleStar = async () => {
    try {
      if (!checkLogin()) return;
      const res = await starTravel({
        travelId,
        userId,
        starred: !isStarred,
      });

      if (res.code === 200) {
        onStarChange(!isStarred);
        // Toast.show({
        //   icon: 'success',
        //   content: !isStarred ? '收藏成功' : '取消收藏',
        // });
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.message || '操作失败',
      });
    }
  };

  return (
    <div className={`action-bar ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="action-input" onClick={onComment}>
        <div className="input-box">
          <EditSOutline />
          <span>说点什么...</span>
        </div>
      </div>
      <div className="action-buttons">
        <LikeButton isLiked={isLiked} onChange={handleLike} likeCount={likeCount} />
        <StarButton isStarred={isStarred} onChange={handleStar} />
        <div className="action-item" onClick={onCommentList}>
          <MessageOutline fontSize={24} />
          <span>{commentCount}</span>
        </div>
      </div>
    </div>
  );
};

export default ActionBar;
