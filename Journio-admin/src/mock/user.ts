import Mock from 'mockjs';

export interface User {
  id: number;
  username: string;
  password: string;
  role: 0 | 1; // 0表示审核员，1表示管理员
  token: string;
}

export const mockUsers = Mock.mock({
  'list|2': [
    {
      'id|+1': 1,
      username: 'admin',
      password: 'admin123',
      role: 1, // 管理员
      token: 'admin-token-123',
    },
    {
      'id|+1': 2,
      username: 'auditor',
      password: 'auditor123',
      role: 0, // 审核员
      token: 'auditor-token-456',
    },
  ],
}).list;

Mock.mock('/api/test', 'get', () => {
  return {
    code: 200,
    data: {
      message: 'test',
    },
  };
});

// 登录接口mock
Mock.mock('/api/login', 'post', (options: any) => {
  const { username, password } = JSON.parse(options.body);
  const user = mockUsers.find(
    (item: User) => item.username === username && item.password === password,
  );

  return user
    ? {
        code: 200,
        data: {
          token: user.token,
          role: user.role,
          userInfo: {
            // 新增用户信息返回
            id: user.id,
            username: user.username,
          },
        },
      }
    : { code: 401, message: '用户名或密码错误' };
});
