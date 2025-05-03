import React from 'react';
import { Table } from 'antd';
import type { ColumnsType } from 'antd/es/table';

interface DataType {
  key: string;
  title: string;
  status: string;
  createTime: string;
}

const AuditList: React.FC = () => {
  const columns: ColumnsType<DataType> = [
    {
      title: '游记标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
  ];

  // 模拟数据
  const data: DataType[] = [
    {
      key: '1',
      title: '我的第一次旅行',
      status: '待审核',
      createTime: '2024-03-01',
    },
  ];

  return (
    <div>
      <h2>游记审核列表</h2>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default AuditList;
