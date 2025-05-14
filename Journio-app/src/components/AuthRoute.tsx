import { useUserStore } from '@/store/user';
import { Toast } from 'antd-mobile';
import { ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface AuthRouteProps {
  children: ReactNode;
  message?: string;
}

export const AuthRoute = ({ children, message = '请先登录' }: AuthRouteProps) => {
  const { userInfo } = useUserStore();
  const location = useLocation();

  useEffect(() => {
    if (!userInfo) {
      Toast.show({
        icon: 'fail',
        content: message,
        duration: 1000,
      });
    }
  }, [userInfo, message]);

  if (!userInfo) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
};
