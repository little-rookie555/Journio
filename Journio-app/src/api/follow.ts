import request from '@/utils/request';

// 关注/取消关注用户
export const followUser = (params: {
  userId: number;
  followUserId: number;
  isFollow: boolean;
}): Promise<{
  code: number;
  message: string;
}> => {
  return request.post('/travel/follow', params);
};

// 获取用户的关注列表
export const getFollowList = (
  userId: number,
): Promise<{
  code: number;
  data: Array<{
    id: number;
    username: string;
    avatar: string;
  }>;
}> => {
  return request.get('/travel/follow/list', { params: { userId } });
};

// 检查是否关注了某用户
export const checkFollowStatus = (params: {
  userId: number;
  followUserId: number;
}): Promise<{
  code: number;
  data: boolean;
}> => {
  return request.get('/travel/follow/check', { params });
};

// 获取用户的收藏游记列表
export const getStarList = (
  userId: number,
): Promise<{
  code: number;
  data: Array<{
    id: number;
    title: string;
    content: string;
    coverImage: string;
    create_time: string;
  }>;
}> => {
  return request.get('/travel/star/list', { params: { userId } });
};

// 获取用户的粉丝列表
export const getFanList = (
  userId: number,
): Promise<{
  code: number;
  data: Array<{
    id: number;
    username: string;
    avatar: string;
  }>;
}> => {
  return request.get('/travel/fan/list', { params: { userId } });
};
