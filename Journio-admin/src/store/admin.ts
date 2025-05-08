import { create } from 'zustand';
import { AdminUser } from '@/api/admin';
import { getAdminList, createAdmin, deleteAdmin, resetAdminPassword } from '@/api/admin';
import { message } from 'antd';

/**
 * 管理员角色: 3-管理员 2-审核员
 */
export enum AdminRole {
  SuperAdmin = 3,
  Admin = 2
}

/**
 * 管理员状态: 1-正常 0-禁用
 */
export enum AdminStatus {
  Active = 1,
  Inactive = 0
}

export const getAdminRoleText = (role: number) => {
  switch (role) {
    case AdminRole.SuperAdmin:
      return '管理员';
    case AdminRole.Admin:
      return '审核员';
    default:
      return '未知';
  }
};

export const getAdminStatusText = (status: number) => {
  switch (status) {
    case AdminStatus.Active:
      return '正常';
    case AdminStatus.Inactive:
      return '禁用';
    default:
      return '未知';
  }
};

export interface AdminStore {
  adminList: AdminUser[];
  loading: boolean;
  total: number;
  fetchAdminList: (page?: number, pageSize?: number, search?: string) => Promise<void>;
  createNewAdmin: (username: string, password: string, role: string) => Promise<void>;
  removeAdmin: (id: string) => Promise<void>;
  resetPassword: (id: string, password: string) => Promise<void>;
}

export const useAdminStore = create<AdminStore>((set) => ({
  adminList: [],
  loading: false,
  total: 0,

  fetchAdminList: async (page = 1, pageSize = 10, search = '') => {
    set({ loading: true });
    try {
      const response = await getAdminList(page, pageSize, search);
      console.log('response', response);
      set({ adminList: response.data, total: response.total || 0 });
    } catch (error) {
      console.error('获取管理员列表失败:', error);
      message.error('获取管理员列表失败');
    } finally {
      set({ loading: false });
    }
  },

  createNewAdmin: async (username: string, password: string, role: string) => {
    try {
      await createAdmin(username, password, role);
      message.success('创建管理员成功');
      // 刷新列表
      const store = useAdminStore.getState();
      store.fetchAdminList();
    } catch (error) {
      console.error('创建管理员失败:', error);
      message.error('创建管理员失败');
    }
  },

  removeAdmin: async (id: string) => {
    try {
      await deleteAdmin(id);
      message.success('删除用户成功');
      // 刷新列表
      const store = useAdminStore.getState();
      store.fetchAdminList();
    } catch (error) {
      console.error('删除用户失败:', error);
      message.error('删除用户失败');
    }
  },

  resetPassword: async (id: string, password: string) => {
    try {
      await resetAdminPassword(id, password);
      message.success('重置密码成功');
    } catch (error) {
      console.error('重置密码失败:', error);
      message.error('重置密码失败');
    }
  },
}));