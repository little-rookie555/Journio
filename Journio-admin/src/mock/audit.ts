import Mock from 'mockjs';

export interface AuditItem {
  key: string;
  title: string;
  author: string;
  status: number;
  createTime: string;
  content: string; // 添加内容字段
}

export const mockAuditList = Mock.mock({
  'list|10-20': [
    {
      'key|+1': 1,
      title: '@ctitle(5,20)',
      author: '@cname',
      'status|1': [0, 1, 2],
      createTime: '@datetime("yyyy-MM-dd HH:mm:ss")',
      content: '@cparagraph(10,50)', // 生成随机内容
    },
  ],
}).list;
