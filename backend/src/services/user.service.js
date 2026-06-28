/* eslint-disable no-unused-vars */
const fs = require('fs');
const appRoot = require('app-root-path');
const logger = require('../middleware/winston.logger');
const { errorResponse, successResponse } = require('../configs/app.response');
const userRepository = require('../repositories/user.repository');
const MyQueryHelper = require('../configs/api.feature');

class UserService {
  async getCurrentUser(user) {
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }
    return successResponse(0, 'SUCCESS', 'User information get successful', {
      userName: user.userName, fullName: user.fullName, email: user.email, phone: user.phone,
      avatar: process.env.APP_BASE_URL + user.avatar, gender: user.gender, dob: user.dob,
      address: user.address, role: user.role, verified: user.verified, status: user.status,
      createdAt: user.createdAt, updatedAt: user.updatedAt
    });
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }
    return successResponse(0, 'SUCCESS', 'User information get successful', {
      id: user._id, userName: user.userName, fullName: user.fullName, email: user.email,
      phone: user.phone, avatar: process.env.APP_BASE_URL + user.avatar, gender: user.gender,
      dob: user.dob, address: user.address, role: user.role, verified: user.verified,
      status: user.status, createdAt: user.createdAt, updatedAt: user.updatedAt
    });
  }

  async updateProfile(req) {
    const { user } = req;
    const { fullName, phone, gender, dob, address } = req.body;

    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }

    if (!fullName || !phone || !gender || !dob || !address) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Please enter all required fields') };
    }

    const updatedUser = await userRepository.update(user._id, {
      fullName, phone, gender, dob, address
    });

    return successResponse(0, 'SUCCESS', 'User info updated successful', {
      userName: updatedUser.userName, fullName: updatedUser.fullName, email: updatedUser.email,
      phone: updatedUser.phone, avatar: process.env.APP_BASE_URL + updatedUser.avatar,
      gender: updatedUser.gender, dob: updatedUser.dob, address: updatedUser.address,
      role: updatedUser.role, verified: updatedUser.verified, status: updatedUser.status,
      createdAt: updatedUser.createdAt, updatedAt: updatedUser.updatedAt
    });
  }

  async updateAvatar(req) {
    const { user, file } = req;

    if (!user) {
      this._deleteUploadFile(file);
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }

    if (!file) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'User avatar field is required') };
    }

    // Delete old avatar
    if (user.avatar && user.avatar.includes('/uploads/users')) {
      this._deleteOldAvatar(user.avatar);
    }

    const updatedUser = await userRepository.update(user._id, {
      avatar: `/uploads/users/${file.filename}`
    });

    return successResponse(0, 'SUCCESS', 'User avatar updated successful', {
      userName: updatedUser.userName, fullName: updatedUser.fullName, email: updatedUser.email,
      phone: updatedUser.phone, avatar: process.env.APP_BASE_URL + updatedUser.avatar,
      gender: updatedUser.gender, dob: updatedUser.dob, address: updatedUser.address,
      role: updatedUser.role, verified: updatedUser.verified, status: updatedUser.status,
      createdAt: updatedUser.createdAt, updatedAt: updatedUser.updatedAt
    });
  }

  async deleteUser(user) {
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }

    await userRepository.delete(user._id);

    if (user.avatar && user.avatar.includes('/uploads/users')) {
      this._deleteOldAvatar(user.avatar);
    }

    return successResponse(0, 'SUCCESS', 'User delete from database successful');
  }

  async getUsersList(req) {
    const { user } = req;
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }

    const users = await userRepository.getUsersList({}, user.hotelId); // filter by hotel
    const query = new MyQueryHelper(userRepository.model.find({ hotelId: user.hotelId }), req.query)
      .search('fullName').sort().paginate();

    const findUsers = await query.query;

    const mappedUsers = findUsers.map((data) => ({
      id: data._id, userName: data.userName, fullName: data.fullName, email: data.email,
      phone: data.phone, avatar: process.env.APP_BASE_URL + data.avatar, gender: data.gender,
      dob: data.dob, address: data.address, role: data.role, verified: data.verified,
      status: data.status, createdAt: data.createdAt, updatedAt: data.updatedAt
    }));

    return successResponse(0, 'SUCCESS', 'Users list data found successful', {
      rows: mappedUsers,
      total_rows: users.length,
      response_rows: findUsers.length,
      total_page: Math.ceil(users.length / (req.query.limit || 10)),
      current_page: parseInt(req.query.page || 1, 10)
    });
  }

  async blockUser(id, currentUser) {
    if (currentUser._id.toString() === id) {
      throw { status: 400, response: errorResponse(1, 'FAILED', "Sorry! You can't self blocked") };
    }

    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }
    if (user.status === 'blocked') {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Ops! User already blocked') };
    }

    const blockedUser = await userRepository.update(id, { status: 'blocked' });
    return successResponse(0, 'SUCCESS', 'User blocked successful', { /* user data */ });
  }

  // Helper
  _deleteOldAvatar(avatarPath) {
    fs.unlink(`${appRoot}/public${avatarPath}`, (err) => {
      if (err) logger.error(err);
    });
  }

  _deleteUploadFile(file) {
    if (file?.filename) {
      fs.unlink(`${appRoot}/public/uploads/users/${file.filename}`, (err) => {
        if (err) logger.error(err);
      });
    }
  }
}

module.exports = new UserService();
