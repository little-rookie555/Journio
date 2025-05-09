import {
  AdminRole,
  AdminStatus,
  getAdminRoleText,
  getAdminStatusText,
  useAdminStore,
} from '@/store/admin';
import { AdminUser } from '@/api/admin';
import { Button, Modal, Popconfirm, Space, Table, Tag, Spin, Input, Form, Select } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import React, { useEffect, useState } from 'react';

const AdminList: React.FC = () => {
  const { adminList, loading, fetchAdminList, createNewAdmin, removeAdmin, resetPassword } =
    useAdminStore();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [resetPasswordForm] = Form.useForm();
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    fetchAdminList(pagination.current, pagination.pageSize, searchText);
  }, [fetchAdminList, pagination.current, pagination.pageSize, searchText]);

  const handleCreate = async (values: any) => {
    await createNewAdmin(values.username, values.password, values.role);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleResetPassword = async (values: any) => {
    await resetPassword(selectedUserId, values.password);
    setResetModalVisible(false);
    resetPasswordForm.resetFields();
  };

  const columns: ColumnsType<AdminUser> = [
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (role: number) => (
        <Tag color={role === AdminRole.SuperAdmin ? 'gold' : 'blue'}>{getAdminRoleText(role)}</Tag>
      ),
    },
    {
      title: '修改时间',
      dataIndex: 'updateTime',
      key: 'updateTime',
      render: (time: string) => new Date(time).toLocaleString(),
    },
    // {
    //   title: '最后登录时间',
    //   dataIndex: 'lastLoginTime',
    //   key: 'lastLoginTime',
    // },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: number) => {
        const color = status === AdminStatus.Active ? 'success' : 'error';
        return <Tag color={color}>{getAdminStatusText(status)}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            onClick={() => {
              setSelectedUserId(record.key);
              setResetModalVisible(true);
            }}
          >
            重置密码
          </Button>
          <Popconfirm
            title="确认"
            description={`确定要禁用用户"${record.username}"吗？`}
            onConfirm={() => removeAdmin(record.key)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger>
              禁用
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2>管理员列表</h2>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            新增管理员
          </Button>
        </div>
        <Input.Search
          placeholder="搜索管理员"
          allowClear
          onSearch={(value) => {
            setSearchText(value);
            setPagination((prev) => ({ ...prev, current: 1 }));
          }}
          style={{ width: 200, marginBottom: 16 }}
        />
      </div>

      <Spin spinning={loading}>
        <Table
          columns={columns}
          dataSource={adminList}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条记录`,
            onChange: (page, pageSize) => {
              setPagination((prev) => ({
                ...prev,
                current: page,
                pageSize: pageSize || 10,
              }));
            },
          }}
        />
      </Spin>

      <Modal
        title="新增管理员"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} onFinish={handleCreate} layout="vertical">
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item
            name="password"
            label="密码"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="请输入密码" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select placeholder="请选择角色">
              <Select.Option value={AdminRole.Admin}>审核人员</Select.Option>
              <Select.Option value={AdminRole.SuperAdmin}>管理员</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button
                onClick={() => {
                  setIsModalVisible(false);
                  form.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="重置密码"
        open={resetModalVisible}
        onCancel={() => {
          setResetModalVisible(false);
          resetPasswordForm.resetFields();
        }}
        footer={null}
      >
        <Form form={resetPasswordForm} onFinish={handleResetPassword} layout="vertical">
          <Form.Item
            name="password"
            label="新密码"
            rules={[{ required: true, message: '请输入新密码' }]}
          >
            <Input.Password placeholder="请输入新密码" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                确定
              </Button>
              <Button
                onClick={() => {
                  setResetModalVisible(false);
                  resetPasswordForm.resetFields();
                }}
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminList;
