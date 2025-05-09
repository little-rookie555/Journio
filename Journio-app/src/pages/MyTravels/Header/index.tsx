import React, { useState } from 'react';
import {
  Switch,
  List,
  Button,
  Image,
  NavBar,
  Toast,
  Popup,
  Form,
  Input,
  ImageUploader,
} from 'antd-mobile';
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import { SetOutline } from 'antd-mobile-icons';
import { useNavigate } from 'react-router-dom';
import { uploadFile } from '@/api/upload';
import { useTheme } from '@/contexts/ThemeContext';
import './index.scss';

interface UserInfo {
  avatar?: string;
  nickname?: string;
}

interface UserHeaderProps {
  onLogout: () => void;
  userInfo: UserInfo;
  onUpdateInfo: (info: { nickname: string; avatar: string }) => Promise<void>;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onLogout, userInfo, onUpdateInfo }) => {
  const navigate = useNavigate();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const handleEditProfile = async (values: { nickname: string; avatar: ImageUploadItem[] }) => {
    try {
      await onUpdateInfo({
        nickname: values.nickname,
        avatar: values.avatar[0].url,
      });
      setShowEditProfile(false);
      Toast.show('更新成功');
    } catch {
      Toast.show('更新失败');
    }
  };

  return (
    <>
      <div className={`header-container ${theme === 'dark' ? 'dark' : ''}`}>
        <NavBar
          style={{
            background: 'transparent',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1,
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

      <div className={`user-profile ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="profile-main">
          <div className="user-info">
            <Image src={userInfo?.avatar} className="profile-avatar" />
            <div className="user-detail">
              <div className="nickname">{userInfo?.nickname}</div>
              <div className="bio" onClick={() => setShowEditProfile(true)}>
                点击这里，填写简介
              </div>
            </div>
          </div>

          <div className="user-actions">
            <div className="stats">
              <div className="stat-item">
                <div className="stat-value">26</div>
                <div className="stat-label">关注</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">6</div>
                <div className="stat-label">粉丝</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">5</div>
                <div className="stat-label">获赞与收藏</div>
              </div>
            </div>
            <div className="action-buttons">
              <Button
                size="small"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '20px',
                  color: '#fff',
                  width: '90px',
                  border:
                    theme === 'dark'
                      ? '1px solid rgba(255,255,255,0.15)'
                      : '1px solid rgba(255,255,255,0.3)',
                }}
                onClick={() => setShowEditProfile(true)}
              >
                编辑资料
              </Button>
              <Button
                size="small"
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '30%',
                  width: '32px',
                  height: '24px',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border:
                    theme === 'dark'
                      ? '1px solid rgba(255,255,255,0.15)'
                      : '1px solid rgba(255,255,255,0.3)',
                }}
                onClick={() => setShowSettings(true)}
              >
                <SetOutline />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <Popup
        visible={showEditProfile}
        onMaskClick={() => setShowEditProfile(false)}
        bodyStyle={{
          height: '50vh',
          backgroundColor: theme === 'dark' ? 'var(--adm-color-background)' : '#fff',
        }}
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
            <Form.Item rules={[{ required: true }]} name="avatar" label="头像">
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

      <Popup
        visible={showSettings}
        onMaskClick={() => setShowSettings(false)}
        bodyStyle={{
          height: '200px',
          backgroundColor: theme === 'dark' ? 'var(--adm-color-background)' : '#fff',
        }}
      >
        <div className="settings-popup">
          <List>
            <List.Item
              extra={
                <Switch
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                  uncheckedText="☀️"
                  checkedText="🌙"
                />
              }
            >
              深色模式
            </List.Item>
            <List.Item onClick={onLogout}>退出登录</List.Item>
          </List>
        </div>
      </Popup>
    </>
  );
};

export default UserHeader;
