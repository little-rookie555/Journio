import { create } from 'zustand';
import { getAuditList, approveAudit as apiApproveAudit, rejectAudit as apiRejectAudit, deleteAudit as apiDeleteAudit } from '@/api/audit';
import { message } from 'antd';

/**
 * 游记审核状态枚举
 * @enum {number}
 */
export enum AuditStatus {
  /** 待审核 */
  Pending = 0,
  /** 已通过 */
  Approved = 1,
  /** 已拒绝 */
  Rejected = 2,
}

/**
 * 获取审核状态文本
 */
export const getAuditStatusText = (status: AuditStatus): string => {
  switch (status) {
    case AuditStatus.Pending:
      return '待审核';
    case AuditStatus.Approved:
      return '已通过';
    case AuditStatus.Rejected:
      return '已拒绝';
    default:
      return '未知状态';
  }
};

export interface AuditItem {
  key: string;
  title: string;
  author: string;
  status: AuditStatus;
  createTime: string;
  content: string;
}

interface AuditStore {
  auditList: AuditItem[];
  loading: boolean;
  fetchAuditList: () => Promise<void>; // 获取列表方法
  approveAudit: (key: string) => Promise<void>;
  rejectAudit: (key: string, reson: string) => Promise<void>;
  deleteAudit: (key: string) => Promise<void>;
}

export const useAuditStore = create<AuditStore>((set, get) => ({
  auditList: [],
  loading: false,
  fetchAuditList: async () => {
    set({ loading: true });
    try {
      const res = await getAuditList();
      if (res.code === 200) {
        set({ auditList: res.data });
      } else {
        message.error(res.message || '获取游记列表失败');
      }
    } catch (error) {
      console.error('获取游记列表失败:', error);
      message.error('获取游记列表失败');
    } finally {
      set({ loading: false });
    }
  },
  approveAudit: async (key) => {
    try {
      const res = await apiApproveAudit(key);
      if (res.code === 200) {
        // 审批成功后重新获取列表数据
        const { fetchAuditList } = get();
        await fetchAuditList();
        return Promise.resolve();
      } else {
        message.error(res.message || '审批失败');
        return Promise.reject();
      }
    } catch (error) {
      console.error('审批失败:', error);
      message.error('审批失败');
      return Promise.reject(error);
    }
  },
  rejectAudit: async (key: string, reason: string) => {
    try {
      const res = await apiRejectAudit(key, reason);
      if (res.code === 200) {
        // 拒绝成功后重新获取列表数据
        const { fetchAuditList } = get();
        await fetchAuditList();
        return Promise.resolve();
      } else {
        message.error(res.message || '拒绝失败');
        return Promise.reject();
      }
    } catch (error) {
      console.error('拒绝失败:', error);
      message.error('拒绝失败');
      return Promise.reject(error);
    }
  },
  deleteAudit: async (key) => {
    try {
      const res = await apiDeleteAudit(key);
      if (res.code === 200) {
        // 删除成功后重新获取列表数据
        const { fetchAuditList } = get();
        await fetchAuditList();
        return Promise.resolve();
      } else {
        message.error(res.message || '删除失败');
        return Promise.reject();
      }
    } catch (error) {
      console.error('删除失败:', error);
      message.error('删除失败');
      return Promise.reject(error);
    }
  },
}));
