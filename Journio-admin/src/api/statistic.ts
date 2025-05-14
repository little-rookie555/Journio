import request from '@/utils/request';

export interface TripStore {
  code: number;
  data: any;
  message?: string;
}

export interface ListResponse {
  code: number;
  data: {
    list: any[];
    total: number;
  };
  message?: string;
}

/**
 * 获取总用户数
 */
export const getUser = (): Promise<TripStore> => {
  return request.get('/statistic/user');
};

/**
 * 获取总游记数
 */
export const getTravel = (): Promise<TripStore> => {
  return request.get('/statistic/trip');
};

/**
 * 获取待审核游记数
 */
export const getPendingTravel = (): Promise<TripStore> => {
  return request.get('/statistic/pending');
};

/**
 * 获取每日统计数据
 */
export const getList = (
  page: number = 1,
  pageSize: number = 30,
  startDate?: string,
  endDate?: string,
): Promise<ListResponse> => {
  return request.get('/statistic/last-week', {
    params: {
      page,
      pageSize,
      startDate,
      endDate,
    },
  });
};

/**
 * 获取总点赞数
 */
export const getLike = (): Promise<TripStore> => {
  return request.get('/statistic/like');
};

/**
 * 获取总收藏数
 */
export const getStar = (): Promise<TripStore> => {
  return request.get('/statistic/star');
};

/**
 * 获取高质量游记比例
 */
export const getQualityRate = (): Promise<TripStore> => {
  return request.get('/statistic/quality');
};
