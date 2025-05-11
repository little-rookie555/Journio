import { Avatar, List, SearchBar } from 'antd-mobile';
import React, { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import './index.scss';

const Following: React.FC = () => {
  const { theme } = useTheme();
  const [searchValue, setSearchValue] = useState('');

  // 模拟关注列表数据
  const followingList = [
    {
      id: 1,
      nickname: '+1',
      avatar: 'https://example.com/avatar1.jpg',
      articleCount: 5,
      desc: '5篇笔记未看',
    },
    {
      id: 2,
      nickname: '云端侧墨',
      avatar: 'https://example.com/avatar2.jpg',
      desc: '还没有简介',
    },
    {
      id: 3,
      nickname: '政治理论',
      avatar: 'https://example.com/avatar3.jpg',
      articleCount: 5,
      desc: '5篇笔记未看',
    },
    {
      id: 4,
      nickname: '花生十三',
      avatar: 'https://example.com/avatar4.jpg',
      articleCount: 10,
      desc: '10+篇笔记未看',
    },
    {
      id: 5,
      nickname: '不会编程会摸鱼',
      avatar: 'https://example.com/avatar5.jpg',
      desc: '乐乐乐乐乐哈哈',
    },
  ];

  return (
    <div className={`following-page ${theme === 'dark' ? 'dark' : ''}`}>
      <SearchBar
        placeholder="搜索已关注的人"
        value={searchValue}
        onChange={setSearchValue}
        className="search-bar"
        style={{
          '--background': theme === 'dark' ? 'var(--adm-color-box)' : '#fff',
          '--border-radius': '8px',
        }}
      />

      <List className="following-list">
        {followingList.map((user) => (
          <List.Item
            key={user.id}
            prefix={<Avatar src={user.avatar} />}
            description={user.desc}
            arrow={false}
            extra={<div className="follow-status">已关注</div>}
          >
            {user.nickname}
          </List.Item>
        ))}
      </List>
    </div>
  );
};

export default Following;
