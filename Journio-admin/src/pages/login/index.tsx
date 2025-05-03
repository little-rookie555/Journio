import { login } from '@/api/user';
import { Button, Card, Form, Input, message } from 'antd';
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './index.scss';

interface LoginParams {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const onFinish = async (values: LoginParams) => {
    const res = await login(values);
    localStorage.setItem('token', res.data.token);
    localStorage.setItem('username', res.data.userInfo.username);
    message.success('登录成功');
    navigate('/audit');
  };

  return (
    <div className="login-wrapper">
      <Card title="登录" className="login-card">
        <Form onFinish={onFinish}>
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password placeholder="密码" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
