import { AuditItem, AuditStatus, getAuditStatusText, useAuditStore } from '@/store/audit';
import { Button, Modal, Popconfirm, Space, Table, Tag, message, Spin, Input, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState, useRef } from 'react';
import { getAuditDetail } from '@/api/audit';
import './index.css';

const PendingAudit: React.FC = () => {
  const { auditList, loading, fetchAuditListByStatus, approveAudit, rejectAudit } = useAuditStore();
  const [detailLoading, setDetailLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0, // 添加total状态
  });
  const rejectReasonRef = useRef('');

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetchAuditListByStatus(
        AuditStatus.Pending,
        pagination.current,
        pagination.pageSize,
      );
      if (response?.total) {
        setPagination((prev) => ({ ...prev, total: response.total }));
      }
    };
    fetchData();
  }, [fetchAuditListByStatus, pagination.current, pagination.pageSize]);

  const handleView = async (record: AuditItem) => {
    setDetailLoading(true);
    try {
      const res = await getAuditDetail(record.key);
      const detailData = res.data || res;
      console.log('detailData:', detailData);

      Modal.info({
        title: '游记详情',
        width: 600,
        content: (
          <div>
            <p>标题：{detailData.title}</p>
            <p>作者：{detailData.author}</p>
            <p>状态：待审核</p>
            <p>创建时间：{detailData.createTime}</p>
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
                    dots={true}
                    arrows={true}
                    prevArrow={
                      <div className="custom-arrow-prev">
                        <LeftOutlined />
                      </div>
                    }
                    nextArrow={
                      <div className="custom-arrow-next">
                        <RightOutlined />
                      </div>
                    }
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
            <Space style={{ marginTop: 16 }}>
              <Popconfirm
                title="审批确认"
                description={`确定要通过"${detailData.title}"吗？`}
                onConfirm={async () => {
                  try {
                    await approveAudit(detailData.key);
                    Modal.destroyAll();
                    message.success('审批通过成功');
                    fetchAuditListByStatus(
                      AuditStatus.Pending,
                      pagination.current,
                      pagination.pageSize,
                    );
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
                    fetchAuditListByStatus(
                      AuditStatus.Pending,
                      pagination.current,
                      pagination.pageSize,
                    );
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
      render: () => <Tag color="warning">{getAuditStatusText(AuditStatus.Pending)}</Tag>,
    },
    {
      title: '操作',
      align: 'center',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => handleView(record)}>
            查看
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>待审核游记列表</h2>
      <Spin spinning={loading || detailLoading}>
        <Table
          columns={columns}
          dataSource={auditList.filter((item) => item.status === AuditStatus.Pending)}
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

export default PendingAudit;
