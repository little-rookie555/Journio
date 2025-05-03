import { AuditStatus, getAuditStatusText, useAuditStore } from '@/store/audit';
import { Button, Modal, Popconfirm, Space, Table, Tag, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React from 'react';

interface DataType {
  key: string;
  title: string;
  author: string;
  status: AuditStatus;
  createTime: string;
  content: string; // 添加内容字段
}

const AuditList: React.FC = () => {
  const { auditList, approveAudit, rejectAudit, deleteAudit } = useAuditStore();

  const handleView = (record: DataType) => {
    Modal.info({
      title: '游记详情',
      width: 600,
      content: (
        <div>
          <p>标题：{record.title}</p>
          <p>作者：{record.author}</p>
          <p>状态：{getAuditStatusText(record.status)}</p>
          <p>创建时间：{record.createTime}</p>
          <p>内容：</p>
          <div
            style={{
              maxHeight: '300px',
              overflowY: 'auto',
              padding: '8px',
              border: '1px solid #d9d9d9',
              borderRadius: '4px',
            }}
          >
            {record.content}
          </div>
          {record.status === AuditStatus.Pending && (
            <Space style={{ marginTop: 16 }}>
              <Popconfirm
                title="审批确认"
                description={`确定要通过"${record.title}"吗？`}
                onConfirm={() => {
                  Modal.destroyAll();
                  approveAudit(record.key);
                  message.success('审批通过成功');
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button type="primary">通过</Button>
              </Popconfirm>
              <Popconfirm
                title="拒绝确认"
                description={`确定要拒绝"${record.title}"吗？`}
                onConfirm={() => {
                  Modal.destroyAll();
                  rejectAudit(record.key);
                  message.error('已拒绝该游记');
                }}
                okText="确定"
                cancelText="取消"
              >
                <Button danger>拒绝</Button>
              </Popconfirm>
            </Space>
          )}
        </div>
      ),
      okText: '关闭',
    });
  };

  const columns: ColumnsType<DataType> = [
    {
      title: '游记标题',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: '作者',
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      ellipsis: true,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: AuditStatus) => {
        let color = 'default';
        switch (status) {
          case AuditStatus.Pending:
            color = 'processing';
            break;
          case AuditStatus.Approved:
            color = 'success';
            break;
          case AuditStatus.Rejected:
            color = 'error';
            break;
        }
        return <Tag color={color}>{getAuditStatusText(status)}</Tag>;
      },
    },
    {
      title: '操作',
      align: 'center', //加这一行，居中显示
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => handleView(record)}>
            查看
          </Button>
          <Popconfirm
            title="确认删除"
            description={`确定要删除"${record.title}"吗？`}
            onConfirm={() => {
              deleteAudit(record.key);
              message.success('删除成功');
            }}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>游记审核列表</h2>
      <Table columns={columns} dataSource={auditList} />
    </div>
  );
};

export default AuditList;
