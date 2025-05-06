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

export interface UserLoginParams {
  username: string;
  password: string;
}

export interface UserUpdateParams {
  nickname: string;
  avatar?: string;
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

// 登录接口
Mock.mock('/api/user/login', 'post', (options: any) => {
  const params = JSON.parse(options.body) as UserLoginParams;

  // 模拟登录验证
  if (params.username === 'admin' && params.password === '123456') {
    return {
      code: 200,
      data: {
        id: 1001,
        username: 'admin',
        nickname: '管理员',
        avatar: Mock.Random.image('100x100'),
        createTime: Mock.Random.datetime(),
        token: 'mock-token-' + Mock.Random.string('lower', 32),
      },
    };
  }

  return {
    code: 401,
    message: '用户名或密码错误',
  };
});

// 更新用户信息接口
Mock.mock('/api/user/update', 'put', (options: any) => {
  const params = JSON.parse(options.body) as UserUpdateParams;
  
  return {
    code: 200,
    data: {
      id: 1001,
      username: 'admin',
      nickname: params.nickname,
      avatar: params.avatar || Mock.Random.image('100x100'),
      createTime: Mock.Random.datetime(),
    },
    message: '更新成功',
  };
});
