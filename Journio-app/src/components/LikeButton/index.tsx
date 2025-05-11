import React, { useState } from 'react';
import './index.scss';

interface LikeButtonProps {
  isLiked: boolean;
  onChange: () => void;
  likeCount?: number;
}

const LikeButton: React.FC<LikeButtonProps> = ({ isLiked, onChange, likeCount }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const handleChange = (checked: boolean) => {
    // 只有在点击变为喜欢状态时才触发动画
    if (checked) {
      setShouldAnimate(true);
    } else {
      setShouldAnimate(false);
    }
    onChange();
  };

  return (
    <label className={`like-button ${shouldAnimate ? 'animate' : ''} ${isLiked ? 'liked' : ''}`}>
      <input
        type="checkbox"
        checked={isLiked}
        onChange={(e) => {
          e.stopPropagation();
          handleChange(e.target.checked);
        }}
        hidden
      />
      <svg
        className="icon"
        viewBox="0 0 1024 1024"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M512 896a42.666667 42.666667 0 0 1-30.293333-12.373333l-331.52-331.946667a224.426667 224.426667 0 0 1 0-315.733333 223.573333 223.573333 0 0 1 315.733333 0L512 282.026667l46.08-46.08a223.573333 223.573333 0 0 1 315.733333 0 224.426667 224.426667 0 0 1 0 315.733333l-331.52 331.946667A42.666667 42.666667 0 0 1 512 896z"
          id="heart"
        />
      </svg>
      <span className="like-effect"></span>
      {likeCount !== undefined && <div className="like-count">{likeCount}</div>}
    </label>
  );
};

export default LikeButton;
