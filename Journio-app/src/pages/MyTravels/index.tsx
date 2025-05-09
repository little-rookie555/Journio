import { deleteTravel, getUserTravels } from '@/api/travel';
import { uploadFile } from '@/api/upload';
import { useUserStore } from '@/store/user';
import { Button, Image, NavBar, Tabs, Tag, Toast, Popup, Form, Input, ImageUploader } from 'antd-mobile';
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';
import { stripHtml } from '@/components/utils';
import { AppOutline,CheckOutline, ClockCircleOutline, CloseOutline } from 'antd-mobile-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { Switch } from 'antd-mobile';

const MyTravels: React.FC = () => {
  const navigate = useNavigate();
  const { userInfo, logout, updateInfo } = useUserStore();
  const [travels, setTravels] = useState<any[]>([]);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const { theme, toggleTheme } = useTheme();
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
      <div className="header-container">
        <NavBar
          style={{
            background: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1
          }}
          onBack={() => navigate('/')}
          right={
            <Button size="small" color="primary" onClick={() => navigate('/publish')}>
              发布游记
            </Button>
          }
        >
          我的游记
        </NavBar>
      </div>

      <div className="user-profile">
        <Image src={userInfo?.avatar} className="profile-avatar" />
        <div className="profile-info">
          <div className="profile-header">
            <div className="nickname">{userInfo?.nickname}</div>
            <Switch
              className="theme-switch"
              uncheckedText="☀️"
              checkedText="🌙"
              checked={theme === 'dark'}
              onChange={toggleTheme}
              style={{
                '--checked-color': '#4a90e2',
                '--height': '24px',
                '--width': '44px'
              }}
            />
          </div>
          <div className="stats">
            <span>游记数: {travels.length}</span>
          </div>
          <div className="profile-actions">
            <Button 
              size="small" 
              style={{ background: 'transparent',
                       border: '1px solid rgba(255,255,255,0.5)',
                      borderRadius: '20px',
                      color: 'rgba(255,255,255,0.8)' }}
              onClick={() => setShowEditProfile(true)}
            >
              编辑资料
            </Button>
            <Button 
              size="small" 
              style={{ background: 'transparent',
                       border: '1px solid rgba(255,255,255,0.5)',
                       borderRadius: '20px',
                       color: 'rgba(255,255,255,0.8)'}}
              onClick={handleLogout}
            >
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
                  try {
                    const res = await uploadFile(file);
                    if (res.code === 200) {
                      return {
                        url: res.data.url,
                      };
                    } else {
                      Toast.show({
                        icon: 'fail',
                        content: '上传失败',
                      });
                      return {
                        url: URL.createObjectURL(file),
                      };
                    }
                  } catch (error) {
                    console.error('上传失败:', error);
                    Toast.show({
                      icon: 'fail',
                      content: '上传失败，请稍后重试',
                    });
                    // 上传失败时，仍然返回本地预览URL
                    return {
                      url: URL.createObjectURL(file),
                    };
                  }
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
        <Tabs.Tab title={<><AppOutline /> 全部</>} key="all" />
        <Tabs.Tab title={<><CheckOutline /> 已通过</>} key="approved" />
        <Tabs.Tab title={<><ClockCircleOutline /> 待审核</>} key="pending" />
        <Tabs.Tab title={<><CloseOutline /> 未通过</>} key="rejected" />
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
                    backgroundColor: 'transparent'
                  }} 
                  onClick={() => navigate(`/publish?edit=${item.id}`)}
                >
                  编辑
                </Button>
                <Button 
                  size="small" 
                  color="primary" 
                  onClick={() => handleDelete(item.id)}
                >
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
