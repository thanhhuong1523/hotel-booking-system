/**
 * @name Hotel Room Booking System
 * Statistics Tab — Charts & Analytics
 */

import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  HomeOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Skeleton, Statistic, Typography } from 'antd';
import React, { useMemo } from 'react';
import CountUp from 'react-countup';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import useFetchData from '../../hooks/useFetchData';

const { Title, Text } = Typography;

/* ─── colour palette ─── */
const COLORS = {
  primary: '#1677ff',
  success: '#52c41a',
  warning: '#faad14',
  danger: '#ff4d4f',
  purple: '#722ed1',
  cyan: '#13c2c2',
  gold: '#fa8c16',
  pink: '#eb2f96'
};

const BOOKING_STATUS_COLORS = [
  COLORS.warning,   // pending
  COLORS.primary,   // approved
  COLORS.danger,    // rejected / cancel
  COLORS.cyan,      // in-reviews
  COLORS.success,   // completed
];

const formatter = (value) => <CountUp end={value} separator=',' />;

/* ─── custom tooltip shared ─── */
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#fff',
        border: '1px solid #e8e8e8',
        borderRadius: 8,
        padding: '10px 14px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
      }}>
        {label && <p style={{ margin: '0 0 6px', fontWeight: 600, color: '#333' }}>{label}</p>}
        {payload.map((entry, i) => (
          <p key={i} style={{ margin: '2px 0', color: entry.color, fontWeight: 500 }}>
            {entry.name}: <strong>{entry.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

/* ─── Stat Card ─── */
function StatCard({ icon, title, value, color, suffix, loading }) {
  return (
    <Card
      style={{
        borderRadius: 12,
        border: `1px solid ${color}22`,
        background: `linear-gradient(135deg, ${color}08 0%, #fff 100%)`,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
      }}
      bodyStyle={{ padding: '20px 24px' }}
    >
      <Skeleton loading={loading} active paragraph={false}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Text style={{ fontSize: 12, color: '#888', textTransform: 'uppercase', letterSpacing: 1 }}>
              {title}
            </Text>
            <Statistic
              value={value || 0}
              formatter={formatter}
              suffix={suffix}
              valueStyle={{ color, fontWeight: 700, fontSize: 28 }}
            />
          </div>
          <div style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: `${color}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
            color
          }}>
            {icon}
          </div>
        </div>
      </Skeleton>
    </Card>
  );
}

/* ─── Main Statistics Component ─── */
function Statistics() {
  const [loading, , response] = useFetchData('/api/v1/dashboard');
  const data = response?.data;

  /* Build chart data from API */
  const bookingStatusData = useMemo(() => [
    { name: 'Pending', value: data?.booking_info?.pending_bookings || 0 },
    { name: 'Approved', value: data?.booking_info?.approved_bookings || 0 },
    { name: 'Cancelled', value: data?.booking_info?.cancel_bookings || 0 },
    { name: 'In Review', value: data?.booking_info?.in_reviews_bookings || 0 },
    { name: 'Completed', value: data?.booking_info?.completed_bookings || 0 },
  ], [data]);

  const userStatusData = useMemo(() => [
    { name: 'Online', value: data?.users_info?.login_status_user || 0, fill: COLORS.success },
    { name: 'Offline', value: data?.users_info?.logout_status_user || 0, fill: COLORS.danger },
    { name: 'Registered', value: data?.users_info?.register_status_user || 0, fill: COLORS.primary },
    { name: 'Blocked', value: data?.users_info?.blocked_status_user || 0, fill: COLORS.warning },
  ], [data]);

  const roomStatusData = useMemo(() => [
    { name: 'Available', value: data?.rooms_info?.available_rooms || 0, fill: COLORS.success },
    { name: 'Booked', value: data?.rooms_info?.booked_rooms || 0, fill: COLORS.primary },
    { name: 'Unavailable', value: data?.rooms_info?.unavailable_rooms || 0, fill: COLORS.danger },
  ], [data]);

  const overviewBarData = useMemo(() => [
    {
      name: 'Users',
      Total: data?.users_info?.total_users || 0,
      Admin: data?.users_info?.admin_role_user || 0,
      Verified: data?.users_info?.verified_user || 0,
    },
    {
      name: 'Rooms',
      Total: data?.rooms_info?.total_rooms || 0,
      Available: data?.rooms_info?.available_rooms || 0,
      Booked: data?.rooms_info?.booked_rooms || 0,
    },
    {
      name: 'Bookings',
      Total: data?.booking_info?.total_bookings || 0,
      Completed: data?.booking_info?.completed_bookings || 0,
      Pending: data?.booking_info?.pending_bookings || 0,
    }
  ], [data]);

  const bookingBarData = useMemo(() => [
    { name: 'Pending', count: data?.booking_info?.pending_bookings || 0 },
    { name: 'Approved', count: data?.booking_info?.approved_bookings || 0 },
    { name: 'Cancelled', count: data?.booking_info?.cancel_bookings || 0 },
    { name: 'Rejected', count: data?.booking_info?.rejected_bookings || 0 },
    { name: 'In Review', count: data?.booking_info?.in_reviews_bookings || 0 },
    { name: 'Completed', count: data?.booking_info?.completed_bookings || 0 },
  ], [data]);

  /* Derived revenue estimate */
  const estimatedRevenue = (data?.booking_info?.completed_bookings || 0) * 150;

  return (
    <div style={{ padding: '8px 4px' }}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Analytics &amp; Statistics</Title>
        <Text type='secondary'>Overview of hotel performance metrics</Text>
      </div>

      {/* ── KPI Stat Cards ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<TeamOutlined />}
            title='Total Users'
            value={data?.users_info?.total_users}
            color={COLORS.primary}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<HomeOutlined />}
            title='Total Rooms'
            value={data?.rooms_info?.total_rooms}
            color={COLORS.purple}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<TrophyOutlined />}
            title='Total Bookings'
            value={data?.booking_info?.total_bookings}
            color={COLORS.cyan}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<DollarOutlined />}
            title='Est. Revenue'
            value={estimatedRevenue}
            color={COLORS.success}
            suffix='$'
          />
        </Col>
      </Row>

      {/* ── Second row KPIs ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<ClockCircleOutlined />}
            title='Pending Bookings'
            value={data?.booking_info?.pending_bookings}
            color={COLORS.warning}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<CheckCircleOutlined />}
            title='Completed Bookings'
            value={data?.booking_info?.completed_bookings}
            color={COLORS.success}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<CloseCircleOutlined />}
            title='Cancelled Bookings'
            value={data?.booking_info?.cancel_bookings}
            color={COLORS.danger}
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatCard
            loading={loading}
            icon={<AlertOutlined />}
            title='Available Rooms'
            value={data?.rooms_info?.available_rooms}
            color={COLORS.gold}
          />
        </Col>
      </Row>

      {/* ── Row 1: Booking Pie + Booking Bar ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Booking Status Pie Chart */}
        <Col xs={24} lg={10}>
          <Card
            title='Booking Status Distribution'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
              <ResponsiveContainer width='100%' height={280}>
                <PieChart>
                  <Pie
                    data={bookingStatusData}
                    cx='50%'
                    cy='50%'
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey='value'
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {bookingStatusData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BOOKING_STATUS_COLORS[index]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>

        {/* Booking Status Bar Chart */}
        <Col xs={24} lg={14}>
          <Card
            title='Booking Status Breakdown'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
              <ResponsiveContainer width='100%' height={280}>
                <BarChart data={bookingBarData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey='count' name='Bookings' radius={[6, 6, 0, 0]}>
                    {bookingBarData.map((_, index) => (
                      <Cell key={`bar-${index}`} fill={BOOKING_STATUS_COLORS[index] || COLORS.primary} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* ── Row 2: Room Status + User Status ── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        {/* Room Status Pie */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            title='Room Availability'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <ResponsiveContainer width='100%' height={250}>
                <PieChart>
                  <Pie
                    data={roomStatusData}
                    cx='50%'
                    cy='50%'
                    outerRadius={90}
                    dataKey='value'
                    paddingAngle={4}
                  >
                    {roomStatusData.map((entry, index) => (
                      <Cell key={`room-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>

        {/* User Status Radial */}
        <Col xs={24} sm={12} lg={8}>
          <Card
            title='User Activity Status'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <ResponsiveContainer width='100%' height={250}>
                <RadialBarChart
                  cx='50%'
                  cy='50%'
                  innerRadius='20%'
                  outerRadius='90%'
                  data={userStatusData}
                  startAngle={90}
                  endAngle={-270}
                >
                  <RadialBar
                    label={{ position: 'insideStart', fill: '#fff', fontSize: 10 }}
                    background
                    dataKey='value'
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconSize={10} />
                </RadialBarChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>

        {/* System Overview Grouped Bar */}
        <Col xs={24} lg={8}>
          <Card
            title='System Overview'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', height: '100%' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <ResponsiveContainer width='100%' height={250}>
                <BarChart data={overviewBarData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray='3 3' stroke='#f0f0f0' />
                  <XAxis dataKey='name' tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar dataKey='Total' fill={COLORS.primary} radius={[4, 4, 0, 0]} />
                  <Bar dataKey='Admin' fill={COLORS.purple} radius={[4, 4, 0, 0]} />
                  <Bar dataKey='Available' fill={COLORS.success} radius={[4, 4, 0, 0]} />
                  <Bar dataKey='Booked' fill={COLORS.cyan} radius={[4, 4, 0, 0]} />
                  <Bar dataKey='Completed' fill={COLORS.gold} radius={[4, 4, 0, 0]} />
                  <Bar dataKey='Pending' fill={COLORS.warning} radius={[4, 4, 0, 0]} />
                  <Bar dataKey='Verified' fill={COLORS.pink} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>
      </Row>

      {/* ── Row 3: User Role Pie + Summary Cards ── */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={8}>
          <Card
            title='User Roles'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              <ResponsiveContainer width='100%' height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Admin', value: data?.users_info?.admin_role_user || 0 },
                      { name: 'User', value: data?.users_info?.user_role_user || 0 }
                    ]}
                    cx='50%'
                    cy='50%'
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey='value'
                  >
                    <Cell fill={COLORS.danger} />
                    <Cell fill={COLORS.primary} />
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={8}>
          <Card
            title='Booking Completion Rate'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 5 }}>
              {(() => {
                const total = data?.booking_info?.total_bookings || 0;
                const completed = data?.booking_info?.completed_bookings || 0;
                const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
                return (
                  <ResponsiveContainer width='100%' height={200}>
                    <RadialBarChart
                      cx='50%'
                      cy='50%'
                      innerRadius='55%'
                      outerRadius='85%'
                      startAngle={90}
                      endAngle={90 - ((360 * rate) / 100)}
                      data={[{ value: rate, fill: COLORS.success }]}
                    >
                      <RadialBar dataKey='value' />
                      <text
                        x='50%'
                        y='48%'
                        textAnchor='middle'
                        dominantBaseline='middle'
                        style={{ fontSize: 26, fontWeight: 700, fill: COLORS.success }}
                      >
                        {`${rate}%`}
                      </text>
                      <text
                        x='50%'
                        y='62%'
                        textAnchor='middle'
                        style={{ fontSize: 11, fill: '#888' }}
                      >
                        Completion Rate
                      </text>
                    </RadialBarChart>
                  </ResponsiveContainer>
                );
              })()}
            </Skeleton>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card
            title='Quick Summary'
            bordered={false}
            style={{ borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
            bodyStyle={{ padding: '12px 16px' }}
          >
            <Skeleton loading={loading} active paragraph={{ rows: 6 }}>
              {[
                { label: 'Verified Users', value: data?.users_info?.verified_user, color: COLORS.success },
                { label: 'Online Now', value: data?.users_info?.login_status_user, color: COLORS.primary },
                { label: 'Blocked Users', value: data?.users_info?.blocked_status_user, color: COLORS.danger },
                { label: 'Featured Rooms', value: data?.rooms_info?.total_rooms, color: COLORS.purple },
                { label: 'Rejected Bookings', value: data?.booking_info?.rejected_bookings, color: COLORS.danger },
                { label: 'In Review', value: data?.booking_info?.in_reviews_bookings, color: COLORS.cyan }
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 0',
                    borderBottom: '1px solid #f5f5f5'
                  }}
                >
                  <Text style={{ color: '#555', fontSize: 13 }}>{item.label}</Text>
                  <Text
                    strong
                    style={{ color: item.color, fontSize: 14 }}
                  >
                    {item.value ?? 0}
                  </Text>
                </div>
              ))}
            </Skeleton>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default React.memo(Statistics);
