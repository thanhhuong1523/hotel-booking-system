/* eslint-disable quotes */
/* eslint-disable global-require */
const authService = require('../services/auth.service');
const { errorResponse } = require('../configs/app.response');
const loginResponse = require('../configs/login.response');

class AuthController {
  async register(req, res) {
    try {
      const result = await authService.register(req);
      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async loginUser(req, res) {
    try {
      console.log("1. Vào controller");

      const user = await authService.login(req);
      console.log("2. Login service OK");

      loginResponse(res, user);
      console.log("3. Login response OK");
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      console.error(error.stack);

      res.status(error.status || 500).json(
        error.response || errorResponse(2, "SERVER SIDE ERROR", error)
      );
    }
  }

  async logoutUser(req, res) {
    try {
      const { user } = req;
      if (!user) {
        return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'Unauthorized access. Please login to continue'));
      }

      const result = await authService.logout(user._id);
      res.clearCookie('AccessToken');
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      const data = await authService.forgotPassword(email);
      require('../configs/send.mail')(res, data.user, data.url, data.subjects, data.message, data.title);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async resetPassword(req, res) {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;
      const result = await authService.resetPassword(token, password, confirmPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async changePassword(req, res) {
    try {
      const { user } = req;
      const { oldPassword, newPassword } = req.body;
      if (!user) return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist'));

      const result = await authService.changePassword(user._id, oldPassword, newPassword);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async sendEmailVerificationLink(req, res) {
    try {
      const { user } = req;
      if (!user) return res.status(404).json(errorResponse(4, 'UNKNOWN ACCESS', 'User does not exist'));

      const data = await authService.sendEmailVerificationLink(user);
      require('../configs/send.mail')(res, data.user, data.url, data.subjects, data.message, data.title);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async emailVerification(req, res) {
    try {
      const { token } = req.params;
      const result = await authService.emailVerification(req.user, token);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async refreshToken(req, res) {
    try {
      const { user } = req;
      const result = await authService.refreshToken(user);
      const options = {
        expires: new Date(Date.now() + process.env.JWT_TOKEN_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
        httpOnly: true
      };
      res.cookie('AccessToken', result.data?.accessToken || '', options);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }
}

const controller = new AuthController();

module.exports = {
  register: controller.register,
  loginUser: controller.loginUser,
  logoutUser: controller.logoutUser,
  forgotPassword: controller.forgotPassword,
  resetPassword: controller.resetPassword,
  changePassword: controller.changePassword,
  sendEmailVerificationLink: controller.sendEmailVerificationLink,
  emailVerification: controller.emailVerification,
  refreshToken: controller.refreshToken
};
