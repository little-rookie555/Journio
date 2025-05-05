import { TravelItem, TravelPublishParams } from '@/mock/travel';
import request from '@/utils/request';

// 统一的接口返回类型
interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

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
): Promise<ApiResponse<TravelListResponse>> => {
  const { page, pageSize, keyword = '' } = params;
  return request.get(`/travel/list?page=${page}&pageSize=${pageSize}&keyword=${keyword}`);
};

// 发布游记
export const publishTravel = (params: TravelPublishParams): Promise<ApiResponse<TravelItem>> => {
  return request.post('/travel/publish', params);
};

// 更新游记
export const updateTravel = (
  id: number,
  params: TravelPublishParams,
): Promise<ApiResponse<TravelItem>> => {
  return request.put(`/travel/update/${id}`, params);
};

// 获取游记详情
export const getTravelDetail = (id: number): Promise<ApiResponse<TravelItem>> => {
  return request.get(`/travel/detail/${id}`);
};

// 获取用户游记列表
export const getUserTravels = (userId: number): Promise<ApiResponse<TravelItem[]>> => {
  return request.get(`/travel/user/${userId}`);
};

// 删除游记
export const deleteTravel = (id: number): Promise<ApiResponse<null>> => {
  return request.delete(`/travel/${id}`);
};
