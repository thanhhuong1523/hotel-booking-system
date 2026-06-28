const User = require('../models/user.model');
const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  async findByEmail(email) {
    return this.model.findOne({ email }).select('+password');
  }

  async findByUsername(username) {
    return this.model.findOne({ userName: username });
  }

  async findByPhone(phone) {
    return this.model.findOne({ phone });
  }

  async findById(id) {
    return this.model.findById(id);
  }

  async findWithPassword(userId) {
    return this.model.findById(userId).select('+password');
  }

  async updateStatus(id, status) {
    return this.update(id, { status, updatedAt: Date.now() });
  }

  async getResetPasswordUser(token) {
    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return this.model.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });
  }

  async getEmailVerificationUser(token) {
    const emailVerificationToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return this.model.findOne({
      emailVerificationToken,
      emailVerificationExpire: { $gt: Date.now() }
    });
  }

  async getUsersList(filter = {}) {
    return this.find(filter);
  }
}

module.exports = new UserRepository();
