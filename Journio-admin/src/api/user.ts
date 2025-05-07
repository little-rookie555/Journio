import request from '@/utils/request';

interface LoginParams {
  username: string;
  password: string;
}

export interface LoginResponse {
  code: number;
  data: {
    token: string;
    role: string;
    userInfo: {
      id: number;
      username: string;
    };
  };
}

export const login = (data: LoginParams): Promise<LoginResponse> => {
  return request.post('/audit/login', data);
};
