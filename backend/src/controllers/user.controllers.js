const userService = require('../services/user.service');
const { errorResponse } = require('../configs/app.response');

class UserController {
  async getUser(req, res) {
    try {
      const result = await userService.getCurrentUser(req.user);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async getUserById(req, res) {
    try {
      const result = await userService.getUserById(req.params.id);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async updateUser(req, res) {
    try {
      const result = await userService.updateProfile(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async avatarUpdate(req, res) {
    try {
      const result = await userService.updateAvatar(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async deleteUser(req, res) {
    try {
      const result = await userService.deleteUser(req.user);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async deleteUserById(req, res) {
    try {
      const { user } = req;
      if (user._id.toString() === req.params.id) {
        return res.status(400).json(errorResponse(1, 'FAILED', "Sorry! You can't delete yourself"));
      }
      const result = await userService.deleteUser({ _id: req.params.id });
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async getUsersList(req, res) {
    try {
      const result = await userService.getUsersList(req);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async blockedUser(req, res) {
    try {
      const result = await userService.blockUser(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }

  async unblockedUser(req, res) {
    try {
      const { user } = req;
      const targetUserId = req.params.id;

      if (user._id.toString() === targetUserId) {
        return res.status(400).json(errorResponse(1, 'FAILED', "Sorry! You can't unblock yourself"));
      }

      const result = await userService.unblockUser(targetUserId); // Sẽ thêm vào service nếu chưa có
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
    }
  }
}

const controller = new UserController();

module.exports = {
  getUser: controller.getUser,
  getUserById: controller.getUserById,
  updateUser: controller.updateUser,
  avatarUpdate: controller.avatarUpdate,
  deleteUser: controller.deleteUser,
  deleteUserById: controller.deleteUserById,
  getUsersList: controller.getUsersList,
  blockedUser: controller.blockedUser,
  unblockedUser: controller.unblockedUser
};
