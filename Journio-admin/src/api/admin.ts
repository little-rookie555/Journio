import request from '@/utils/request';

export interface AdminUser {
  key: string;
  username: string;
  role: number;
  updateTime: string;
  status: number;
}

export interface AdminUserResponse {
  code: number;
  data: AdminUser[];
  total: number;
  message?: string;
}

export interface AdminUserDetail {
  code: number;
  data: AdminUser;
  message?: string;
}

export interface AdminUserParams {
  code: number;
  message?: string;
}

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

/**
 * 登录
 */
export const login = (data: LoginParams): Promise<LoginResponse> => {
  return request.post('/audit/login', data);
};

/**
 * 获取管理员用户列表
 */
export const getAdminList = (
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
): Promise<AdminUserResponse> => {
  return request.get('/admin', {
    params: {
      page,
      pageSize,
      search,
    },
  });
};

/**
 * 获取用户列表
 */
export const getUserList = (
  page: number = 1,
  pageSize: number = 10,
  search: string = '',
): Promise<AdminUserResponse> => {
  return request.get('/admin/user', {
    params: {
      page,
      pageSize,
      search,
    },
  });
};

/**
 * 创建管理员用户
 * @param username 用户名
 * @param password 密码
 * @param role 角色
 */
export const createAdmin = (
  username: string,
  password: string,
  role: string,
): Promise<AdminUserParams> => {
  return request.post('/admin/create', { username, password, role });
};

/**
 * 删除用户
 * @param id 用户ID
 * @param type 操作类型：disable-禁用，enable-恢复
 */
export const deleteAdmin = (id: string, type: string): Promise<AdminUserParams> => {
  return request.put('/admin/delete', { data: { id, type } });
};

/**
 * 重置密码
 * @param id 用户ID
 * @param password 新密码
 */
export const resetAdminPassword = (id: string, password: string): Promise<AdminUserParams> => {
  return request.put('/admin/reset', { id, password });
};
