const fs = require('fs');
const appRoot = require('app-root-path');
const logger = require('../middleware/winston.logger');
const { errorResponse, successResponse } = require('../configs/app.response');
const userRepository = require('../repositories/user.repository');

class AuthService {
  async register(req) {
    const { userName, fullName, email, phone, password, dob, address, gender, role, hotelId } = req.body;
    const { file } = req;

    try {
      if (!userName || !fullName || !email || !password || !dob || !address || !hotelId) {
        this._deleteUploadFile(file);
        throw { status: 400, response: errorResponse(1, 'FAILED', 'Please enter all required fields') };
      }

      const [existedUsername, existedEmail, existedPhone] = await Promise.all([
        userRepository.findByUsername(userName, hotelId),
        userRepository.findByEmail(email, hotelId),
        phone ? userRepository.findByPhone(phone, hotelId) : null
      ]);

      if (existedUsername) {
        this._deleteUploadFile(file);
        throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Username already exists!') };
      }
      if (existedEmail) {
        this._deleteUploadFile(file);
        throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Email already exists!') };
      }
      if (existedPhone) {
        this._deleteUploadFile(file);
        throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Phone already exists!') };
      }

      const avatar = file ? `/uploads/users/${file.filename}` : '/avatar.png';

      const user = await userRepository.create({
        hotelId, userName, fullName, email, phone, password, avatar, gender, dob, address, role: role || 'user'
      });

      return successResponse(0, 'SUCCESS', 'User registered successfully', {
        userName: user.userName, fullName: user.fullName, email: user.email, phone: user.phone,
        avatar: process.env.APP_BASE_URL + user.avatar, gender: user.gender, dob: user.dob,
        address: user.address, role: user.role, verified: user.verified, status: user.status,
        createdAt: user.createdAt, updatedAt: user.updatedAt
      });
    } catch (error) {
      this._deleteUploadFile(file);
      throw error;
    }
  }

  async login(req) {
    const { email, password } = req.body;
    const { loginType } = req.query;
    const { hotelId } = req.body || {};

    if (!email || !password) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Please enter email and password') };
    }

    const user = await userRepository.findByEmail(email, hotelId);

    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Invalid email or password') };
    }

    if (loginType === 'admin' && user.role !== 'admin') {
      throw { status: 406, response: errorResponse(6, 'UNABLE TO ACCESS', 'Access forbidden') };
    }

    if (user.status === 'blocked') {
      throw { status: 406, response: errorResponse(6, 'UNABLE TO ACCESS', 'Access forbidden') };
    }

    const isPasswordMatch = await user.comparePassword(password);
    if (!isPasswordMatch) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Invalid email or password') };
    }

    await userRepository.updateStatus(user._id, 'login');
    return user;
  }

  async logout(userId) {
    if (!userId) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Unauthorized access. Please login to continue') };
    }
    await userRepository.updateStatus(userId, 'logout');
    return successResponse(0, 'SUCCESS', 'User logged out successful');
  }

  // Các method khác giữ nguyên như phiên bản trước
  async forgotPassword(email, hotelId = null) {
    const user = await userRepository.findByEmail(email, hotelId);
    if (!user) throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };

    const resetToken = user.getResetPasswordToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.APP_BASE_URL}/auth/forgot-password/${resetToken}`;
    return { user, url, subjects: 'Password Recovery Email', message: 'Click this link to reset your password!', title: 'Recovery Your Password' };
  }

  async resetPassword(token, password, confirmPassword) {
    if (password !== confirmPassword) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Password and Confirm password does not match') };
    }
    const user = await userRepository.getResetPasswordUser(token);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Reset Password Token is invalid or has been expired') };
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return successResponse(0, 'SUCCESS', 'User password reset successful');
  }

  async changePassword(userId, oldPassword, newPassword) {
    const user = await userRepository.findWithPassword(userId);
    if (!user) throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };

    const isMatch = await user.comparePassword(oldPassword);
    if (!isMatch) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'User credentials are incorrect') };
    }

    user.password = newPassword;
    await user.save();
    return successResponse(0, 'SUCCESS', 'User password changed successful');
  }

  async sendEmailVerificationLink(user) {
    if (user.verified) {
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Ops! Your mail already verified') };
    }
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    const url = `${process.env.APP_BASE_URL}/auth/verify-email/${verificationToken}`;
    return { user, url, subjects: 'User Email Verification', message: 'Click below link to verify your email...', title: 'Verify Your Email' };
  }

  async emailVerification(token) {
    const user = await userRepository.getEmailVerificationUser(token);
    if (!user) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Email verification token is invalid or has been expired') };
    }

    user.verified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    return successResponse(0, 'SUCCESS', 'User email verification successful');
  }

  async refreshToken(user) {
    if (!user) throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist') };

    const accessToken = user.getJWTToken();
    const refreshToken = user.getJWTRefreshToken();

    return successResponse(0, 'SUCCESS', 'JWT refreshToken generate successful', { accessToken, refreshToken });
  }

  _deleteUploadFile(file) {
    if (file?.filename) {
      fs.unlink(`${appRoot}/public/uploads/users/${file.filename}`, (err) => {
        if (err) logger.error(err);
      });
    }
  }
}

module.exports = new AuthService();
