const userRepository = require('../repositories/user.repository');
const roomRepository = require('../repositories/room.repository');
const bookingRepository = require('../repositories/booking.repository');
const { errorResponse, successResponse } = require('../configs/app.response');

class AppsService {
  async getDashboardData(user) {
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }

    // finding all users data from database
    const totalUsers = await userRepository.model.find();

    if (!totalUsers) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Sorry! Any user does not found') };
    }

    // finding all users data from database specific criteria
    const adminRoleUsers = await userRepository.model.find({ role: 'admin' });
    const userRoleUsers = await userRepository.model.find({ role: 'user' });
    const registerStatusUsers = await userRepository.model.find({ status: 'register' });
    const loginStatusUsers = await userRepository.model.find({ status: 'login' });
    const logoutStatusUsers = await userRepository.model.find({ status: 'logout' });
    const blockedStatusUsers = await userRepository.model.find({ status: 'blocked' });
    const verifiedUsers = await userRepository.model.find({ verified: true });

    // finding all room data from database specific criteria
    const totalRooms = await roomRepository.model.find();
    const availableRooms = await roomRepository.model.find({ room_status: 'available' });
    const unavailableRooms = await roomRepository.model.find({ room_status: 'unavailable' });
    const bookedRooms = await roomRepository.model.find({ room_status: 'booked' });

    // finding all booking data from database specific criteria
    const totalBookings = await bookingRepository.model.find();
    const pendingBookings = await bookingRepository.model.find({ booking_status: 'pending' });
    const cancelBookings = await bookingRepository.model.find({ booking_status: 'cancel' });
    const approvedBookings = await bookingRepository.model.find({ booking_status: 'approved' });
    const rejectedBookings = await bookingRepository.model.find({ booking_status: 'rejected' });
    const inReviewsBookings = await bookingRepository.model.find({ booking_status: 'in-reviews' });
    const completedBookings = await bookingRepository.model.find({ booking_status: 'completed' });

    return successResponse(0, 'SUCCESS', 'Dashboard information get successful', {
      users_info: {
        total_users: totalUsers?.length || 0,
        admin_role_user: adminRoleUsers?.length || 0,
        user_role_user: userRoleUsers?.length || 0,
        register_status_user: registerStatusUsers?.length || 0,
        login_status_user: loginStatusUsers?.length || 0,
        logout_status_user: logoutStatusUsers?.length || 0,
        blocked_status_user: blockedStatusUsers?.length || 0,
        verified_user: verifiedUsers?.length || 0
      },
      rooms_info: {
        total_rooms: totalRooms?.length || 0,
        available_rooms: availableRooms?.length || 0,
        unavailable_rooms: unavailableRooms?.length || 0,
        booked_rooms: bookedRooms?.length || 0
      },
      booking_info: {
        total_bookings: totalBookings?.length || 0,
        pending_bookings: pendingBookings?.length || 0,
        cancel_bookings: cancelBookings?.length || 0,
        approved_bookings: approvedBookings?.length || 0,
        rejected_bookings: rejectedBookings?.length || 0,
        in_reviews_bookings: inReviewsBookings?.length || 0,
        completed_bookings: completedBookings?.length || 0
      }
    });
  }
}

module.exports = new AppsService();
