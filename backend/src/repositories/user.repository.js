const User = require('../models/user.model');
const BaseRepository = require('./base.repository');

class UserRepository extends BaseRepository {
  constructor() {
    super(User);
  }

  /**
   * Find user by email with hotel scope
   */
  async findByEmail(email, hotelId = null) {
    const query = { email };
    if (hotelId) query.hotelId = hotelId;
    return this.model.findOne(query).select('+password');
  }

  /**
   * Find user by username with hotel scope
   */
  async findByUsername(username, hotelId = null) {
    const query = { userName: username };
    if (hotelId) query.hotelId = hotelId;
    return this.model.findOne(query);
  }

  /**
   * Find user by phone
   */
  async findByPhone(phone, hotelId = null) {
    const query = { phone };
    if (hotelId) query.hotelId = hotelId;
    return this.model.findOne(query);
  }

  /**
   * Find user by ID
   */
  async findById(id) {
    return this.model.findById(id).populate('hotelId', 'name'); // sau này sẽ có hotel model
  }

  /**
   * Find user with password
   */
  async findWithPassword(userId) {
    return this.model.findById(userId).select('+password');
  }

  /**
   * Update user status
   */
  async updateStatus(id, status) {
    return this.update(id, {
      status,
      updatedAt: Date.now()
    });
  }

  /**
   * Get user for reset password
   */
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

  /**
   * Get user for email verification
   */
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

  /**
   * Get users list with hotel filter (for admin)
   */
  async getUsersList(query = {}, hotelId = null) {
    const filter = { ...query };
    if (hotelId) filter.hotelId = hotelId;
    return this.find(filter);
  }
}

module.exports = new UserRepository();
