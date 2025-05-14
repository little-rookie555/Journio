import { formatDate } from '@/components/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/user';
import { Image, List, Tag } from 'antd-mobile';
import React from 'react';
import './index.scss';

export interface Comment {
  id: number;
  content: string;
  createTime: string;
  author: {
    id: number;
    nickname: string;
    avatar: string;
  };
}

interface CommentListProps {
  comments: Comment[];
  onShowPopup: () => void;
  authorId?: number; // 添加作者ID属性
}

const CommentList: React.FC<CommentListProps> = ({ comments, onShowPopup, authorId }) => {
  const { theme } = useTheme();
  const { userInfo } = useUserStore();

  return (
    <div className={`comment-list ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="comment-header">
        <span className="comment-title">共 {comments.length} 条评论</span>
      </div>

      {/* 移动评论输入框到标题下方 */}
      <div className="comment-input-box" onClick={onShowPopup}>
        <Image lazy src={userInfo?.avatar || '/default-avatar.png'} className="user-avatar" />
        <div className="input-placeholder">说点什么...</div>
      </div>

      <div className="comment-container">
        <List
          className="comment-items"
          style={{
            '--border-bottom': 'none',
            '--border-top': 'none',
            '--border-inner': 'none',
          }}
        >
          {comments.length === 0 ? (
            <div className="no-comments">暂无评论，快来抢沙发吧~</div>
          ) : (
            comments.map((comment) => (
              <List.Item
                style={{
                  '--align-items': 'flex-start',
                }}
                key={comment.id}
                prefix={<Image src={comment.author.avatar} className="avatar" />}
                description={formatDate(comment.createTime)}
              >
                <div className="comment-content">
                  <div className="nickname-container">
                    <span className="nickname">{comment.author.nickname}</span>
                    {comment.author.id === authorId && (
                      <Tag color="primary" className="author-tag">
                        作者
                      </Tag>
                    )}
                  </div>
                  <p className="text">{comment.content}</p>
                </div>
              </List.Item>
            ))
          )}
        </List>
      </div>
    </div>
  );
};

export default CommentList;
