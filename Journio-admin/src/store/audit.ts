import { mockAuditList } from '@/mock/audit';
import { create } from 'zustand';

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

interface AuditItem {
  key: string;
  title: string;
  author: string;
  status: AuditStatus;
  createTime: string;
  content: string; // 添加内容字段
}

interface AuditStore {
  auditList: AuditItem[];
  approveAudit: (key: string) => void;
  rejectAudit: (key: string) => void;
  deleteAudit: (key: string) => void;
}

export const useAuditStore = create<AuditStore>((set) => ({
  auditList: mockAuditList,
  approveAudit: (key) =>
    set((state) => ({
      auditList: state.auditList.map((item) =>
        item.key === key ? { ...item, status: AuditStatus.Approved } : item,
      ),
    })),
  rejectAudit: (key) =>
    set((state) => ({
      auditList: state.auditList.map((item) =>
        item.key === key ? { ...item, status: AuditStatus.Rejected } : item,
      ),
    })),
  deleteAudit: (key) =>
    set((state) => ({
      auditList: state.auditList.filter((item) => item.key !== key),
    })),
}));
