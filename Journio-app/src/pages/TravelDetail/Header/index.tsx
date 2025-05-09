import { Button, Image, NavBar, Toast } from 'antd-mobile';
import { SendOutline } from 'antd-mobile-icons';
import React from 'react';
import './index.scss';

interface HeaderProps {
  avatar: string;
  nickname: string;
  theme?: 'light' | 'dark';
  onBack: () => void;
  isFollowed?: boolean;
  onFollow?: () => void;
  onShare?: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  avatar, 
  nickname, 
  theme,
  onBack,
  isFollowed = false,
  onFollow,
  onShare 
}) => {
  const handleShare = () => {
    if (onShare) {
      onShare();
    } else {
      Toast.show({
        content: '分享功能开发中',
      });
    }
  };

  const right = (
    <div className="header-actions">
      <Button
        size="small"
        color={isFollowed ? 'default' : 'primary'}
        fill={isFollowed ? 'outline' : 'solid'}
        onClick={onFollow}
        className="follow-btn"
      >
        {isFollowed ? '已关注' : '关注'}
      </Button>
      <SendOutline fontSize={24} onClick={handleShare} />
    </div>
  );
  const left = (
    <div className="author-info">
    <Image src={avatar} className="avatar" />
    <span className="name">{nickname}</span>
  </div>
  );
  return (
    <div className={`travel-header ${theme === 'dark' ? 'dark' : ''}`}>
      <NavBar 
        onBack={onBack}
        right={right}
        left={left}
      >
      </NavBar>
    </div>
  );
};

export default Header;