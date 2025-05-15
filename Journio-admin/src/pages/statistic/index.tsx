import React, { useEffect } from 'react';
import { Card, Row, Col, DatePicker, Typography, Pagination } from 'antd';
import {
  UserOutlined,
  FileTextOutlined,
  LikeOutlined,
  StarOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import './index.scss';
import {
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import { useStatisticStore } from '@/store/statistic';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const StatisticPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    dateRange,
    totalUsers,
    totalTrips,
    totalLikes,
    totalStars,
    pendingTrips,
    dailyData,
    currentPage,
    pageSize,
    total,
    loading,
    qualityRate,
    setDateRange,
    setCurrentPage,
    fetchData,
    fetchDailyData,
  } = useStatisticStore();

  useEffect(() => {
    fetchData();
    fetchDailyData();
  }, [
    totalUsers,
    totalTrips,
    totalLikes,
    totalStars,
    qualityRate,
    dateRange,
    fetchDailyData,
    fetchData,
  ]);

  const handleDateChange = async (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
    if (dateStrings[0] && dateStrings[1]) {
      setCurrentPage(1);
      fetchDailyData(1, pageSize, dateStrings[0], dateStrings[1]);
    }
  };

  const handlePageChange = (page: number, pageSize?: number) => {
    setCurrentPage(page);
    fetchDailyData(page, pageSize || 10);
  };

  return (
    <div className="statistic-page">
      <div className="dashboard-header">
        <Title level={4} className="dashboard-title">
          数据统计
        </Title>
        <RangePicker
          value={[
            dateRange[0] ? dayjs(dateRange[0]) : null,
            dateRange[1] ? dayjs(dateRange[1]) : null,
          ]}
          onChange={handleDateChange}
          format="YYYY-MM-DD"
        />
      </div>

      <Row gutter={16}>
        <Col span={6}>
          <Card bordered={false} className="statistic-card">
            <div className="statistic-title">总用户数</div>
            <div className="statistic-content">
              <UserOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalUsers}</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="statistic-card">
            <div className="statistic-title">总游记数</div>
            <div className="statistic-content">
              <FileTextOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalTrips}</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="statistic-card">
            <div className="statistic-title">总点赞数</div>
            <div className="statistic-content">
              <LikeOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalLikes}</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="statistic-card">
            <div className="statistic-title">总收藏数</div>
            <div className="statistic-content">
              <StarOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{totalStars}</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="待处理" bordered={false} className="pending-card">
            <div className="pending-content">
              <div className="pending-item">
                <span className="pending-label">待审核笔记:</span>
                <div
                  className="pending-value"
                  style={{
                    color: '#4080ff',
                    cursor: 'pointer',
                  }}
                  onClick={() => navigate('/audit/pending')}
                >
                  {pendingTrips}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="游记质量" bordered={false} className="pending-card">
            <div className="pending-content">
              <div className="pending-item">
                <span className="pending-label">高质量游记比例:</span>
                <div className="pending-value" style={{ color: '#52c41a' }}>
                  <TrophyOutlined style={{ marginRight: 8 }} />
                  {qualityRate}%
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card
        title="每日统计"
        style={{ marginTop: 16 }}
        loading={loading}
        extra={
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={total}
            onChange={handlePageChange}
            showTotal={(total) => `共 ${total} 条`}
          />
        }
      >
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                axisLine={{ stroke: '#e0e0e0' }}
                tickLine={false}
                tick={{ fontSize: 12 }}
              />
              <YAxis axisLine={{ stroke: '#e0e0e0' }} tickLine={false} tick={{ fontSize: 12 }} />
              <Tooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                contentStyle={{
                  backgroundColor: '#fff',
                  border: '1px solid #e0e0e0',
                  borderRadius: '4px',
                  padding: '10px',
                }}
              />
              <Legend
                wrapperStyle={{
                  paddingTop: '20px',
                  fontSize: '18px',
                }}
                layout="horizontal"
                // verticalAlign="top"
                align="center"
              />
              <Bar
                dataKey="newUsers"
                name="新用户"
                fill="#1890ff"
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="newNotes"
                name="新笔记"
                fill="#52c41a"
                barSize={30}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default StatisticPage;
