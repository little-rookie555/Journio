import { UserInfo, UserRegisterParams } from '@/mock/user';
import request from '@/utils/request';

// 用户注册
export const register = (
  params: UserRegisterParams,
): Promise<{ code: number; data: UserInfo; message?: string }> => {
  // console.log('params', params);
  return request.post('/user/register', params);
};
