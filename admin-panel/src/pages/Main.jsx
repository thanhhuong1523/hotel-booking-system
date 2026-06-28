/**
 * @name Hotel Room Booking System
 */

import {
  BarChartOutlined,
  DashboardOutlined,
  FileProtectOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  HomeOutlined,
  LogoutOutlined,
  TeamOutlined,
  UserOutlined
} from '@ant-design/icons';
import {
  Button, Layout, Menu, Tooltip
} from 'antd';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Logo from '../assets/images/logo.svg';
import UserBox from '../components/shared/UserBox';
import Dashboard from '../components/tabs/Dashboard';
import MyProfile from '../components/tabs/MyProfile';
import Orders from '../components/tabs/Orders';
import Rooms from '../components/tabs/Rooms';
import Statistics from '../components/tabs/Statistics';
import Users from '../components/tabs/Users';
import useFullScreen from '../hooks/useFullScreen';
import ApiService from '../utils/apiService';
import { removeSessionAndLogoutUser } from '../utils/authentication';
import notificationWithIcon from '../utils/notification';

const {
  Header, Content, Footer, Sider
} = Layout;

function Main() {
  window.document.title = 'Beach Resort — Main';
  const { isFullscreen, toggleFullScreen } = useFullScreen();
  const [selectedKeys, setSelectedKeys] = useState('1');
  const navigate = useNavigate();
  const { tab } = useParams();

  // function to handle user logout
  const userLogout = async () => {
    try {
      const response = await ApiService.post('/api/v1/auth/logout');
      if (response?.result_code === 0) {
        removeSessionAndLogoutUser();
      } else {
        notificationWithIcon('error', 'ERROR', 'Sorry! Something went wrong. App server error');
        removeSessionAndLogoutUser();
      }
    } catch (error) {
      notificationWithIcon('error', 'ERROR', error?.response?.data?.result?.error || 'Sorry! Something went wrong. App server error');
      removeSessionAndLogoutUser();
    }
  };

  const handleTabChange = (key) => {
    switch (key) {
      case '1': { navigate('/main/dashboard'); break; }
      case '2': { navigate('/main/users'); break; }
      case '3': { navigate('/main/hotel-rooms'); break; }
      case '4': { navigate('/main/booking-orders'); break; }
      case '5': { navigate('/main/statistics'); break; }
      case '6': { navigate('/main/profile'); break; }
      case '7': { userLogout(); break; }
      default: { navigate('/main/dashboard'); }
    }
  };

  useEffect(() => {
    if (tab) {
      switch (tab) {
        case 'dashboard': { setSelectedKeys('1'); break; }
        case 'users': { setSelectedKeys('2'); break; }
        case 'hotel-rooms': { setSelectedKeys('3'); break; }
        case 'booking-orders': { setSelectedKeys('4'); break; }
        case 'statistics': { setSelectedKeys('5'); break; }
        case 'profile': { setSelectedKeys('6'); break; }
        case 'logout': { setSelectedKeys('7'); break; }
        default: { navigate('/not-found'); }
      }
    }
  }, [tab, navigate]);

  useEffect(() => {
    const titles = {
      1: 'Beach Resort — Dashboard',
      2: 'Beach Resort — Users',
      3: 'Beach Resort — Hotel Rooms',
      4: 'Beach Resort — Booking Orders',
      5: 'Beach Resort — Statistics',
      6: 'Beach Resort — Profile'
    };
    window.document.title = titles[selectedKeys] || 'Beach Resort — Dashboard';
  }, [selectedKeys]);

  return (
    <Layout className='w-full h-screen'>
      <Sider width={250} breakpoint='lg' collapsedWidth='0'>
        <UserBox />

        <Menu
          theme='dark'
          mode='inline'
          selectedKeys={[selectedKeys]}
          onClick={(e) => { handleTabChange(e.key); }}
          items={[
            {
              key: '1',
              icon: <DashboardOutlined />,
              label: 'Dashboard'
            },
            {
              key: '2',
              icon: <TeamOutlined />,
              label: 'Users'
            },
            {
              key: '3',
              icon: <HomeOutlined />,
              label: 'Hotel Rooms'
            },
            {
              key: '4',
              icon: <FileProtectOutlined />,
              label: 'Booking Orders'
            },
            {
              key: '5',
              icon: <BarChartOutlined />,
              label: 'Statistics'
            },
            {
              key: '6',
              icon: <UserOutlined />,
              label: 'My Profile'
            },
            {
              key: '7',
              icon: <LogoutOutlined />,
              label: 'Logout'
            }
          ]}
        />
      </Sider>

      <Layout>
        <Header className='p-0 !bg-bg-white'>
          <Link to='/'>
            <img
              className='w-[280px] h-[65px] mx-auto'
              alt='beach-resort-logo'
              src={Logo}
            />
          </Link>

          {/* full screen toggle button */}
          <Tooltip title='Click to toggle Full Screen' placement='left'>
            <Button
              className='absolute right-5 top-5'
              icon={isFullscreen ?
                (<FullscreenExitOutlined className='pb-12' />) :
                (<FullscreenOutlined className='pb-12' />)}
              onClick={toggleFullScreen}
              shape='default'
              type='default'
              size='middle'
            />
          </Tooltip>
        </Header>

        <Content className='bg-bg-white overflow-y-scroll m-2 p-2'>
          {selectedKeys === '1' && (<Dashboard />)}
          {selectedKeys === '2' && (<Users />)}
          {selectedKeys === '3' && (<Rooms />)}
          {selectedKeys === '4' && (<Orders />)}
          {selectedKeys === '5' && (<Statistics />)}
          {selectedKeys === '6' && (<MyProfile />)}
        </Content>

        <Footer className='text-center font-text-font font-medium'>
          &copy;
          {new Date().getFullYear()}
          {' '}
          Beach Resort — Hotel Management System
        </Footer>
      </Layout>
    </Layout>
  );
}

export default React.memo(Main);
