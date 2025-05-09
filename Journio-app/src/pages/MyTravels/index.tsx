import { deleteTravel, getUserTravels } from '@/api/travel';
import { useUserStore } from '@/store/user';
import { Button, Image, Tabs, Tag, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { stripHtml } from '@/components/utils';
import { AppOutline, CheckOutline, ClockCircleOutline, CloseOutline } from 'antd-mobile-icons';
import { useTheme } from '@/contexts/ThemeContext';
import Head from './Header';
const MyTravels: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, logout, updateInfo } = useUserStore();
  const [travels, setTravels] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const { theme } = useTheme();

  useEffect(() => {
    const fetchTravels = async () => {
      if (!userInfo) return;

      try {
        const res = await getUserTravels(userInfo.id);
        if (res.code === 200) {
          setTravels(res.data);
        }
      } catch {
        Toast.show('获取游记失败');
      }
    };

    fetchTravels();
  }, [userInfo]);

  const filteredTravels = travels.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'approved') return item.status === 1;
    if (activeTab === 'pending') return item.status === 0;
    if (activeTab === 'rejected') return item.status === 2;
    return true;
  });

  const handleDelete = async (id: number) => {
    try {
      await deleteTravel(id);
      setTravels(travels.filter((item) => item.id !== id));
      Toast.show('删除成功');
    } catch {
      Toast.show('删除失败');
    }
  };

  const getStatusTag = (status: number) => {
    switch (status) {
      case 0:
        return <Tag color="orange">待审核</Tag>;
      case 1:
        return <Tag color="green">已通过</Tag>;
      case 2:
        return <Tag color="red">未通过</Tag>;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    logout();
    Toast.show('退出成功');
    navigate('/login');
  };
  return (
    <div className="my-travels">
      <Head onLogout={handleLogout} userInfo={userInfo!} onUpdateInfo={updateInfo} />
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        style={{
          '--title-font-size': '14px',
          // '--active-title-color': theme === 'dark' ? '#fff' : '#000',
          // '--title-color': theme === 'dark' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)',
          // '--content-padding': '0',
          // '--background-color': theme === 'dark' ? '#1e1e1e' : '#f5f5f5'
        }}
      >
        <Tabs.Tab
          title={
            <>
              <AppOutline /> 全部
            </>
          }
          key="all"
        />
        <Tabs.Tab
          title={
            <>
              <CheckOutline /> 已通过
            </>
          }
          key="approved"
        />
        <Tabs.Tab
          title={
            <>
              <ClockCircleOutline /> 待审核
            </>
          }
          key="pending"
        />
        <Tabs.Tab
          title={
            <>
              <CloseOutline /> 未通过
            </>
          }
          key="rejected"
        />
      </Tabs>

      <div className="travel-list">
        {filteredTravels.map((item) => (
          <div key={item.id} className={`travel-card ${theme === 'dark' ? 'dark' : ''}`}>
            <div className="card-left">
              <Image src={item.coverImage} className="cover-image" />
              <div className="status-tag">{getStatusTag(item.status)}</div>
            </div>
            <div className="card-right">
              <div className="content">
                <h3 className="title">{item.title}</h3>
                <p className="desc">{stripHtml(item.content, 100)}</p>
              </div>
              <div className="actions">
                <Button
                  size="small"
                  style={{
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)'}`,
                    color: theme === 'dark' ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)',
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => navigate(`/publish?edit=${item.id}`)}
                >
                  编辑
                </Button>
                <Button size="small" color="primary" onClick={() => handleDelete(item.id)}>
                  删除
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyTravels;
