import { AuditItem, AuditStatus, getAuditStatusText, useAuditStore } from '@/store/audit';
import { Button, Modal, Popconfirm, Space, Table, Tag, message, Spin, Input } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState, useRef } from 'react';
import { getAuditDetail } from '@/api/audit';

const AuditList: React.FC = () => {
  const { auditList, loading, fetchAuditList, approveAudit, rejectAudit, deleteAudit } = useAuditStore();
  const role = localStorage.getItem('role');
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const rejectReasonRef = useRef(''); // 添加这行声明
  
  useEffect(() => {
    fetchAuditList();
  }, [fetchAuditList]);

  const handleView = async (record: AuditItem) => {
    setDetailLoading(true);
    setRejectReason(''); // 新增这行，每次打开详情时重置拒绝原因
    try {
      // 获取详细信息
      const res = await getAuditDetail(record.key);
      const detailData = res.data || res;
      
      Modal.info({
        title: '游记详情',
        width: 600,
        content: (
          <div>
            <p>标题：{detailData.title}</p>
            <p>作者：{detailData.author}</p>
            <p>状态：{getAuditStatusText(detailData.status)}</p>
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
            {detailData.status === AuditStatus.Pending && (
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
                      setRejectReason(''); // 清空拒绝原因
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
    // {
    //   title: '创建时间',
    //   dataIndex: 'createTime',
    //   key: 'createTime',
    // },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
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
          {/* 只有管理员(role=3)才能看到删除按钮 */}
          {role === '3' && (
            <Popconfirm
              title="确认删除"
              description={`确定要删除"${record.title}"吗？`}
              onConfirm={async () => {
                try {
                  await deleteAudit(record.key);
                  message.success('删除成功');
                  // 删除成功后刷新列表
                  fetchAuditList();
                } catch (error) {
                  console.error('删除失败:', error);
                }
              }}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger>
                删除
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>游记审核列表</h2>
      <Spin spinning={loading || detailLoading}>
        <Table columns={columns} dataSource={auditList} />
      </Spin>
    </div>
  );
};

export default AuditList;
