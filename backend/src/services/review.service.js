const reviewRepository = require('../repositories/review.repository');
const bookingRepository = require('../repositories/booking.repository');
const { errorResponse, successResponse } = require('../configs/app.response');
const MyQueryHelper = require('../configs/api.feature');

class ReviewService {
  async roomReviewAdd(req) {
    const { rating, message } = req.body;

    if (!rating) {
      throw { status: 400, response: errorResponse(1, 'FAILED', '`rating` filed is required') };
    }
    if (!message) {
      throw { status: 400, response: errorResponse(1, 'FAILED', '`message` filed is required') };
    }

    let myBooking = null;
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      myBooking = await bookingRepository.findById(req.params.id);
    } else {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Something went wrong. Probably booking id missing/incorrect') };
    }

    if (!myBooking) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Booking does not exist') };
    }

    if (myBooking.reviews) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Sorry! This booking already add an review') };
    }

    if (myBooking.booking_status !== 'in-reviews' && myBooking.booking_status !== 'completed') {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Invalid booking status for adding a review') };
    }

    const newReview = await reviewRepository.create({
      user_id: req.user.id,
      room_id: myBooking.room_id,
      booking_id: req.params.id,
      rating,
      message
    });

    myBooking.reviews = newReview._id;
    myBooking.booking_status = 'completed';
    await myBooking.save({ validateBeforeSave: false });

    return successResponse(0, 'SUCCESS', 'Your room booking order placed successful', newReview);
  }

  async getRoomReviewsList(req) {
    let myReviews = null;

    if (/^[0-9a-fA-F]{24}$/.test(req.params.room_id)) {
      myReviews = await reviewRepository.model.find({ room_id: req.params.room_id }).populate('user_id');
    } else {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Something went wrong. Probably booking id missing/incorrect') };
    }

    if (!myReviews) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Review does not exist') };
    }

    const reviewQuery = new MyQueryHelper(reviewRepository.model.find({ room_id: req.params.room_id }).populate('user_id'), req.query)
      .sort()
      .paginate();
    const findReviews = await reviewQuery.query;

    const mapperReviews = findReviews?.map((data) => ({
      id: data?.id,
      rating: data?.rating,
      message: data?.message,
      room_id: data?.room_id,
      booking_id: data?.booking_id,
      reviews_by: {
        id: data?.user_id?._id,
        userName: data?.user_id?.userName,
        fullName: data?.user_id?.fullName,
        email: data?.user_id?.email,
        phone: data?.user_id?.phone,
        avatar: process.env.APP_BASE_URL + data?.user_id?.avatar,
        gender: data?.user_id?.gender,
        dob: data?.user_id?.dob,
        address: data?.user_id?.address,
        role: data?.user_id?.role,
        verified: data?.user_id?.verified,
        status: data?.user_id?.status,
        createdAt: data?.user_id?.createdAt,
        updatedAt: data?.user_id?.updatedAt
      },
      created_at: data?.createdAt,
      updated_at: data?.updatedAt
    }));

    return successResponse(0, 'SUCCESS', 'Reviews list retrieved successful', {
      rows: mapperReviews,
      total_rows: myReviews.length,
      response_rows: findReviews.length,
      total_page: req?.query?.keyword ? Math.ceil(findReviews.length / req.query.limit) : Math.ceil(myReviews.length / req.query.limit),
      current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
    });
  }

  async editSelfRoomReview(req) {
    const { rating, message } = req.body;

    if (!rating) {
      throw { status: 400, response: errorResponse(1, 'FAILED', '`rating` filed is required') };
    }
    if (!message) {
      throw { status: 400, response: errorResponse(1, 'FAILED', '`message` filed is required') };
    }

    let myReview = null;
    if (/^[0-9a-fA-F]{24}$/.test(req.params.review_id)) {
      myReview = await reviewRepository.model.findById(req.params.review_id).populate('user_id');
    } else {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Something went wrong. Probably booking id missing/incorrect') };
    }

    if (!myReview) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Review does not exist') };
    }

    if (myReview?.user_id?.id !== req?.user?.id) {
      throw { status: 406, response: errorResponse(6, 'UNABLE TO ACCESS', 'Sorry! You can update only self room reviews') };
    }

    const updatedReview = await reviewRepository.update(
      req.params.review_id,
      { rating, message }
    );

    return successResponse(0, 'SUCCESS', 'Your room review update successful', updatedReview);
  }
}

module.exports = new ReviewService();
