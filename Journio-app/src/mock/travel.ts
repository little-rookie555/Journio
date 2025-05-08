import Mock from 'mockjs';
import { Comment, CommentParams } from '@/api/travel';

export interface TravelItem {
  id: number;
  title: string;
  coverImage: string;
  images: string[];
  video?: string; // 添加可选的视频字段
  author: {
    id: number;
    nickname: string;
    avatar: string;
  };
  status: number; // 0: 待审核, 1: 已通过, 2: 已拒绝
  createTime: string;
  content: string;
  likeCount: number; // 添加点赞数字段
  travelDate: string; // 添加出发日期
  duration: number; // 添加旅行天数
  cost: number; // 添加人均消费
}

export const mockTravelList = Mock.mock({
  'list|10-30': [
    // 生成更多数据
    {
      'id|+1': 100, // ID从1000开始，避免和之前的ID重复
      title: '@ctitle(5,30)',
      coverImage: '@image("200x200")',
      'images|1-5': ['@image("200x200")'],
      author: {
        'id|+1': 1,
        nickname: '@cname',
        avatar: '@image("100x100")',
      },
      status: 1,
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
      content: '@cparagraph(10,20)',
      'likeCount|0-100': 0, // 添加随机点赞数
      travelDate: '@date("yyyy-MM-dd")',
      'duration|1-30': 1,
      'cost|100-10000': 1000,
    },
  ],
}).list;

console.log('mockTravelList', mockTravelList);

// 游记列表接口
function getQueryObject(url: string) {
  const search = url.split('?')[1];
  if (!search) return {};
  return Object.fromEntries(new URLSearchParams(search));
}

Mock.mock(/\/api\/travel\/list.*/, 'get', (options) => {
  // console.log('mock travel list 接口被调用');

  // 解析 query 参数（page、pageSize、keyword）
  const query = getQueryObject(options.url);
  const page = Number(query.page) || 1;
  const pageSize = Number(query.pageSize) || 10;
  const keyword = query.keyword || '';

  // 先筛选出匹配关键字的
  const filteredList = mockTravelList.filter(
    (item: any) => item.title.includes(keyword) || item.content.includes(keyword),
  );

  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const pageList = filteredList.slice(start, end);

  return {
    code: 200,
    data: {
      list: pageList,
      total: filteredList.length,
    },
  };
});

export interface TravelPublishParams {
  title: string;
  content: string;
  coverImage: string;
  images: string[];
  video?: string; // 添加可选的视频字段
  authorId: number;
  authorNickname: string;
  authorAvatar: string;
  travelDate: string; // 添加出发日期
  duration: number; // 添加旅行天数
  cost: number; // 添加人均消费
}

// 发布游记接口
Mock.mock('/api/travel/publish', 'post', (options: any) => {
  const params = JSON.parse(options.body) as TravelPublishParams;

  const travel: TravelItem = {
    id: Mock.Random.integer(1000, 9999),
    title: params.title,
    content: params.content,
    coverImage: params.coverImage,
    images: params.images,
    video: params.video, // 添加视频URL
    author: {
      id: params.authorId || 1001,
      nickname: params.authorNickname || '管理员',
      avatar: params.authorAvatar || Mock.Random.image('100x100'),
    },
    status: 0,
    createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    likeCount: 0,
    travelDate: params.travelDate,
    duration: params.duration,
    cost: params.cost,
  };

  mockTravelList.unshift(travel);

  return {
    code: 200,
    data: travel,
  };
});

// 更新游记接口
Mock.mock(/\/api\/travel\/update\/\d+/, 'put', (options: any) => {
  const id = Number(options.url.split('/').pop());
  const params = JSON.parse(options.body) as TravelPublishParams;

  const index = mockTravelList.findIndex((item: any) => item.id === id);

  if (index === -1) {
    return {
      code: 404,
      message: '游记不存在',
    };
  }

  // 更新游记内容
  mockTravelList[index] = {
    ...mockTravelList[index],
    title: params.title,
    content: params.content,
    coverImage: params.coverImage,
    images: params.images,
    video: params.video, // 添加视频URL更新
    travelDate: params.travelDate,
    duration: params.duration,
    cost: params.cost,
  };

  return {
    code: 200,
    data: mockTravelList[index],
  };
});

// 游记详情接口
Mock.mock(/\/api\/travel\/detail\/\d+/, 'get', (options) => {
  const id = Number(options.url.split('/').pop());
  const travel = mockTravelList.find((item: any) => item.id === id);

  if (!travel) {
    return {
      code: 404,
      message: '游记不存在',
    };
  }

  return {
    code: 200,
    data: travel,
  };
});

