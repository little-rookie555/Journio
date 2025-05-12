import { getFanList, getFollowList, followUser, checkFollowStatus } from '@/api/follow';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserStore } from '@/store/user';
import { Avatar, List, NavBar, Tabs, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import './index.scss';

const Following: React.FC = () => {
  const { theme } = useTheme();
  const { userInfo } = useUserStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [followList, setFollowList] = useState<any[]>([]);
  const [fanList, setFanList] = useState<any[]>([]);
  const [followStatus, setFollowStatus] = useState<{ [key: number]: boolean }>({});

  // 监听 URL 变化来更新 activeTab
  const [activeTab, setActiveTab] = useState(
    searchParams.get('tab') === 'fans' ? 'fans' : 'following',
  );

  // 添加对 URL 变化的监听
  useEffect(() => {
    const currentTab = new URLSearchParams(location.search).get('tab');
    setActiveTab(currentTab === 'fans' ? 'fans' : 'following');
  }, [location.search]);

  useEffect(() => {
    if (!userInfo?.id) return;

    const fetchData = async () => {
      try {
        // 获取关注列表
        const followRes = await getFollowList(userInfo.id);
        if (followRes.code === 200) {
          setFollowList(followRes.data);
          // 设置关注列表中的用户为已关注状态
          const followStatusMap = followRes.data.reduce((acc: any, user: any) => {
            acc[user.id] = true;
            return acc;
          }, {});
          setFollowStatus(followStatusMap);
        }

        // 获取粉丝列表
        const fanRes = await getFanList(userInfo.id);
        if (fanRes.code === 200) {
          setFanList(fanRes.data);
          // 检查每个粉丝的关注状态
          for (const fan of fanRes.data) {
            const statusRes = await checkFollowStatus({
              userId: userInfo.id,
              followUserId: fan.id,
            });
            if (statusRes.code === 200) {
              setFollowStatus((prev) => ({
                ...prev,
                [fan.id]: statusRes.data,
              }));
            }
          }
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    };

    fetchData();
  }, [userInfo?.id]);

  const handleFollow = async (targetUserId: number) => {
    if (!userInfo) {
      Toast.show({
        content: '请先登录',
        icon: 'fail',
      });
      navigate('/login');
      return;
    }

    try {
      const res = await followUser({
        userId: userInfo.id,
        followUserId: targetUserId,
        isFollow: !followStatus[targetUserId],
      });

      if (res.code === 200) {
        setFollowStatus((prev) => ({
          ...prev,
          [targetUserId]: !prev[targetUserId],
        }));
        Toast.show({
          icon: 'success',
          content: followStatus[targetUserId] ? '已取消关注' : '关注成功',
        });

        // 重新获取关注列表和粉丝列表
        const followRes = await getFollowList(userInfo.id);
        if (followRes.code === 200) {
          setFollowList(followRes.data);
        }

        const fanRes = await getFanList(userInfo.id);
        if (fanRes.code === 200) {
          setFanList(fanRes.data);
        }
      }
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.message || '操作失败',
      });
    }
  };

  const renderUserItem = (user: any) => (
    <List.Item
      key={user.id}
      prefix={<Avatar src={user.avatar} />}
      description={user.desc || '这个人很懒，还没有简介'}
      arrow={false}
      onClick={() => navigate(`/profile/${user.id}`)}
      extra={
        user.id !== userInfo?.id && (
          <div
            className={`follow-status ${followStatus[user.id] ? 'followed' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              handleFollow(user.id);
            }}
          >
            {followStatus[user.id] ? '已关注' : '关注'}
          </div>
        )
      }
    >
      {user.username}
    </List.Item>
  );

  const handleTabChange = (key: string) => {
    setActiveTab(key);
    if (key === 'fans') {
      navigate(`/following/${userInfo?.id}?tab=fans`, { replace: true });
    } else {
      navigate(`/following/${userInfo?.id}`, { replace: true });
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
