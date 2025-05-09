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

// 评论接口参数类型定义
export interface CommentParams {
  travelId: number;
  content: string;
  userId: number; // 添加用户ID
  parentId?: number; // 可选的父评论ID，用于回复功能
}

// 评论数据类型定义
export interface Comment {
  id: number;
  content: string;
  createTime: string;
  author: {
    id: number;
    nickname: string;
    avatar: string;
  };
}

// 发表评论
export const createComment = (
  params: CommentParams,
): Promise<{ code: number; data: Comment; message?: string }> => {
  return request.post(`/travel/comment`, params);
};

// 获取评论列表
export const getCommentList = (
  travelId: number,
): Promise<{ code: number; data: Comment[]; message?: string }> => {
  return request.get(`/travel/comment/list/${travelId}`);
};

interface LikeParams {
  travelId: number;
  userId: number | undefined;
  liked?: boolean;
}

interface StarParams {
  travelId: number;
  userId: number | undefined;
  starred?: boolean;
}

// 点赞/取消点赞
export const likeTravel = (
  params: LikeParams,
): Promise<ApiResponse<{ liked: boolean; likeCount: number }>> => {
  return request.post('/travel/like', params);
};

// 收藏/取消收藏
export const starTravel = (params: StarParams): Promise<ApiResponse<{ starred: boolean }>> => {
  return request.post('/travel/star', params);
};

// 更新浏览量
export const updateViews = (travelId: number) => {
  return request.post(`/trips/${travelId}/views`);
};
