import React, { useEffect, useState } from 'react';
import { Card, Row, Col, DatePicker, Typography, Space } from 'antd';
import { UserOutlined, FileTextOutlined, EyeOutlined, FlagOutlined } from '@ant-design/icons';
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
import { getUser, getTravel, getPendingTravel, getList } from '@/api/statistic';

const { RangePicker } = DatePicker;
const { Title } = Typography;

const StatisticPage: React.FC = () => {
  const [dateRange, setDateRange] = useState<[string, string]>(['2028-06-07', '2028-06-22']);
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalTrips, setTotalTrips] = useState<number>(0);
  const [pendingTrips, setPendingTrips] = useState<number>(0);
  const [dailyData, setDailyData] = useState<any[]>([]);

  useEffect(() => {
    // 获取总用户数
    getUser().then((response) => {
      if (response.code === 200) {
        setTotalUsers(response.data);
      }
    });

    // 获取总游记数
    getTravel().then((response) => {
      if (response.code === 200) {
        setTotalTrips(response.data);
      }
    });

    // 获取待审核游记数
    getPendingTravel().then((response) => {
      if (response.code === 200) {
        setPendingTrips(response.data);
      }
    });

    // 获取每日统计数据
    getList().then((response) => {
      if (response.code === 200 && response.data) {
        const formattedData = response.data.map((item) => ({
          date: item.date,
          newUsers: item.user,
          newNotes: item.trip,
          visits: 0, // 没有访问量数据，暂时设为0
        }));
        setDailyData(formattedData);
      }
    });
  }, []);

  const handleDateChange = (dates: any, dateStrings: [string, string]) => {
    setDateRange(dateStrings);
    // 这里可以添加获取对应日期范围数据的逻辑
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
            <div className="statistic-title">总浏览量</div>
            <div className="statistic-content">
              <EyeOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>58,961</span>
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} className="statistic-card">
            <div className="statistic-title">总举报数</div>
            <div className="statistic-content">
              <FlagOutlined style={{ fontSize: 20, marginRight: 8 }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>125</span>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginTop: 16 }}>
        <Col span={12}>
          <Card title="待处理" bordered={false} className="pending-card">
            <div className="pending-content">
              <div className="pending-item">
                <span className="pending-label">待审核笔记</span>
                <div className="pending-value" style={{ color: '#4080ff' }}>
                  {pendingTrips}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col span={12}>
          <Card title="待处理" bordered={false} className="pending-card">
            <div className="pending-content">
              <div className="pending-item">
                <span className="pending-label">待处理举报</span>
                <div className="pending-value" style={{ color: '#4080ff' }}>
                  {pendingTrips}
                </div>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="每日统计" style={{ marginTop: 16 }}>
        <div style={{ height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" domain={[0, 1500]} />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="newUsers" name="新用户" fill="#8884d8" barSize={20} />
              <Bar yAxisId="left" dataKey="newNotes" name="新笔记" fill="#82ca9d" barSize={20} />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="visits"
                name="访问量"
                stroke="#ffc658"
                strokeWidth={2}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};

export default StatisticPage;
