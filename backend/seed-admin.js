/* eslint-disable no-process-exit, arrow-parens */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  let admin = await User.findOne({ userName: 'admin' });

  if (admin) {
    admin.email = 'admintest123@gmail.com';
    admin.password = 'admin123';
    admin.role = 'admin';
    admin.verified = true;
    await admin.save();
    console.log('Admin account already existed. Password updated to admin123, email updated to admintest123@gmail.com and role set to admin.');
  } else {
    admin = new User({
      userName: 'admin',
      fullName: 'System Administrator',
      email: 'admintest123@gmail.com',
      phone: '0123456789',
      password: 'admin123',
      gender: 'male',
      dob: new Date('1990-01-01'),
      address: 'Beach Resort Hotel',
      role: 'admin',
      verified: true,
      status: 'logout'
    });
    await admin.save();
    console.log('Successfully seeded default admin account!');
  }
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
