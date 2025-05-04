import { UserInfo, UserLoginParams, UserRegisterParams } from '@/mock/user';
import request from '@/utils/request';

// 用户注册
export const register = (
  params: UserRegisterParams,
): Promise<{ code: number; data: UserInfo; message?: string }> => {
  // console.log('params', params);
  return request.post('/user/register', params);
};

// 用户登录
export const login = (
  params: UserLoginParams,
): Promise<{ code: number; data: UserInfo & { token: string }; message?: string }> => {
  return request.post('/user/login', params);
};
