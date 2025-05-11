import { getFanList, getFollowList } from '@/api/follow';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/user';
import { Avatar, List, NavBar, Tabs } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './index.scss';

const Following: React.FC = () => {
  const { theme } = useTheme();
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [followList, setFollowList] = useState<any[]>([]);
  const [fanList, setFanList] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'fans' ? 'fans' : 'following',
  );

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchData = async () => {
      try {
        // 获取关注列表
        const followRes = await getFollowList(userInfo.id);
        if (followRes.code === 200) {
          setFollowList(followRes.data);
        }

        // 获取粉丝列表
        const fanRes = await getFanList(userInfo.id);
        if (fanRes.code === 200) {
          setFanList(fanRes.data);
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, [userInfo?.id]);

  const renderUserItem = (user: any) => (
    <List.Item
      key={user.id}
      prefix={<Avatar src={user.avatar} />}
      description={user.desc || '这个人很懒，还没有简介'}
      arrow={false}
      extra={<div className="follow-status">已关注</div>}
    >
      {user.username}
    </List.Item>
  );

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'fans') {
      navigate('/following?tab=fans');
    } else {
      navigate('/following');
    }
  };

  return (
    <div className={`following-page ${theme === 'dark' ? 'dark' : ''}`}>
      <NavBar onBack={() => navigate(-1)} style={{ borderBottom: 'none' }}>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{
            '--title-font-size': '14px',
            '--active-title-color': 'var(--adm-color-primary)',
            '--content-padding': '0',
          }}
        >
          <Tabs.Tab title={`关注 ${followList.length}`} key="following" />
          <Tabs.Tab title={`粉丝 ${fanList.length}`} key="fans" />
        </Tabs>
      </NavBar>

      {activeTab === 'following' && (
        <List className="following-list">{followList.map(renderUserItem)}</List>
      )}
      {activeTab === 'fans' && <List className="fan-list">{fanList.map(renderUserItem)}</List>}
    </div>
  );
};

export default Following;
