import { uploadFile } from '@/api/upload';
import { compressImage } from '@/components/ImageCompressor';
import ImageCropper from '@/components/ImageCropper';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Button,
  Form,
  Image,
  ImageUploader,
  Input,
  List,
  NavBar,
  Popup,
  Switch,
  TextArea,
  Toast,
} from 'antd-mobile';
import { SetOutline } from 'antd-mobile-icons';
import type { ImageUploadItem } from 'antd-mobile/es/components/image-uploader';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

interface UserInfo {
  avatar?: string;
  nickname?: string;
  id: number;
  followingCount?: number; // 添加关注数
  fanCount?: number; // 添加粉丝数
  likedCount?: number; // 添加获赞数
  starredCount?: number; // 添加收藏数
  desc?: string; // 添加简介
}

interface UserHeaderProps {
  onLogout: () => void;
  userInfo: UserInfo;
  onUpdateInfo: (info: { nickname: string; avatar: string; desc: string }) => Promise<void>;
}

const UserHeader: React.FC<UserHeaderProps> = ({ onLogout, userInfo, onUpdateInfo }) => {
  const navigate = useNavigate();
  const [form] = Form.useForm(); // 添加这行
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const [showCropper, setShowCropper] = useState(false);
  const [cropperFile, setCropperFile] = useState<File | null>(null);

  const handleEditProfile = async (values: {
    nickname: string;
    avatar: ImageUploadItem[];
    desc: string;
  }) => {
    try {
      await onUpdateInfo({
        nickname: values.nickname,
        avatar: values.avatar[0].url,
        desc: values.desc,
      });
      setShowEditProfile(false);
      Toast.show('更新成功');
    } catch {
      Toast.show('更新失败');
    }
  };

  const handleCropComplete = async (file: File) => {
    try {
      const compressedFile = await compressImage(file);
      const res = await uploadFile(compressedFile);
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
    } finally {
      setShowCropper(false);
      setCropperFile(null);
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
            <Image
              src={userInfo?.avatar}
              className="profile-avatar"
              onClick={() => navigate(`/profile/${userInfo?.id}`)}
            />
            <div className="user-detail">
              <div className="nickname">{userInfo?.nickname}</div>
              <div className="bio" onClick={() => setShowEditProfile(true)}>
                {userInfo?.desc || '点击这里，填写简介'}
              </div>
            </div>
          </div>

          <div className="user-actions">
            <div className="stats">
              <div className="stat-item" onClick={() => navigate(`/following/${userInfo?.id}`)}>
                <div className="stat-value">{userInfo?.followingCount || 0}</div>
                <div className="stat-label">关注</div>
              </div>
              <div
                className="stat-item"
                onClick={() => navigate(`/following/${userInfo?.id}?tab=fans`)}
              >
                <div className="stat-value">{userInfo?.fanCount || 0}</div>
                <div className="stat-label">粉丝</div>
              </div>
              <div className="stat-item">
                <div className="stat-value">
                  {(userInfo?.likedCount || 0) + (userInfo?.starredCount || 0)}
                </div>
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
            form={form} // 添加这个属性
            layout="horizontal"
            onFinish={handleEditProfile}
            initialValues={{
              nickname: userInfo?.nickname,
              avatar: userInfo?.avatar ? [{ url: userInfo.avatar }] : [],
              desc: userInfo?.desc,
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
                beforeUpload={(file) => {
                  setCropperFile(file);
                  setShowCropper(true);
                  return null; // 返回 null 而不是 false
                }}
                upload={async () => {
                  // 这里不需要实际的上传逻辑，因为在裁剪完成后会处理
                  return { url: '' };
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
            <Form.Item name="desc" label="简介">
              <TextArea placeholder="介绍一下自己吧" maxLength={50} showCount />
            </Form.Item>
          </Form>
        </div>
      </Popup>

      <ImageCropper
        visible={showCropper}
        file={cropperFile}
        onClose={() => {
          setShowCropper(false);
          setCropperFile(null);
        }}
        onCropComplete={async (file) => {
          const result = await handleCropComplete(file);
          if (result.url) {
            // 更新表单值
            form.setFieldsValue({
              avatar: [{ url: result.url }],
            });
          }
        }}
        aspectRatio={1} // 1:1 比例，适合头像
      />

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
