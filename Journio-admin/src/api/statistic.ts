import request from '@/utils/request';

export interface ApiResponse<T> {
  code: number;
  data: T;
  message?: string;
}

export interface DailyStats {
  date: string;
  user: number;
  trip: number;
}

export type DailyStatsResponse = ApiResponse<DailyStats[]>;
export type NumberResponse = ApiResponse<number>;

/**
 * 获取用户数量
 * @returns 用户数量number
 */
export const getUser = (): Promise<NumberResponse> => {
  return request.get('/statistic/user');
};

/**
 * 获取游记数量
 * @returns 游记数量number
 */
export const getTravel = (): Promise<NumberResponse> => {
  return request.get(`/statistic/trip`);
};

/**
 * 获取待审核游记数量
 * @returns 游记数量number
 */
export const getPendingTravel = (): Promise<NumberResponse> => {
  return request.get(`/statistic/pending`);
};

/**
 * 获取前一周的新增用户数、新增游记数
 * @returns 游记数量number
 */
export const getList = (): Promise<DailyStatsResponse> => {
  return request.get('/statistic/last-week');
};