// 获取用户游记列表
Mock.mock(/\/api\/travel\/user\/\d+/, 'get', (options) => {
  const userId = Number(options.url.split('/').pop());
  const userTravels = mockTravelList.filter((item: any) => item.author.id === userId);

  return {
    code: 200,
    data: userTravels,
  };
});

// 删除游记
Mock.mock(/\/api\/travel\/\d+/, 'delete', (options) => {
  const id = Number(options.url.split('/').pop());
  const index = mockTravelList.findIndex((item: any) => item.id === id);

  if (index !== -1) {
    mockTravelList.splice(index, 1);
  }

  return {
    code: 200,
  };
});

// Mock评论数据
const mockComments: Record<number, Comment[]> = {};

// 初始化一些模拟评论数据
const generateMockComments = (travelId: number) => {
  const comments: Comment[] = Mock.mock({
    'array|5-15': [
      {
        'id|+1': Mock.Random.integer(1000, 9999),
        content: '@cparagraph(1, 3)',
        createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
        author: {
          'id|+1': 1,
          nickname: '@cname',
          avatar: '@image("100x100")',
        },
      },
    ],
  }).array;

  mockComments[travelId] = comments;
  return comments;
};

// 获取评论列表接口
Mock.mock(/\/api\/travel\/comment\/list\/\d+/, 'get', (options) => {
  const travelId = Number(options.url.split('/').pop());

  // 如果这个游记还没有评论，生成一些模拟评论
  if (!mockComments[travelId]) {
    generateMockComments(travelId);
  }

  return {
    code: 200,
    data: mockComments[travelId] || [],
  };
});

// 发表评论接口
Mock.mock('/api/travel/comment', 'post', (options: any) => {
  const params = JSON.parse(options.body) as CommentParams;

  const comment: Comment = {
    id: Mock.Random.integer(1000, 9999),
    content: params.content,
    createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
    author: {
      id: 1001, // 这里应该使用当前登录用户的ID
      nickname: '测试用户',
      avatar: Mock.Random.image('100x100'),
    },
  };

  if (!mockComments[params.travelId]) {
    mockComments[params.travelId] = [];
  }
  mockComments[params.travelId].unshift(comment);

  return {
    code: 200,
    data: comment,
  };
});

// 用户点赞和收藏状态
const userActions: Record<number, Record<number, { liked: boolean; starred: boolean }>> = {};
const travelLikes: Record<number, number> = {};

// 初始化点赞数
mockTravelList.forEach((travel: TravelItem) => {
  travelLikes[travel.id] = travel.likeCount;
});

// 点赞接口
Mock.mock('/api/travel/like', 'post', (options: any) => {
  const { travelId, userId, liked } = JSON.parse(options.body);

  if (!userActions[travelId]) {
    userActions[travelId] = {};
  }
  if (!userActions[travelId][userId]) {
    userActions[travelId][userId] = { liked: false, starred: false };
  }

  if (!travelLikes[travelId]) {
    const travel = mockTravelList.find((t: TravelItem) => t.id === travelId);
    travelLikes[travelId] = travel ? travel.likeCount : 0;
  }

  // 如果是获取状态的请求，直接返回当前状态
  if (liked === undefined) {
    return {
      code: 200,
      data: {
        liked: userActions[travelId][userId].liked,
        likeCount: travelLikes[travelId],
      },
    };
  }

  const oldLiked = userActions[travelId][userId].liked;
  userActions[travelId][userId].liked = liked;
  travelLikes[travelId] += liked ? (oldLiked ? 0 : 1) : oldLiked ? -1 : 0;

  const travelIndex = mockTravelList.findIndex((t: TravelItem) => t.id === travelId);
  if (travelIndex !== -1) {
    mockTravelList[travelIndex].likeCount = travelLikes[travelId];
  }

  return {
    code: 200,
    data: {
      liked,
      likeCount: travelLikes[travelId],
    },
  };
});

// 收藏接口
Mock.mock('/api/travel/star', 'post', (options: any) => {
  const { travelId, userId, starred } = JSON.parse(options.body);

  if (!userActions[travelId]) {
    userActions[travelId] = {};
  }
  if (!userActions[travelId][userId]) {
    userActions[travelId][userId] = { liked: false, starred: false };
  }

  // 如果是获取状态的请求，直接返回当前状态
  if (starred === undefined) {
    return {
      code: 200,
      data: {
        starred: userActions[travelId][userId].starred,
      },
    };
  }

  userActions[travelId][userId].starred = starred;

  return {
    code: 200,
    data: {
      starred,
    },
  };
});
