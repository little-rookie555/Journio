import { UserInfo, UserLoginParams, UserRegisterParams, UserUpdateParams } from '@/mock/user';
import request from '@/utils/request';

// 用户注册
export const register = (
  params: UserRegisterParams,
): Promise<{ code: number; data: UserInfo; message?: string }> => {
  console.log('注册成功！', params);
  return request.post('/user/register', params);
};

// 用户登录
export const login = (
  params: UserLoginParams,
): Promise<{ code: number; data: UserInfo & { token: string }; message?: string }> => {
  return request.post('/user/login', params);
};

// 更新用户信息
export const updateUserInfo = (
  params: UserUpdateParams,
): Promise<{ code: number; data: UserInfo; message?: string }> => {
  return request.put('/user/update', params);
};
