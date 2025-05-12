import { AuditItem, AuditStatus, getAuditStatusText, useAuditStore } from '@/store/audit';
import { Button, Modal, Table, Tag, message, Spin } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';
import { getAuditDetail } from '@/api/audit';

const ApprovedAudit: React.FC = () => {
  const { auditList, loading, fetchAuditListByStatus } = useAuditStore();
  const [detailLoading, setDetailLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0, // 添加total状态
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchAuditListByStatus(
        AuditStatus.Approved,
        pagination.current,
        pagination.pageSize,
      );
      if (response?.total) {
        setPagination((prev) => ({ ...prev, total: response.total }));
      }
    };
    fetchData();
  }, [fetchAuditListByStatus, pagination.current, pagination.pageSize, setPagination]);

  const handleView = async (record: AuditItem) => {
    setDetailLoading(true);
    try {
      const res = await getAuditDetail(record.key);
      const detailData = res.data || res;

      Modal.info({
        title: '游记详情',
        width: 600,
        content: (
          <div>
            <p>标题：{detailData.title}</p>
            <p>作者：{detailData.author}</p>
            <p>状态：已通过</p>
            <p>创建时间：{detailData.createTime}</p>
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
              {detailData.content}
            </div>
          </div>
        ),
        okText: '关闭',
      });
    } catch (error) {
      console.error('获取游记详情失败:', error);
      message.error('获取游记详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const columns: ColumnsType<AuditItem> = [
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
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      width: 400,
      ellipsis: true,
      align: 'center',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color="success">{getAuditStatusText(AuditStatus.Approved)}</Tag>,
    },
    {
      title: '操作',
      align: 'center',
      key: 'action',
      render: (_, record) => (
        <Button type="link" onClick={() => handleView(record)}>
          查看
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h2>已通过游记列表</h2>
      <Spin spinning={loading || detailLoading}>
        <Table
          columns={columns}
          dataSource={auditList.filter((item) => item.status === AuditStatus.Approved)}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ current: page, pageSize, total: pagination.total });
            },
          }}
        />
      </Spin>
    </div>
  );
};

export default ApprovedAudit;
