import request from '@/utils/request';
import { AuditItem } from '@/store/audit';

export interface TripStore {
  code: number;
  data: AuditItem[];
  message?: string;
}

export interface TripDetail {
  code: number;
  data: AuditItem;
  message?: string;
}

export interface TripParams {
  code: number;
  message?: string;
}

/**
 * 获取游记审核列表
 */
// 修改getAuditList的返回类型
export const getAuditList = (): Promise<TripStore> => {
  return request.get('/audit/list');
};

/**
 * 获取游记详情
 * @param id 游记ID
 */
export const getAuditDetail = (id: string): Promise<TripDetail> => {
  return request.get(`/audit/detail/${id}`);
};

/**
 * 审核通过游记
 * @param id 游记ID
 */
export const approveAudit = (id: string): Promise<TripParams> => {
  return request.put('/audit/pass', { id });
};

/**
 * 拒绝游记
 * @param id 游记ID
 */
export const rejectAudit = (id: string, reason: string): Promise<TripParams> => {
  return request.put('/audit/reject', { id, reason });
};

/**
 * 删除游记
 * @param id 游记ID
 */
export const deleteAudit = (id: string): Promise<TripParams> => {
  return request.put(`/audit/delete/${id}`);
};