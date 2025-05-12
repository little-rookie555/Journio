import {
  FileOutlined,
  DashboardOutlined,
  UnorderedListOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const MainLayout: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<string | null>(localStorage.getItem('role'));
  const [username, setUsername] = useState<string | null>(localStorage.getItem('username'));

  // 监听localStorage的变化
  useEffect(() => {
    const handleStorageChange = () => {
      setRole(localStorage.getItem('role'));
      setUsername(localStorage.getItem('username'));
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const menuItems = [
    {
      key: 'Statistic',
      icon: <DashboardOutlined />,
      label: '数据统计',
      onClick: () => navigate('/statistic'),
    },
    {
      key: 'audit',
      icon: <FileOutlined />,
      label: '游记列表',
      // onClick: () => navigate('/audit'),
      children: [
        {
          key: 'audit-pending',
          label: '待审核游记',
          onClick: () => navigate('/audit/pending'),
        },
        {
          key: 'audit-approved',
          label: '已通过游记',
          onClick: () => navigate('/audit/approved'),
        },
        {
          key: 'audit-rejected',
          label: '已拒绝游记',
          onClick: () => navigate('/audit/rejected'),
        },
      ],
    },
    {
      key: 'admin',
      icon: <UserOutlined />,
      label: '管理列表',
      children: [
        ...(role !== '3'
          ? []
          : [
              {
                key: 'admin-admins',
                label: '管理员列表',
                onClick: () => navigate('/admin/admins'),
              },
            ]),
        {
          key: 'admin-users',
          label: '用户列表',
          onClick: () => navigate('/admin/users'),
        },
      ],
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header
        style={{
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '20px',
        }}
      >
        <span style={{ fontSize: '18px' }}>旅记审核系统</span>
        <span>
          <UserOutlined style={{ marginRight: '8px' }} />
          {username}
        </span>
      </Header>
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
