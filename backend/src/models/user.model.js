const mongoose = require('mongoose');
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const usersSchema = new mongoose.Schema({
  userName: {
    type: String,
    trim: true,
    unique: true,
    lowercase: true,
    required: [true, 'User name field is required'],
    index: true
  },
  fullName: {
    type: String,
    required: [true, 'Full name field is required']
  },
  email: {
    type: String,
    unique: true,
    required: [true, 'Email field is required'],
    validate: [validator.isEmail, 'Please enter a valid email address'],
    index: true
  },
  phone: {
    type: String,
    unique: true,
    validate: [validator.isMobilePhone, 'Please enter a valid phone number']
  },
  password: {
    type: String,
    required: [true, 'Password field is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  avatar: {
    type: String,
    default: '/avatar.png'
  },
  gender: {
    type: String,
    enum: ['male', 'female']
  },
  dob: {
    type: Date,
    required: [true, 'Date of birth field is required']
  },
  address: {
    type: String,
    required: [true, 'Address field is required']
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['register', 'login', 'logout', 'blocked'],
    default: 'register'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  emailVerificationToken: String,
  emailVerificationExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Replace spaces with dashes in userName before saving
usersSchema.pre('save', function (next) {
  if (this.userName) {
    this.userName = this.userName.replace(/\s/g, '-');
  }
  next();
});

// Hash password before save
usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 8);
  next();
});

// JWT Access Token
usersSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES
  });
};

// JWT Refresh Token
usersSchema.methods.getJWTRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_REFRESH_TOKEN_SECRET_KEY, {
    expiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES
  });
};

// Compare password
usersSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

// Generate password reset token
usersSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString('hex');
  this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  return resetToken;
};

// Generate email verification token
usersSchema.methods.getEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(20).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(verificationToken).digest('hex');
  this.emailVerificationExpire = Date.now() + 15 * 60 * 1000;
  return verificationToken;
};

usersSchema.index({ email: 1 });
usersSchema.index({ userName: 1 });
usersSchema.index({ role: 1 });

module.exports = mongoose.model('Users', usersSchema);
