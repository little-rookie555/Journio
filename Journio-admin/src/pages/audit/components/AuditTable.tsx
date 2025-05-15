import { AuditItem, AuditStatus, getAuditStatusText, useAuditStore } from '@/store/audit';
import { Button, Modal, Popconfirm, Space, Table, Tag, message, Spin, Input, Carousel } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState, useRef } from 'react';
import { getAuditDetail } from '@/api/audit';
import '../index.css';

interface AuditTableProps {
  status: AuditStatus;
  showActions?: boolean;
}

const AuditTable: React.FC<AuditTableProps> = ({ status, showActions = false }) => {
  const { auditList, loading, fetchAuditListByStatus, approveAudit, rejectAudit } = useAuditStore();
  const [detailLoading, setDetailLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const rejectReasonRef = useRef('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchAuditListByStatus(
        status,
        pagination.current,
        pagination.pageSize,
      );
      if (response?.total) {
        setPagination((prev) => ({ ...prev, total: response.total }));
      }
    };
    fetchData();
  }, [fetchAuditListByStatus, pagination.current, pagination.pageSize, status]);

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
            <p>状态：{getAuditStatusText(status)}</p>
            <p>创建时间：{detailData.createTime}</p>
            {status === AuditStatus.Rejected && <p>拒绝原因：{detailData.rejectReason || '无'}</p>}
            {detailData.images && detailData.images.length > 0 && (
              <div>
                <p>图片：</p>
                <div
                  style={{
                    position: 'relative',
                    margin: '0 auto',
                    width: '100%',
                    maxWidth: '400px',
                  }}
                >
                  <Carousel
                    dots={false}
                    arrows={true}
                    style={{ width: '100%' }}
                    className="audit-carousel"
                  >
                    {detailData.images.map((image, index) => (
                      <div key={index}>
                        <div
                          style={{
                            height: '250px',
                            overflow: 'hidden',
                            border: '1px solid #d9d9d9',
                            borderRadius: '4px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background: '#f5f5f5',
                            padding: '8px',
                          }}
                        >
                          <img
                            src={typeof image === 'string' ? image.replace(/["`]/g, '') : ''}
                            alt={`游记图片${index + 1}`}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                        <div style={{ textAlign: 'center', marginTop: '8px' }}>
                          图片 {index + 1} / {detailData.images.length}
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </div>
              </div>
            )}
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
            {showActions && status === AuditStatus.Pending && (
              <Space style={{ marginTop: 16 }}>
                <Popconfirm
                  title="审批确认"
                  description={`确定要通过"${detailData.title}"吗？`}
                  onConfirm={async () => {
                    try {
                      await approveAudit(detailData.key);
                      Modal.destroyAll();
                      message.success('审批通过成功');
                    } catch (error) {
                      console.error('审批失败:', error);
                    }
                  }}
                  okText="确定"
                  cancelText="取消"
                >
                  <Button type="primary">通过</Button>
                </Popconfirm>
                <Popconfirm
                  title="拒绝确认"
                  description={
                    <div>
                      <p>{`确定要拒绝"${detailData.title}"吗？`}</p>
                      <Input.TextArea
                        placeholder="请输入拒绝原因"
                        onChange={(e) => {
                          rejectReasonRef.current = e.target.value;
                        }}
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  }
                  onConfirm={async () => {
                    try {
                      await rejectAudit(detailData.key, rejectReasonRef.current);
                      Modal.destroyAll();
                      message.error('已拒绝该游记');
                    } catch (error) {
                      console.error('拒绝失败:', error);
                    }
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
    } catch (error) {
      console.error('获取游记详情失败:', error);
      message.error('获取游记详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case AuditStatus.Pending:
        return 'warning';
      case AuditStatus.Approved:
        return 'success';
      case AuditStatus.Rejected:
        return 'error';
      default:
        return 'default';
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
      width: status === AuditStatus.Rejected ? 250 : 400,
      ellipsis: true,
      align: 'center',
    },
    ...(status === AuditStatus.Rejected
      ? [
          {
            title: '拒绝原因',
            dataIndex: 'rejectReason',
            key: 'rejectReason',
            width: 100,
            ellipsis: true,
          },
        ]
      : []),
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: () => <Tag color={getStatusColor()}>{getAuditStatusText(status)}</Tag>,
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
      <h2>
        {status === AuditStatus.Pending && '待审核游记列表'}
        {status === AuditStatus.Approved && '已通过游记列表'}
        {status === AuditStatus.Rejected && '已拒绝游记列表'}
      </h2>
      <Spin spinning={loading || detailLoading}>
        <Table
          columns={columns}
          dataSource={auditList.filter((item) => item.status === status)}
          pagination={{
            ...pagination,
            showSizeChanger: true,
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

export default AuditTable;
