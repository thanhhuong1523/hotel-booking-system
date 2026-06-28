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

  async findWithPassword(userId) {
    return this.model.findById(userId).select('+password');
  }

  async updateStatus(id, status) {
    return this.update(id, { status, updatedAt: Date.now() });
  }

  async getResetPasswordUser(token) {
    // eslint-disable-next-line global-require
    const resetPasswordToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return this.model.findOne({ resetPasswordToken, resetPasswordExpires: { $gt: Date.now() } });
  }

  async getEmailVerificationUser(token) {
    // eslint-disable-next-line global-require
    const emailVerificationToken = require('crypto')
      .createHash('sha256')
      .update(token)
      .digest('hex');

    return this.model.findOne({ emailVerificationToken, emailVerificationExpires: { $gt: Date.now() } });
  }
}

module.exports = UserRepository;
