import { TabBar } from 'antd-mobile';
import { AddOutline, AppOutline, UserOutline } from 'antd-mobile-icons';
import React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/contexts/ThemeContext';
import './index.scss';

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const { theme } = useTheme();

  const tabs = [
    {
      key: '/',
      title: '首页',
      icon: <AppOutline />,
    },
    {
      key: '/publish',
      icon: (
        <div
          style={{
            backgroundColor: '#4a90e2',
            borderRadius: '12px',
            width: '52px',
            height: '39px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            marginTop: '-16px',
            boxShadow: '0 2px 12px rgba(74, 144, 226, 0.3)',
          }}
        >
          <AddOutline color="#fff" fontSize={24} />
        </div>
      ),
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
    <div className={`layout ${theme === 'dark' ? 'dark' : ''}`}>
      <div className="content">
        <Outlet />
      </div>
      <div className="tab-bar-container">
        <TabBar 
          safeArea 
          activeKey={pathname} 
          onChange={(value) => setRouteActive(value)}
        >
          {tabs.map((item) => (
            <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
          ))}
        </TabBar>
      </div>
    </div>
  );
};

export default Layout;
