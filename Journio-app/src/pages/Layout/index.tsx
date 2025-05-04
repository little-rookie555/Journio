import React from 'react';
import { TabBar } from 'antd-mobile';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppOutline, AddCircleOutline, UserOutline } from 'antd-mobile-icons';
import './index.scss';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;

  const tabs = [
    {
      key: '/',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/publish',
      title: '发布',
      icon: <AddCircleOutline />,
    },
    {
      key: '/my-travels',
      title: '我的',
      icon: <UserOutline />,
    },
  ];

  const setRouteActive = (value: string) => {
    navigate(value);
  };

  return (
    <div className="layout">
      <div className="content">
        <Outlet />
      </div>
      <TabBar activeKey={pathname} onChange={(value) => setRouteActive(value)}>
        {tabs.map((item) => (
          <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
        ))}
      </TabBar>
    </div>
  );
};

export default Layout;
