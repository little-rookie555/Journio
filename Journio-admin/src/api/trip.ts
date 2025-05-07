import request from '@/utils/request';

// 游记详情接口返回类型
export interface TripDetailResponse {
  code: number;
  data: {
    id: string;
    author: string;
    status: number;
    title: string;
    createTime: string;
    content: string;
  };
  message: string;
}

// 获取游记详情
export const getTripDetail = (id: string): Promise<TripDetailResponse> => {
  return request.get(`/audit/detail/${id}`);
};