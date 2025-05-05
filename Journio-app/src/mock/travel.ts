import Mock from 'mockjs';

export interface TravelItem {
  id: number;
  title: string;
  coverImage: string;
  images: string[];
  author: {
    id: number;
    nickname: string;
    avatar: string;
  };
  status: number; // 0: 待审核, 1: 已通过, 2: 已拒绝
  createTime: string;
  content: string;
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
    },
  ],
}).list;

// console.log('mockTravelList', mockTravelList);

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
  authorId: number;
  authorNickname: string;
  authorAvatar: string;
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
    author: {
      id: params.authorId || 1001,
      nickname: params.authorNickname || '管理员',
      avatar: params.authorAvatar || Mock.Random.image('100x100'),
    },
    status: 0,
    createTime: Mock.Random.datetime('yyyy-MM-dd HH:mm:ss'),
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
