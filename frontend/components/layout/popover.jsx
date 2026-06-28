/**
 * @name Hotel Room Booking System
 */

import { HistoryOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import {
  Avatar, Button, Popover
} from 'antd';
import { useRouter } from 'next/router';
import React, { useState } from 'react';
import ApiService from '../../utils/apiService';
import { getSessionUser, removeSessionAndLogoutUser } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';

function UserPopover() {
  const [loading, setLoading] = useState(false);
  const user = getSessionUser();
  const router = useRouter();

  // function to handle user logout
  const userLogout = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      {/* Welcome text — inline, no absolute positioning */}
      <span className='nav-welcome'>
        {`Welcome, ${user?.fullName?.split(' ')[0] || 'Guest'}`}
      </span>

      <Popover
        placement='bottomRight'
        trigger='hover'
        title={(
          <div style={{ padding: '4px 0', borderBottom: '1px solid #f0ebe3', marginBottom: '4px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: '#1a1714' }}>{user?.fullName}</div>
            <div style={{ fontSize: '12px', color: '#a89880' }}>{user?.email}</div>
          </div>
        )}
        content={(
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'start', minWidth: '160px' }}>
            <Button
              style={{ color: '#6b5e4e', padding: '4px 0', width: '100%', textAlign: 'left' }}
              onClick={() => router.push('/profile?tab=my-profile')}
              icon={<UserOutlined />}
              size='middle'
              type='link'
            >
              My Profile
            </Button>
            <Button
              style={{ color: '#6b5e4e', padding: '4px 0', width: '100%', textAlign: 'left' }}
              onClick={() => router.push('/profile?tab=booking-history')}
              icon={<HistoryOutlined />}
              size='middle'
              type='link'
            >
              Booking History
            </Button>
            <Button
              style={{ color: '#c0392b', padding: '4px 0', width: '100%', textAlign: 'left' }}
              icon={<LogoutOutlined />}
              onClick={userLogout}
              size='middle'
              type='link'
              loading={loading}
              disabled={loading}
            >
              Log Out
            </Button>
          </div>
        )}
      >
        <Avatar
          src={(
            <img
              src={user?.avatar || 'https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg'}
              alt='avatar'
            />
          )}
          size={36}
          style={{ cursor: 'pointer', border: '2px solid #b8864e', flexShrink: 0 }}
        />
      </Popover>
    </div>
  );
}

export default UserPopover;
