import { UnorderedListOutlined } from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();

  const menuItems = [
    {
      key: 'audit',
      icon: <UnorderedListOutlined />,
      label: '审核列表',
      onClick: () => navigate('/audit'),
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ color: 'white' }}>旅记审核系统</Header>
      <Layout>
        <Sider>
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['audit']} items={menuItems} />
        </Sider>
        <Content style={{ padding: '24px', minHeight: 280 }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
