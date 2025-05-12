import React, { useEffect, useState } from 'react';
import { Card, Row, Col, DatePicker, Typography, Space, Pagination } from 'antd';
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';
import {
  getUser,
  getTravel,
  getPendingTravel,
  getList,
  getLike,
  getStar,
  getQualityRate,
} from '@/api/statistic';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const StatisticPage: React.FC = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<[string, string]>([
    dayjs().subtract(7, 'day').format('YYYY-MM-DD'),
    dayjs().format('YYYY-MM-DD'),
  ]);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTrips, setTotalTrips] = useState<number>(0);
  const [totalLikes, setTotalLikes] = useState<number>(0);
  const [totalStars, setTotalStars] = useState<number>(0);
  const [pendingTrips, setPendingTrips] = useState<number>(0);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [, setError] = useState<string>('');
  const [qualityRate, setQualityRate] = useState<number>(0);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [userRes, travelRes, likeRes, starRes, pendingRes, qualityRes] = await Promise.all([
        getUser(),
        getTravel(),
        getLike(),
        getStar(),
        getPendingTravel(),
        getQualityRate(),
      ]);

      if (userRes.code === 200) setTotalUsers(userRes.data);
      if (travelRes.code === 200) setTotalTrips(travelRes.data);
      if (likeRes.code === 200) setTotalLikes(likeRes.data);
      if (starRes.code === 200) setTotalStars(starRes.data);
      if (pendingRes.code === 200) setPendingTrips(pendingRes.data);
      if (qualityRes.code === 200) setQualityRate(qualityRes.data);
    } catch (error) {
      console.error('获取统计数据失败:', error);
      setError('获取统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getList(currentPage, pageSize, dateRange[0], dateRange[1]);
      if (response.code === 200 && response.data) {
        const formattedData = response.data.list
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()) // 添加日期排序
          .map((item) => ({
            date: dayjs(item.date).format('MM-DD'),
            newUsers: item.user || 0,
            newNotes: item.trip || 0,
          }));
        console.log('后端的响应数据：', response);
        console.log('formattedData', formattedData);

        setDailyData(formattedData);
        setTotal(response.data.total);
      }
    } catch (error) {
      console.error('获取每日统计数据失败:', error);
      setError('获取每日统计数据失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchDailyData();
  }, [currentPage, pageSize]);

  const handleDateChange = async (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
    if (dateStrings[0] && dateStrings[1]) {
      try {
        const response = await getList(1, pageSize, dateStrings[0], dateStrings[1]);
        if (response.code === 200 && response.data) {
          const formattedData = response.data.list.map((item) => ({
            date: item.date,
            newUsers: item.user,
            newNotes: item.trip,
          }));
          setDailyData(formattedData);
          setTotal(response.data.total);
          setCurrentPage(1);
        }
      } catch (error) {
        console.error('获取日期范围数据失败:', error);
      }
    }
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
            // onChange={(page, size) => {
            //   setCurrentPage(page);
            //   setPageSize(size);
            // }}
            // showSizeChanger
            // showQuickJumper
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
                  fontSize: '12px',
                }}
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
