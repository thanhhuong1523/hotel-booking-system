/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

import {
  Button, Empty, Pagination, Rate, Result, Skeleton, Tag, Tooltip, Modal
} from 'antd';
import { ExclamationCircleFilled } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import { v4 as uniqueId } from 'uuid';
import useFetchData from '../../hooks/useFetchData';
import arrayToCommaSeparatedText from '../../utils/arrayToCommaSeparatedText';
import { bookingStatusAsResponse } from '../../utils/responseAsStatus';
import QueryOptions from '../shared/QueryOptions';
import RoomStatusUpdateModal from '../shared/RoomStatusUpdateModal';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

const { confirm } = Modal;

function Orders() {
  const [fetchAgain, setFetchAgain] = useState(false);
  const [query, setQuery] = useState({
    search: '', sort: 'desc', page: '1', rows: '10'
  });
  const [statusUpdateModal, setStatusUpdateModal] = useState(
    { open: false, roomId: null, status: null }
  );

  // fetch booking-list API data
  const [loading, error, response] = useFetchData(`/api/v1/get-all-booking-orders?keyword=${query.search}&limit=${query.rows}&page=${query.page}&sort=${query.sort}`, fetchAgain);

  // reset query options
  useEffect(() => {
    setQuery((prevState) => ({ ...prevState, page: '1' }));
  }, [query.rows, query.search]);

  // Real-time WebSocket connection
  useEffect(() => {
    let ws;
    let reconnectTimeout;

    const connectWS = () => {
      const wsUrl = 'ws://localhost:8080';
      ws = new WebSocket(wsUrl);

      ws.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.event === 'BOOKING_PLACED' || payload.event === 'BOOKING_CHECKED_OUT' || payload.event === 'BOOKING_UPDATED') {
            setTimeout(() => {
              setFetchAgain((prev) => !prev);
            }, 500);
          }
        } catch (err) {
          // Ignore
        }
      };

      ws.onclose = () => {
        reconnectTimeout = setTimeout(connectWS, 3000);
      };

      ws.onerror = () => {
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (ws) ws.close();
      clearTimeout(reconnectTimeout);
    };
  }, []);

  // function handle admin check-out
  const handleAdminCheckout = (id) => {
    confirm({
      icon: <ExclamationCircleFilled />,
      content: 'Are you sure you want to confirm check-out for this booking?',
      okText: 'Confirm',
      cancelText: 'Cancel',
      onOk() {
        return new Promise((resolve, reject) => {
          ApiService.put(`/api/v1/checkout-booking/${id}`)
            .then((res) => {
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'SUCCESS', res?.result?.message || 'Check-out completed successfully!');
                setFetchAgain(!fetchAgain);
                resolve();
              } else {
                notificationWithIcon('error', 'ERROR', 'Something went wrong. App server error.');
                reject();
              }
            })
            .catch((err) => {
              const errMsg = err?.response?.data?.result?.error?.message ||
                             (typeof err?.response?.data?.result?.error === 'string' ? err?.response?.data?.result?.error : null) ||
                             err?.message ||
                             'Something went wrong. App server error.';
              notificationWithIcon('error', 'ERROR', errMsg);
              reject();
            });
        }).catch(() => notificationWithIcon('error', 'ERROR', 'Oops errors!'));
      }
    });
  };

  return (
    <div>
      {/* booking list ― query section */}
      <QueryOptions query={query} setQuery={setQuery} disabledSearch />

      {/* room list ― content section */}
      <div className='w-full flex flex-row flex-wrap items-center justify-center gap-2'>
        {error ? (
          <Result
            title='Failed to fetch'
            subTitle={error}
            status='error'
          />
        ) : (
          <Skeleton loading={loading} paragraph={{ rows: 10 }} active>
            {response?.data?.rows?.length === 0 ? (
              <Empty
                className='mt-10'
                description={(<span>Sorry! Any data was not found.</span>)}
              />
            ) : (
              <div className='table-layout'>
                <div className='table-layout-container'>
                  <table className='data-table'>
                    {/* data table ― head */}
                    <thead className='data-table-head'>
                      <tr className='data-table-head-tr'>
                        <th className='data-table-head-tr-th' scope='col'>
                          Booking Dates
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Booking Status
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Booked By
                        </th>
                        <th className='data-table-head-tr-th' scope='col'>
                          Booked Room
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Total Price
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Payment Status
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Review & Ratting
                        </th>
                        <th className='data-table-head-tr-th text-center' scope='col'>
                          Booking Actions
                        </th>
                      </tr>
                    </thead>

                    {/* data table ― body */}
                    <tbody>
                      {response?.data?.rows?.map((data) => (
                        <tr className='data-table-body-tr' key={uniqueId()}>
                          <td className='data-table-body-tr-td'>
                            {arrayToCommaSeparatedText(data?.booking_dates?.map(
                              (date) => (date.split('T')[0])
                            ))}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            <Tag
                              className='w-[100px] text-center uppercase'
                              color={bookingStatusAsResponse(data?.booking_status).color}
                            >
                              {bookingStatusAsResponse(data?.booking_status).level}
                            </Tag>
                          </td>
                          <td className='data-table-body-tr-td'>
                            {data?.booking_by?.fullName}
                          </td>
                          <td className='data-table-body-tr-td'>
                            {data?.room?.room_name}
                          </td>
                          <td className='data-table-body-tr-td text-center font-semibold'>
                            {data?.total_price ? `$${data.total_price}` : 'N/A'}
                          </td>
                          <td className='data-table-body-tr-td text-center'>
                            <Tag
                              className='w-[80px] text-center uppercase'
                              color={data?.payment_status === 'paid' ? 'green' : 'orange'}
                            >
                              {data?.payment_status || 'unpaid'}
                            </Tag>
                          </td>
                          <Tooltip
                            title={data?.reviews?.message}
                            placement='top'
                            trigger='hover'
                          >
                            <td className='data-table-body-tr-td text-center'>
                              {data?.reviews ? (
                                <Rate value={data?.reviews?.rating} disabled />
                              ) : 'N/A'}
                            </td>
                          </Tooltip>
                          <td className='data-table-body-tr-td !px-0 text-center'>
                            {data?.booking_status === 'approved' ? (
                              <div className='flex gap-2 justify-center px-2'>
                                <Button
                                  className='inline-flex items-center !px-2'
                                  type='primary'
                                  onClick={() => setStatusUpdateModal((prevState) => ({
                                    ...prevState, open: true, roomId: data?.id, status: data?.booking_status
                                  }))}
                                >
                                  Update Status
                                </Button>
                                <Button
                                  className='inline-flex items-center !px-2'
                                  type='primary'
                                  danger
                                  onClick={() => handleAdminCheckout(data?.id)}
                                >
                                  Check-out
                                </Button>
                              </div>
                            ) : (
                              data?.booking_status !== 'cancel' &&
                               data?.booking_status !== 'rejected' &&
                               data?.booking_status !== 'in-reviews' &&
                               data?.booking_status !== 'completed' ? (
                                 <Button
                                   className='inline-flex items-center !px-2'
                                   type='primary'
                                   onClick={() => setStatusUpdateModal((prevState) => ({
                                     ...prevState, open: true, roomId: data?.id, status: data?.booking_status
                                   }))}
                                 >
                                   Update Status
                                 </Button>
                                ) : 'Action Not Possible!'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </Skeleton>
        )}
      </div>

      {/* booking list ― pagination */}
      {response?.data?.total_page > 1 && (
        <Pagination
          className='my-5'
          onChange={(e) => setQuery((prevState) => ({ ...prevState, page: e }))}
          total={response?.data?.total_page * 10}
          current={response?.data?.current_page}
        />
      )}

      {/* room status update modal component */}
      {statusUpdateModal?.open && (
        <RoomStatusUpdateModal
          statusUpdateModal={statusUpdateModal}
          setStatusUpdateModal={setStatusUpdateModal}
          setFetchAgain={setFetchAgain}
        />
      )}
    </div>
  );
}

export default Orders;
