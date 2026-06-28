const roomRepository = require('../repositories/room.repository');
const bookingRepository = require('../repositories/booking.repository');
const { errorResponse, successResponse } = require('../configs/app.response');
const MyQueryHelper = require('../configs/api.feature');
const { bookingDatesBeforeCurrentDate } = require('../lib/booking.dates.validator');

class BookingService {
  async placedBookingOrder(req) {
    let myRoom = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      myRoom = await roomRepository.findById(req.params.id);
    } else {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Something went wrong. Probably room id missing/incorrect') };
    }

    if (!myRoom) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Room does not exist') };
    }

    if (myRoom.room_status === 'unavailable') {
      throw { status: 400, response: errorResponse(1, 'FAILED', "Sorry! Current your sleeted room can't available") };
    }

    if (myRoom.room_status === 'booked') {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Sorry! Current your sleeted already booked. Please try again later') };
    }

    const total_price = myRoom.room_price * req.body.booking_dates.length;

    const data = {
      room_id: req.params.id,
      booking_dates: req.body.booking_dates,
      booking_by: req.user.id,
      total_price,
      payment_status: req.body.payment_status || 'unpaid',
      payment_method: req.body.payment_method || 'none'
    };

    const booking = await bookingRepository.create(data);

    return successResponse(0, 'SUCCESS', 'Your room booking order placed successful. Please wait for confirmation.', booking);
  }

  async getBookingOrderByUserId(req) {
    const myBooking = await bookingRepository.model.find({ booking_by: req.user.id })
      .populate('room_id')
      .populate('booking_by')
      .populate({
        path: 'reviews',
        populate: { path: 'user_id', model: 'Users' }
      });

    if (!myBooking || myBooking.length === 0) {
      return successResponse(0, 'SUCCESS', 'No bookings found', {
        rows: [],
        total_rows: 0,
        response_rows: 0,
        total_page: 0,
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
      });
    }

    const bookingQuery = new MyQueryHelper(bookingRepository.model.find({ booking_by: req.user.id })
      .populate('room_id')
      .populate('booking_by')
      .populate({ path: 'reviews', populate: { path: 'user_id', model: 'Users' } }), req.query)
      .sort()
      .paginate();
    const findBooking = await bookingQuery.query;

    const mapperBooking = findBooking?.map((data) => ({
      id: data?._id,
      booking_dates: data?.booking_dates,
      booking_status: data?.booking_status,
      total_price: data?.total_price,
      payment_status: data?.payment_status,
      payment_method: data?.payment_method,
      reviews: !data?.reviews ? null : {
        id: data?.reviews?._id,
        room_id: data?.reviews.room_id,
        booking_id: data?.reviews.booking_id,
        rating: data?.reviews.rating,
        message: data?.reviews.message,
        reviews_by: {
          id: data?.reviews?.user_id?._id,
          userName: data?.reviews?.user_id?.userName,
          fullName: data?.reviews?.user_id?.fullName,
          email: data?.reviews?.user_id?.email,
          phone: data?.reviews?.user_id?.phone,
          avatar: process.env.APP_BASE_URL + data?.reviews?.user_id?.avatar,
          gender: data?.reviews?.user_id?.gender,
          dob: data?.reviews?.user_id?.dob,
          address: data?.reviews?.user_id?.address,
          role: data?.reviews?.user_id?.role,
          verified: data?.reviews?.user_id?.verified,
          status: data?.reviews?.user_id?.status,
          createdAt: data?.reviews?.user_id?.createdAt,
          updatedAt: data?.reviews?.user_id?.updatedAt
        },
        created_at: data?.reviews?.createdAt,
        updated_at: data?.reviews?.updatedAt
      },
      booking_by: {
        id: data?.booking_by?._id,
        userName: data?.booking_by?.userName,
        fullName: data?.booking_by?.fullName,
        email: data?.booking_by?.email,
        phone: data?.booking_by?.phone,
        avatar: process.env.APP_BASE_URL + data?.booking_by?.avatar,
        gender: data?.booking_by?.gender,
        dob: data?.booking_by?.dob,
        address: data?.booking_by?.address,
        role: data?.booking_by?.role,
        verified: data?.booking_by?.verified,
        status: data?.booking_by?.status,
        createdAt: data?.booking_by?.createdAt,
        updatedAt: data?.booking_by?.updatedAt
      },
      room: {
        id: data?.room_id?._id,
        room_name: data?.room_id?.room_name,
        room_slug: data?.room_id?.room_slug,
        room_type: data?.room_id?.room_type,
        room_price: data?.room_id?.room_price,
        room_size: data?.room_id?.room_size,
        room_capacity: data?.room_id?.room_capacity,
        allow_pets: data?.room_id?.allow_pets,
        provide_breakfast: data?.room_id?.provide_breakfast,
        featured_room: data?.room_id?.featured_room,
        room_description: data?.room_id?.room_description,
        room_status: data?.room_id?.room_status,
        extra_facilities: data?.room_id?.extra_facilities,
        room_images: data?.room_id?.room_images?.map(
          (img) => ({ url: process.env.APP_BASE_URL + img.url })
        )
      },
      created_at: data?.createdAt,
      updated_at: data?.updatedAt
    }));

    return successResponse(0, 'SUCCESS', 'Booking list retrieved successful', {
      rows: mapperBooking,
      total_rows: myBooking.length,
      response_rows: findBooking.length,
      total_page: req?.query?.keyword ? Math.ceil(findBooking.length / req.query.limit) : Math.ceil(myBooking.length / req.query.limit),
      current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
    });
  }

  async cancelSelfBookingOrder(req) {
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      booking = await bookingRepository.model.findOne({ _id: req.params.id, booking_by: req.user._id });
    } else {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Something went wrong. Probably booking id missing/incorrect') };
    }

    if (!booking) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Booking not found or you are not authorized to cancel this booking') };
    }

    if (booking.booking_status !== 'pending') {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'This booking cannot be `cancel` as it is no longer in the `pending` status') };
    }

    booking.booking_status = 'cancel';
    await booking.save({ validateBeforeSave: false });

    return successResponse(0, 'SUCCESS', 'Booking order has been canceled successful', booking);
  }

  async getBookingOrderForAdmin(req) {
    const myBooking = await bookingRepository.model.find()
      .populate('room_id')
      .populate('booking_by')
      .populate({
        path: 'reviews',
        populate: { path: 'user_id', model: 'Users' }
      });

    if (!myBooking || myBooking.length === 0) {
      return successResponse(0, 'SUCCESS', 'No bookings found', {
        rows: [],
        total_rows: 0,
        response_rows: 0,
        total_page: 0,
        current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
      });
    }

    const bookingQuery = new MyQueryHelper(bookingRepository.model.find()
      .populate('room_id')
      .populate('booking_by')
      .populate({ path: 'reviews', populate: { path: 'user_id', model: 'Users' } }), req.query)
      .sort()
      .paginate();
    const findBooking = await bookingQuery.query;

    const mapperBooking = findBooking?.map((data) => ({
      id: data?._id,
      booking_dates: data?.booking_dates,
      booking_status: data?.booking_status,
      total_price: data?.total_price,
      payment_status: data?.payment_status,
      payment_method: data?.payment_method,
      reviews: !data?.reviews ? null : {
        id: data?.reviews?._id,
        room_id: data?.reviews.room_id,
        booking_id: data?.reviews.booking_id,
        rating: data?.reviews.rating,
        message: data?.reviews.message,
        reviews_by: {
          id: data?.reviews?.user_id?._id,
          userName: data?.reviews?.user_id?.userName,
          fullName: data?.reviews?.user_id?.fullName,
          email: data?.reviews?.user_id?.email,
          phone: data?.reviews?.user_id?.phone,
          avatar: process.env.APP_BASE_URL + data?.reviews?.user_id?.avatar,
          gender: data?.reviews?.user_id?.gender,
          dob: data?.reviews?.user_id?.dob,
          address: data?.reviews?.user_id?.address,
          role: data?.reviews?.user_id?.role,
          verified: data?.reviews?.user_id?.verified,
          status: data?.reviews?.user_id?.status,
          createdAt: data?.reviews?.user_id?.createdAt,
          updatedAt: data?.reviews?.user_id?.updatedAt
        },
        created_at: data?.reviews?.createdAt,
        updated_at: data?.reviews?.updatedAt
      },
      booking_by: {
        id: data?.booking_by?._id,
        userName: data?.booking_by?.userName,
        fullName: data?.booking_by?.fullName,
        email: data?.booking_by?.email,
        phone: data?.booking_by?.phone,
        avatar: process.env.APP_BASE_URL + data?.booking_by?.avatar,
        gender: data?.booking_by?.gender,
        dob: data?.booking_by?.dob,
        address: data?.booking_by?.address,
        role: data?.booking_by?.role,
        verified: data?.booking_by?.verified,
        status: data?.booking_by?.status,
        createdAt: data?.booking_by?.createdAt,
        updatedAt: data?.booking_by?.updatedAt
      },
      room: {
        id: data?.room_id?._id,
        room_name: data?.room_id?.room_name,
        room_slug: data?.room_id?.room_slug,
        room_type: data?.room_id?.room_type,
        room_price: data?.room_id?.room_price,
        room_size: data?.room_id?.room_size,
        room_capacity: data?.room_id?.room_capacity,
        allow_pets: data?.room_id?.allow_pets,
        provide_breakfast: data?.room_id?.provide_breakfast,
        featured_room: data?.room_id?.featured_room,
        room_description: data?.room_id?.room_description,
        room_status: data?.room_id?.room_status,
        extra_facilities: data?.room_id?.extra_facilities,
        room_images: data?.room_id?.room_images?.map(
          (img) => ({ url: process.env.APP_BASE_URL + img.url })
        )
      },
      created_at: data?.createdAt,
      updated_at: data?.updatedAt
    }));

    return successResponse(0, 'SUCCESS', 'Booking list retrieved successful', {
      rows: mapperBooking,
      total_rows: myBooking.length,
      response_rows: findBooking.length,
      total_page: req?.query?.keyword ? Math.ceil(findBooking.length / req.query.limit) : Math.ceil(myBooking.length / req.query.limit),
      current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
    });
  }

  async updatedBookingOrderByAdmin(req) {
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      booking = await bookingRepository.findOne({ _id: req.params.id });
    } else {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Something went wrong. Probably booking id missing/incorrect') };
    }

    if (!booking) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Booking not found or you are not authorized to cancel this booking') };
    }

    if (!req.body.booking_status) {
      throw { status: 400, response: errorResponse(1, 'FAILED', '`booking_status` filed is required') };
    }

    let myRoom = null;
    myRoom = await roomRepository.findById(booking.room_id);

    if (!myRoom) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Room does not exist') };
    }

    switch (req.body.booking_status) {
      case 'approved':
        if (booking.booking_status === 'pending') {
          if (!bookingDatesBeforeCurrentDate(booking?.booking_dates).isAnyDateInPast) {
            booking.booking_status = 'approved';
            await booking.save({ validateBeforeSave: false });

            myRoom.room_status = 'booked';
            await myRoom.save({ validateBeforeSave: false });
          } else {
            throw { status: 400, response: errorResponse(1, 'FAILED', 'Sorry! This booking cannot be `approved` because of booking data is past') };
          }
        } else {
          throw { status: 400, response: errorResponse(1, 'FAILED', 'This booking cannot be `approved` as it is no longer in the `pending` status') };
        }
        break;
      case 'rejected':
        if (booking.booking_status === 'pending') {
          booking.booking_status = 'rejected';
          await booking.save({ validateBeforeSave: false });
        } else {
          throw { status: 400, response: errorResponse(1, 'FAILED', 'This booking cannot be `rejected` as it is no longer in the `pending` status') };
        }
        break;
      case 'in-reviews':
        if (booking.booking_status === 'approved') {
          if (bookingDatesBeforeCurrentDate(booking?.booking_dates).isAnyDateInPast) {
            booking.booking_status = 'in-reviews';
            await booking.save({ validateBeforeSave: false });

            myRoom.room_status = 'available';
            await myRoom.save({ validateBeforeSave: false });
          } else {
            throw { status: 400, response: errorResponse(1, 'FAILED', 'Sorry! This booking cannot be `in-reviews` because of booking data is not feature') };
          }
        } else {
          throw { status: 400, response: errorResponse(1, 'FAILED', 'This booking cannot be `in-reviews` as it is no longer in the `approved` status') };
        }
        break;
      default:
        throw { status: 400, response: errorResponse(1, 'FAILED', `Your provided booking_status '${req.body.booking_status}' can't match our system. Please try again using a correct booking_status`) };
    }

    return successResponse(0, 'SUCCESS', `Booking order has been '${booking.booking_status}' successful`, booking);
  }

  async checkoutBookingOrder(req) {
    let booking = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      booking = await bookingRepository.findOne({ _id: req.params.id });
    } else {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Something went wrong. Probably booking id missing/incorrect') };
    }

    if (!booking) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Booking not found') };
    }

    // Only the user who booked it or an admin can checkout
    if (req.user.role !== 'admin' && booking.booking_by.toString() !== req.user._id.toString()) {
      throw { status: 403, response: errorResponse(6, 'UNABLE TO ACCESS', 'You are not authorized to checkout this booking') };
    }

    if (booking.booking_status !== 'approved') {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'This booking cannot be checked out because its status is not approved') };
    }

    booking.booking_status = 'completed';
    await booking.save({ validateBeforeSave: false });

    // Set room status back to available
    const myRoom = await roomRepository.findById(booking.room_id);
    if (myRoom) {
      myRoom.room_status = 'available';
      await myRoom.save({ validateBeforeSave: false });
    }

    return successResponse(0, 'SUCCESS', 'Checkout completed successfully. Room is now available.', booking);
  }
}

module.exports = new BookingService();
