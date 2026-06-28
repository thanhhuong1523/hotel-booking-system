import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, Input, message } from 'antd';
import dayjs from 'dayjs';
import { useRouter } from 'next/router';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { Calendar } from 'react-multi-date-picker';
import DatePanel from 'react-multi-date-picker/plugins/date_panel';
import DatePickerHeader from 'react-multi-date-picker/plugins/date_picker_header';
import Toolbar from 'react-multi-date-picker/plugins/toolbar';
import ApiService from '../../utils/apiService';
import notificationWithIcon from '../../utils/notification';

const { confirm } = Modal;

function OrderPlaceModal({ bookingModal, setBookingModal }) {
  const [selectedDates, setSelectedDates] = useState([]);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCVC: ''
  });
  const router = useRouter();

  // handle date change on date picker
  const handleDateChange = (dates) => {
    const formattedDates = dates.map((date) => dayjs(date).format('YYYY-MM-DD'));
    setSelectedDates(formattedDates);
  };

  const validateDates = () => {
    if (selectedDates.length === 0) {
      notificationWithIcon('error', 'ERROR', 'Yêu cầu chọn tối thiểu 1 ngày để đặt phòng.');
      return false;
    }
    if (selectedDates.length > 5) {
      notificationWithIcon('error', 'ERROR', 'Chỉ được chọn tối đa 5 ngày đặt phòng.');
      return false;
    }
    return true;
  };

  const goToCheckOut = () => {
    if (validateDates()) {
      setStep(2);
    }
  };

  const goToPayment = () => {
    setStep(3);
  };

  // function to handle placed room booking order & payment
  const handlePlacedOrder = () => {
    if (!paymentInfo.cardName || !paymentInfo.cardNumber || !paymentInfo.cardExpiry || !paymentInfo.cardCVC) {
      notificationWithIcon('error', 'ERROR', 'Vui lòng nhập đầy đủ thông tin thanh toán.');
      return;
    }

    confirm({
      title: 'Xác nhận thanh toán & Đặt phòng',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn đặt phòng này trong ${selectedDates.length} đêm? Tổng số tiền cần thanh toán: $${bookingModal?.roomPrice * selectedDates.length}`,
      okText: 'Thanh toán & Đặt phòng',
      cancelText: 'Hủy bỏ',
      onOk() {
        setLoading(true);
        return new Promise((resolve, reject) => {
          ApiService.post(`/api/v1/placed-booking-order/${bookingModal?.roomId}`, {
            booking_dates: selectedDates,
            payment_status: 'paid',
            payment_method: 'card'
          })
            .then((res) => {
              setLoading(false);
              resolve();
              if (res?.result_code === 0) {
                notificationWithIcon('success', 'SUCCESS', 'Đặt phòng và thanh toán hóa đơn thành công!');
                setBookingModal((prevState) => ({ ...prevState, open: false, roomId: null }));
                router.push('/profile?tab=booking-history');
                setSelectedDates([]);
              } else {
                notificationWithIcon('error', 'ERROR', 'Có lỗi xảy ra từ máy chủ backend.');
              }
            })
            .catch((err) => {
              setLoading(false);
              notificationWithIcon('error', 'ERROR', err?.response?.data?.result?.error?.message || err?.message || 'Có lỗi xảy ra từ máy chủ backend.');
              reject();
            });
        }).catch((err) => message.error(err?.message || 'Có lỗi xảy ra!'));
      }
    });
  };

  const getModalTitle = () => {
    if (step === 1) return 'Chọn ngày bạn muốn đặt phòng:';
    if (step === 2) return 'Hóa đơn chi tiết đặt phòng:';
    return 'Nhập thông tin thanh toán (Thẻ Demo):';
  };

  return (
    <Modal
      title={getModalTitle()}
      open={bookingModal.open}
      onCancel={() => setBookingModal((prevState) => ({ ...prevState, open: false, roomId: null }))}
      closable={!loading}
      maskClosable={!loading}
      centered
      footer={[
        <div key='custom-footer' style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          {step === 1 && (
            <>
              <Button onClick={() => setBookingModal((prevState) => ({ ...prevState, open: false, roomId: null }))} type='default'>
                Hủy bỏ
              </Button>
              <Button onClick={goToCheckOut} type='primary'>
                Tiếp theo: Hóa đơn
              </Button>
            </>
          )}
          {step === 2 && (
            <>
              <Button onClick={() => setStep(1)} type='default'>
                Quay lại chọn ngày
              </Button>
              <Button onClick={goToPayment} type='primary'>
                Tiếp theo: Thanh toán
              </Button>
            </>
          )}
          {step === 3 && (
            <>
              <Button onClick={() => setStep(2)} type='default' disabled={loading}>
                Quay lại hóa đơn
              </Button>
              <Button onClick={handlePlacedOrder} type='primary' loading={loading}>
                Thanh toán & Đặt phòng
              </Button>
            </>
          )}
        </div>
      ]}
    >
      {step === 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <Calendar
            style={{ width: '100%' }}
            plugins={[
              <DatePickerHeader key='date-picker-header' position='top' size='medium' />,
              <DatePanel style={{ width: '100%' }} key='date-panel' position='right' sort='date' />,
              <Toolbar key='toolbar' position='bottom' />
            ]}
            minDate={new Date(new Date()).setDate(new Date().getDate() + 1)}
            maxDate={new Date(new Date()).setDate(new Date().getDate() + 30)}
            onChange={handleDateChange}
            value={selectedDates}
            format='YYYY/MM/DD'
            highlightToday
            multiple
          />
        </div>
      )}

      {step === 2 && (
        <div style={{ padding: '15px 0', fontSize: '15px', lineHeight: '2' }}>
          <p><strong>Tên phòng:</strong> {bookingModal?.roomName}</p>
          <p><strong>Giá phòng/đêm:</strong> ${bookingModal?.roomPrice}</p>
          <p><strong>Tổng số đêm chọn:</strong> {selectedDates.length} đêm</p>
          <div style={{ background: '#f5f5f5', padding: '10px', borderRadius: '4px', margin: '10px 0' }}>
            <p style={{ margin: 0 }}><strong>Các ngày đã chọn:</strong></p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
              {selectedDates.map((date) => (
                <span key={date} style={{ background: '#e6f7ff', border: '1px solid #91d5ff', padding: '2px 8px', borderRadius: '4px', fontSize: '12px' }}>
                  {date}
                </span>
              ))}
            </div>
          </div>
          <p style={{ fontSize: '18px', color: '#1890ff', marginTop: '15px' }}>
            <strong>Tổng số tiền:</strong> ${bookingModal?.roomPrice * selectedDates.length}
          </p>
        </div>
      )}

      {step === 3 && (
        <div style={{ padding: '15px 0' }}>
          <div style={{ background: '#e6f7ff', border: '1px solid #91d5ff', padding: '10px', borderRadius: '4px', marginBottom: '15px' }}>
            <p style={{ margin: 0, fontSize: '16px' }}>
              <strong>Tổng số tiền thanh toán:</strong> ${bookingModal?.roomPrice * selectedDates.length}
            </p>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Tên chủ thẻ</label>
            <Input
              placeholder="Ví dụ: NGUYEN VAN A"
              size="large"
              value={paymentInfo.cardName}
              onChange={(e) => setPaymentInfo({ ...paymentInfo, cardName: e.target.value })}
            />
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Số thẻ</label>
            <Input
              placeholder="1234 5678 1234 5678"
              size="large"
              maxLength={19}
              value={paymentInfo.cardNumber}
              onChange={(e) => setPaymentInfo({ 
                ...paymentInfo, 
                cardNumber: e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim() 
              })}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Ngày hết hạn</label>
              <Input
                placeholder="MM/YY"
                size="large"
                maxLength={5}
                value={paymentInfo.cardExpiry}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, '');
                  if (val.length > 2) {
                    val = val.substring(0, 2) + '/' + val.substring(2, 4);
                  }
                  setPaymentInfo({ ...paymentInfo, cardExpiry: val });
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Mã bảo mật CVC</label>
              <Input
                placeholder="123"
                size="large"
                maxLength={3}
                value={paymentInfo.cardCVC}
                onChange={(e) => setPaymentInfo({ ...paymentInfo, cardCVC: e.target.value.replace(/\D/g, '') })}
              />
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

OrderPlaceModal.defaultProps = {
  bookingModal: { open: false, roomId: null }
};

OrderPlaceModal.propTypes = {
  bookingModal: PropTypes.object
};

export default OrderPlaceModal;
