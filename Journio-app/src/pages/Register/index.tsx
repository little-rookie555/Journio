import { register } from '@/api/user';
import { uploadFile } from '@/api/upload';
import { Button, Form, ImageUploader, Input, NavBar, Toast } from 'antd-mobile';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    try {
      setLoading(true);
      const res = await register(values);
      console.log('注册结果：', res);
      if (res.code === 200) {
        Toast.show({
          icon: 'success',
          content: '注册成功',
        });
        navigate('/login');
      } else {
        Toast.show({
          icon: 'fail',
          content: '注册失败',
        });
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      Toast.show({
        icon: 'fail',
        content: '注册失败，请稍后重试',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <NavBar onBack={() => navigate('/')} className="nav-bar">
        注册账号
      </NavBar>
      <div className="register-form">
        <div className="logo-container">
          <img src="/image/logo.png" alt="Journio" className="logo" />
        </div>
        <Form
          layout="vertical"
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" loading={loading}>
              注册
            </Button>
          }
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input type="password" placeholder="请输入密码" />
          </Form.Item>
          <Form.Item
            name="nickname"
            label="昵称"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="avatar" label="头像">
            <ImageUploader
              maxCount={1}
              upload={async (file) => {
                try {
                  const res = await uploadFile(file);
                  console.log('上传结果：', res);
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
        </Form>
        <div className="register-footer">
          已有账号？
          <a onClick={() => navigate('/login')}>去登录</a>
        </div>
      </div>
    </div>
  );
};

export default Register;
