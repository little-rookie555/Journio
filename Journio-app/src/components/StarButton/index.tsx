import { StarFill, StarOutline } from 'antd-mobile-icons';
import React, { useState } from 'react';
import './index.scss';

interface StarButtonProps {
  isStarred: boolean;
  onChange: (starred: boolean) => void;
  text?: boolean;
}

const StarButton: React.FC<StarButtonProps> = ({ isStarred, onChange, text = true }) => {
  const [shouldAnimate, setShouldAnimate] = useState(false);

  const handleChange = (checked: boolean) => {
    if (checked) {
      setShouldAnimate(true);
    } else {
      setShouldAnimate(false);
    }
    onChange(checked);
  };

  return (
    <label
      className={`star-button ${shouldAnimate ? 'animate' : ''} ${isStarred ? 'starred' : ''}`}
    >
      <input
        type="checkbox"
        checked={isStarred}
        onChange={(e) => handleChange(e.target.checked)}
        hidden
      />
      <div className="star-icon">
        {isStarred ? (
          <StarFill fontSize={24} className="icon-starred" />
        ) : (
          <StarOutline fontSize={24} className="icon-default" />
        )}
      </div>
      <span className="star-effect"></span>
      {text && <span className="star-text">{isStarred ? '已收藏' : '收藏'}</span>}
    </label>
  );
};

export default StarButton;
