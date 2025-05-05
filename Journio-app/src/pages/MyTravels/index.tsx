import { deleteTravel, getUserTravels } from '@/api/travel';
import { useUserStore } from '@/store/user';
import { Button, Image, NavBar, Tabs, Tag, Toast } from 'antd-mobile';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const MyTravels: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo } = useUserStore();
  const [travels, setTravels] = useState<any[]>([]);

  const [activeTab, setActiveTab] = useState('all');

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

  return (
    <div className="my-travels">
      <NavBar
        right={
          <Button size="small" color="primary" onClick={() => navigate('/publish')}>
            发布游记
          </Button>
        }
      >
        我的游记
      </NavBar>

      <div className="user-profile">
        <Image src={userInfo?.avatar} className="profile-avatar" />
        <div className="profile-info">
          <div className="nickname">{userInfo?.nickname}</div>
          <div className="stats">
            <span>游记数: {travels.length}</span>
          </div>
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.Tab title="全部" key="all" />
        <Tabs.Tab title="已通过" key="approved" />
        <Tabs.Tab title="待审核" key="pending" />
        <Tabs.Tab title="未通过" key="rejected" />
      </Tabs>

      <div className="travel-list">
        {filteredTravels.map((item) => (
          <div key={item.id} className="travel-card">
            <div className="card-left">
              <Image src={item.coverImage} className="cover-image" />
              <div className="status-tag">{getStatusTag(item.status)}</div>
            </div>
            <div className="card-right">
              <div className="content">
                <h3 className="title">{item.title}</h3>
                <p className="desc">{item.content}</p>
              </div>
              <div className="actions">
                <Button size="small" onClick={() => navigate(`/publish?edit=${item.id}`)}>
                  编辑
                </Button>
                <Button size="small" color="danger" onClick={() => handleDelete(item.id)}>
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
