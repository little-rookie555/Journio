import { TravelItem } from '@/mock/travel';
import request from '@/utils/request';

interface TravelListParams {
  page: number;
  pageSize: number;
  keyword?: string;
}

interface TravelListResponse {
  list: TravelItem[];
  total: number;
}

// 获取游记列表
export const getTravelList = (
  params: TravelListParams,
): Promise<{ code: number; data: TravelListResponse }> => {
  const { page, pageSize, keyword = '' } = params;
  return request.get(`/travel/list?page=${page}&pageSize=${pageSize}&keyword=${keyword}`);
};
