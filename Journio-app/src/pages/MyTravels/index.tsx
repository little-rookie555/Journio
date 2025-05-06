import { deleteTravel, getUserTravels } from '@/api/travel';
import { useUserStore } from '@/store/user';
import { Button, Image, NavBar, Tabs, Tag, Toast, Popup, Form, Input, ImageUploader } from 'antd-mobile';
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { stripHtml } from '@/components/utils';

const MyTravels: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, logout, updateInfo } = useUserStore();
  const [travels, setTravels] = useState<any[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
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

  const handleEditProfile = async (values: { nickname: string, avatar: ImageUploadItem[] }) => {
    try {
      await updateInfo({
        nickname: values.nickname,
        avatar: values.avatar[0].url, // 使用 url 属性获取图片地址
      });
      setShowEditProfile(false);
      Toast.show('更新成功');
    } catch (error) {
      Toast.show('更新失败');
    }
  };

  const handleLogout = () => {
    logout();
    Toast.show('退出成功');
    navigate('/login');
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
          <div className="profile-actions">
            <Button size="small" onClick={() => setShowEditProfile(true)}>
              编辑资料
            </Button>
            <Button size="small" color="danger" onClick={handleLogout}>
              退出登录
            </Button>
          </div>
        </div>
      </div>

      <Popup
        visible={showEditProfile}
        onMaskClick={() => setShowEditProfile(false)}
        bodyStyle={{ height: '50vh' }}
      >
        <div className="edit-profile-popup">
          <Form
            layout="horizontal"
            onFinish={handleEditProfile}
            initialValues={{ 
              nickname: userInfo?.nickname,
              avatar: userInfo?.avatar ? [{ url: userInfo.avatar }] : [],
            }}
            footer={
              <Button block type="submit" color="primary">
                保存
              </Button>
            }
          >
            <Form.Header>编辑个人资料</Form.Header>
            <Form.Item
              rules={[{ required: true }]}
              name="avatar"
              label="头像"
            >
              <ImageUploader
                value={userInfo?.avatar ? [{ url: userInfo.avatar }] : []}
                maxCount={1}
                upload={async (file) => {
                  // 这里模拟上传，实际项目中需要替换为真实的上传接口
                  return {
                    url: URL.createObjectURL(file),
                  };
                }}
              />
            </Form.Item>
            <Form.Item
              name="nickname"
              label="昵称"
              rules={[{ required: true, message: '请输入昵称' }]}
            >
              <Input placeholder="请输入昵称" />
            </Form.Item>
          </Form>
        </div>
      </Popup>

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
                <p className="desc">{stripHtml(item.content, 100)}</p>
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
