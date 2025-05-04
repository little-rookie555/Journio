import Mock from 'mockjs';

export interface UserRegisterParams {
  username: string;
  password: string;
  nickname: string;
  avatar?: string;
}

export interface UserInfo {
  id: number;
  username: string;
  nickname: string;
  avatar: string;
  createTime: string;
}

// 注册接口
Mock.mock('/api/user/register', 'post', (options: any) => {
  const params = JSON.parse(options.body) as UserRegisterParams;
  console.log('params', params);
  // 模拟用户名重复检查
  if (params.username === 'admin') {
    return {
      code: 400,
      message: '用户名已存在',
    };
  }

  return {
    code: 200,
    data: {
      id: Mock.Random.integer(1000, 9999),
      username: params.username,
      nickname: params.nickname,
      avatar: params.avatar || Mock.Random.image('100x100'),
      createTime: Mock.Random.datetime(),
    },
  };
});
