/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import { EditOutlined, ExclamationCircleFilled } from '@ant-design/icons';
import {
  Button, Descriptions, Image, Input, Modal, Result, Skeleton, Tag, Tooltip, Upload
} from 'antd';
import ImgCrop from 'antd-img-crop';
import React, { useState } from 'react';
import useFetchData from '../../hooks/useFetchData';
import ApiService from '../../utils/apiService';
import { getSessionToken, getSessionUser, setSessionUserKeyAgainstValue } from '../../utils/authentication';
import notificationWithIcon from '../../utils/notification';
import { userStatusAsResponse } from '../../utils/responseAsStatus';
import ProfileEditModal from './ProfileEditModal';

const { confirm } = Modal;

function MyProfile() {
  const [editProfileModal, setEditProfileModal] = useState(false);
  const [otpModalVisible, setOtpModalVisible] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const token = getSessionToken();
  const user = getSessionUser();

  // fetch user profile API data
  const [loading, error, response] = useFetchData('/api/v1/get-user');

  // handle to change user avatar upload
  const props = {
    accept: 'image/*',
    name: 'avatar',
    action: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/avatar-update`,
    method: 'put',
    headers: { authorization: `Bearer ${token}` },
    onChange(info) {
      if (info.file.status === 'done') {
        // Handle response from API
        if (info?.file?.response?.result_code === 0) {
          notificationWithIcon('success', 'SUCCESS', info?.file?.response?.result?.message || 'Your avatar change successful');
          // update local storage session user data
          setSessionUserKeyAgainstValue('avatar', info?.file?.response?.result?.data?.avatar);
          window.location.reload();
        } else {
          notificationWithIcon('error', 'ERROR', 'Sorry! Something went wrong. App server error');
        }
      } else {
        notificationWithIcon('error', 'ERROR', info?.file?.response?.result?.error || 'Sorry! Something went wrong. App server error');
      }
    }
  };

  // function to handle sending OTP
  const handleSendOtp = () => {
    setOtpSending(true);
    ApiService.post('/api/v1/auth/send-email-verification-link')
      .then((res) => {
        setOtpSending(false);
        if (res?.result_code === 0) {
          notificationWithIcon('success', 'SUCCESS', 'Verification OTP has been sent to your email.');
          setOtpModalVisible(true);
        } else {
          notificationWithIcon('error', 'ERROR', 'Sorry! Something went wrong. App server error');
        }
      })
      .catch((err) => {
        setOtpSending(false);
        notificationWithIcon('error', 'ERROR', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Sorry! Something went wrong. App server error');
      });
  };

  // function to handle verifying OTP
  const handleVerifyOtp = () => {
    if (!otpCode || otpCode.length !== 6) {
      notificationWithIcon('error', 'ERROR', 'Please enter a valid 6-digit OTP code');
      return;
    }
    setOtpLoading(true);
    ApiService.post(`/api/v1/auth/verify-email/${otpCode}`)
      .then((res) => {
        setOtpLoading(false);
        if (res?.result_code === 0) {
          notificationWithIcon('success', 'SUCCESS', 'Email verified successfully!');
          setOtpModalVisible(false);
          setSessionUserKeyAgainstValue('verified', true);
          window.location.reload();
        } else {
          notificationWithIcon('error', 'ERROR', 'Invalid or expired OTP');
        }
      })
      .catch((err) => {
        setOtpLoading(false);
        notificationWithIcon('error', 'ERROR', err?.response?.data?.result?.error?.message || err?.response?.data?.result?.error || 'Sorry! Something went wrong. App server error');
      });
  };

  return (
    <>
      <Skeleton loading={loading} paragraph={{ rows: 10 }} active avatar>
        {error ? (
          <Result
            title='Failed to fetch'
            subTitle={error}
            status='error'
          />
        ) : (
          <Descriptions
            title='Profile Information'
            bordered
            extra={(
              <>
                {!user?.verified && (
                  <Button
                    style={{ marginTop: '10px', marginRight: '20px' }}
                    onClick={handleSendOtp}
                    shape='default'
                    type='primary'
                    size='large'
                    loading={otpSending}
                    disabled={otpSending}
                  >
                    Verify Email
                  </Button>
                )}

                <Button
                  style={{ marginTop: '10px', marginRight: '20px' }}
                  onClick={() => setEditProfileModal(true)}
                  shape='default'
                  type='primary'
                  size='large'
                >
                  Edit Profile
                </Button>
              </>
            )}
          >
            <Descriptions.Item label='Avatar' span={3}>
              {response?.data?.avatar ? (
                <Image
                  style={{ width: '100px', height: '100px' }}
                  src={response?.data?.avatar}
                  crossOrigin='anonymous'
                  alt='user-image'
                />
              ) : 'N/A'}

              {/* user avatar change */}
              <div style={{ position: 'absolute', marginTop: '-7rem', marginLeft: '5.5rem' }}>
                <ImgCrop showGrid rotationSlider>
                  <Upload {...props}>
                    <Tooltip title='Click to change Avatar'>
                      <Button
                        icon={<EditOutlined />}
                        type='default'
                        shape='circle'
                      />
                    </Tooltip>
                  </Upload>
                </ImgCrop>
              </div>
            </Descriptions.Item>

            <Descriptions.Item label='Full Name'>
              {response?.data?.fullName}
            </Descriptions.Item>
            <Descriptions.Item label='User Name' span={2}>
              {response?.data?.userName}
            </Descriptions.Item>
            <Descriptions.Item label='Email'>
              {response?.data?.email}
            </Descriptions.Item>
            <Descriptions.Item label='Phone' span={2}>
              {response?.data?.phone}
            </Descriptions.Item>

            <Descriptions.Item label='Role'>
              <Tag
                style={{ width: '60px', textAlign: 'center', textTransform: 'capitalize' }}
                color={response?.data?.role === 'admin' ? 'magenta' : 'purple'}
              >
                {response?.data?.role}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label='Status' span={2}>
              <Tag
                style={{ width: '70px', textAlign: 'center', textTransform: 'capitalize' }}
                color={userStatusAsResponse(response?.data?.status).color}
              >
                {userStatusAsResponse(response?.data?.status).level}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label='Verified'>
              <Tag
                style={{ width: '50px', textAlign: 'center', textTransform: 'capitalize' }}
                color={response?.data?.verified ? 'success' : 'error'}
              >
                {response?.data?.verified ? 'Yes' : 'No'}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label='Date Of Birth' span={2}>
              {response?.data?.dob?.split('T')[0] || 'N/A'}
            </Descriptions.Item>

            <Descriptions.Item label='User Last Update Date'>
              {response?.data?.updatedAt?.split('T')[0]}
            </Descriptions.Item>
            <Descriptions.Item label='User Registration Date' span={2}>
              {response?.data?.createdAt?.split('T')[0]}
            </Descriptions.Item>

            <Descriptions.Item label='Address' span={3}>
              {response?.data?.address}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Skeleton>

      {/* profile edit modal component */}
      {editProfileModal && (
        <ProfileEditModal
          editProfileModal={editProfileModal}
          setEditProfileModal={setEditProfileModal}
        />
      )}

      {/* OTP verification modal component */}
      <Modal
        title="Email Verification OTP"
        open={otpModalVisible}
        onOk={handleVerifyOtp}
        onCancel={() => setOtpModalVisible(false)}
        okText="Verify"
        confirmLoading={otpLoading}
      >
        <div style={{ padding: '20px 0' }}>
          <p>Please enter the 6-digit OTP code sent to your email:</p>
          <Input
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            size="large"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </Modal>
    </>
  );
}

export default React.memo(MyProfile);
