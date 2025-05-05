import { TravelItem, TravelPublishParams } from '@/mock/travel';
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

// 发布游记
export const publishTravel = (
  params: TravelPublishParams,
): Promise<{ code: number; data: TravelItem }> => {
  console.log(params);
  return request.post('/travel/publish', params);
};

// 获取游记详情
export const getTravelDetail = (id: number): Promise<{ code: number; data: TravelItem }> => {
  return request.get(`/travel/detail/${id}`);
};

// 获取用户游记列表
export const getUserTravels = (userId: number): Promise<{ code: number; data: TravelItem[] }> => {
  return request.get(`/travel/user/${userId}`);
};

// 删除游记
export const deleteTravel = (id: number): Promise<{ code: number }> => {
  return request.delete(`/travel/${id}`);
};
