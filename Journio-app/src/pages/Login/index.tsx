import { useUserStore } from '@/store/user';
import { Button, Form, Input, NavBar, Toast } from 'antd-mobile';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, loading } = useUserStore();

  const onFinish = async (values: any) => {
    try {
      await login(values.username, values.password);
      Toast.show({
        icon: 'success',
        content: '登录成功',
      });
      navigate('/');
    } catch (error: any) {
      Toast.show({
        icon: 'fail',
        content: error?.message || '登录失败，请稍后重试',
      });
    }
  };

  return (
    <div className="login">
      <NavBar onBack={() => navigate('/')} className="nav-bar">
        登录账号
      </NavBar>
      <div className="login-form">
        <div className="logo-container">
          <img src="/image/logo.png" alt="Journio" className="logo" />
        </div>
        <Form
          layout="vertical"
          onFinish={onFinish}
          footer={
            <Button block type="submit" color="primary" loading={loading}>
              登录
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
        </Form>
        <div className="login-footer">
          没有账号？
          <a onClick={() => navigate('/register')}>去注册</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
