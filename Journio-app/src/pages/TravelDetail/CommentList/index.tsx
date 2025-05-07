import React from 'react';
import { Image, List, Popup } from 'antd-mobile';
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
  visible: boolean;
  onClose: () => void;
  comments: Comment[];
}

const CommentList: React.FC<CommentListProps> = ({ visible, onClose, comments }) => {
  return (
    <Popup
      visible={visible}
      onMaskClick={onClose}
      position="bottom"
      bodyStyle={{
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        minHeight: '60vh',
        maxHeight: '80vh',
      }}
    >
      <div className="comment-list">
        <div className="comment-header">
          <span className="title">评论 {comments.length}</span>
          <span className="close" onClick={onClose}>关闭</span>
        </div>
        
        <div className="comment-container">
          <List className="comment-items">
            {comments.map((comment) => (
              <List.Item
                key={comment.id}
                prefix={
                  <Image
                    src={comment.author.avatar}
                    className="avatar"
                  />
                }
                description={comment.createTime}
              >
                <div className="comment-content">
                  <span className="nickname">{comment.author.nickname}</span>
                  <p className="text">{comment.content}</p>
                </div>
              </List.Item>
            ))}
          </List>
        </div>
      </div>
    </Popup>
  );
};

export default CommentList;