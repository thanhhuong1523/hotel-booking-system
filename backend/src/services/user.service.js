const userRepository = require('../repositories/user.repository');
const { errorResponse, successResponse } = require('../configs/app.response');
const loginResponse = require('../configs/login.response');
const sendEmail = require('../configs/send.mail');
const fs = require('fs');
const appRoot = require('app-root-path');
const crypto = require('crypto');
const logger = require('../middleware/winston.logger');
const MyQueryHelper = require('../configs/api.feature');

class UserService {
  async register(req) {
    const { userName, fullName, email, phone, password, dob, address, gender, role } = req.body;
    const file = req.file;

    try {
      if (!userName || !fullName || !email || !password || !dob || !address) {
        this._deleteUploadedFile(file);
        throw { status: 400, response: errorResponse(1, 'FAILED', 'Please enter all required fields') };
      }

      const [existingUsername, existingEmail, existingPhone] = await Promise.all([
        userRepository.findByUsername(userName),
        userRepository.findOne({ email }),
        phone ? userRepository.findByPhone(phone) : null
      ]);

      if (existingUsername) {
        this._deleteUploadedFile(file);
        throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Username already exists') };
      }
      if (existingEmail) {
        this._deleteUploadedFile(file);
        throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Email already exists') };
      }
      if (existingPhone) {
        this._deleteUploadedFile(file);
        throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Phone number already exists') };
      }

      const avatar = file ? `/uploads/users/${file.filename}` : '/avatar.png';

      const user = await userRepository.create({
        userName, fullName, email, phone, password, avatar, gender, dob, address, role
      });

      return successResponse(0, 'SUCCESS', 'User registered successful', {
        userName: user.userName,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        avatar: process.env.APP_BASE_URL + user.avatar,
        gender: user.gender,
        dob: user.dob,
        address: user.address,
        role: user.role,
        verified: user.verified,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });
    } catch (error) {
      this._deleteUploadedFile(file);
      throw error;
    }
  }

  async login(req) {
    const { email, password } = req.body;
    const { loginType } = req.query;

    if (!email || !password) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Please enter email and password') };
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }

    if (loginType === 'admin' && user.role !== 'admin') {
      throw { status: 406, response: errorResponse(6, 'UNABLE TO ACCESS', 'Access forbidden') };
    }

    if (user.status === 'blocked') {
      throw { status: 406, response: errorResponse(6, 'UNABLE TO ACCESS', 'Access forbidden') };
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'User credentials are incorrect') };
    }

    await userRepository.updateStatus(user._id, 'login');
    return user;
  }

  async logout(userId) {
    await userRepository.updateStatus(userId, 'logout');
    return successResponse(0, 'SUCCESS', 'User logged out successful');
  }

  async forgotPassword(email) {
    const user = await userRepository.findOne({ email });
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.APP_SERVICE_URL}/auth/forgot-password/${resetToken}`;
    const subjects = 'Password Recovery Email';
    const message = 'Click below link to reset your password...';
    const title = 'Recovery Your Password';

    return { user, url, subjects, message, title };
  }

  async resetPassword(token, password, confirmPassword) {
    if (!token || !password || !confirmPassword) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Please enter all required fields') };
    }

    if (password !== confirmPassword) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Password and Confirm password does not match') };
    }

    const user = await userRepository.getResetPasswordUser(token);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Reset Password Token is invalid or has expired') };
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return successResponse(0, 'SUCCESS', 'User password reset successful');
  }

  async changePassword(user, oldPassword, newPassword) {
    if (!oldPassword || !newPassword) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Please enter all required fields') };
    }

    const userWithPassword = await userRepository.findWithPassword(user._id);
    const isPasswordMatch = await userWithPassword.comparePassword(oldPassword);

    if (!isPasswordMatch) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Old password is incorrect') };
    }

    userWithPassword.password = newPassword;
    await userWithPassword.save();

    return successResponse(0, 'SUCCESS', 'Password changed successful');
  }

  async sendEmailVerification(user) {
    if (user.verified) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Your email is already verified') };
    }

    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.APP_SERVICE_URL}/auth/verify-email/${verificationToken}`;
    const subjects = 'User Email Verification';
    const message = 'Click below link to verify your email...';
    const title = 'Verify Your Email';

    return { user, url, subjects, message, title };
  }

  async verifyEmail(token) {
    const user = await userRepository.getEmailVerificationUser(token);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Email verification token is invalid or has expired') };
    }

    user.verified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    return successResponse(0, 'SUCCESS', 'Email verified successful');
  }

  async getCurrentUser(user) {
    return successResponse(0, 'SUCCESS', 'User information get successful', {
      userName: user.userName,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      avatar: process.env.APP_BASE_URL + user.avatar,
      gender: user.gender,
      dob: user.dob,
      address: user.address,
      role: user.role,
      verified: user.verified,
      status: user.status,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    });
  }

  async getUserById(id) {
    const user = await userRepository.findById(id);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };
    }
    // return formatted response tương tự
    return successResponse(0, 'SUCCESS', 'User information get successful', { /* fields */ });
  }

  async updateUser(userId, data) {
    const updatedUser = await userRepository.update(userId, data);
    // return formatted response
    return successResponse(0, 'SUCCESS', 'User info updated successful', { /* fields */ });
  }

  async updateAvatar(user, file) {
    // delete old avatar logic
    if (user.avatar?.includes('/uploads/users')) {
      fs.unlink(`${appRoot}/public${user.avatar}`, () => {});
    }

    const updatedUser = await userRepository.update(user._id, {
      avatar: `/uploads/users/${file.filename}`
    });

    return successResponse(0, 'SUCCESS', 'User avatar updated successful', { /* fields */ });
  }

  async deleteUser(user) {
    await userRepository.delete(user._id);
    this._deleteUserAvatar(user);
    return successResponse(0, 'SUCCESS', 'User deleted successful');
  }

  async getUsersList(req) {
    const query = new MyQueryHelper(userRepository.model.find(), req.query)
      .search('fullName')
      .sort()
      .paginate();

    const users = await query.query;
    const total = await userRepository.countDocuments();

    return successResponse(0, 'SUCCESS', 'Users list found', {
      rows: users,
      total_rows: total,
      // ... pagination
    });
  }

  async blockUser(id, currentUser) {
    if (currentUser._id.toString() === id) {
      throw { status: 400, response: errorResponse(1, 'FAILED', "You can't block yourself") };
    }
    // logic block...
  }

  _deleteUploadedFile(file) {
    if (file?.filename) {
      fs.unlink(`${appRoot}/public/uploads/users/${file.filename}`, (err) => {
        if (err) logger.error(err);
      });
    }
  }

  _deleteUserAvatar(user) {
    if (user?.avatar?.includes('/uploads/users')) {
      fs.unlink(`${appRoot}/public${user.avatar}`, (err) => {
        if (err) logger.error(err);
      });
    }
  }
}

module.exports = new UserService();