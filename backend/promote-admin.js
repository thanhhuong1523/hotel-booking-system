/* eslint-disable no-process-exit, arrow-parens */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/user.model');

const emailOrUsername = process.argv[2];

if (!emailOrUsername) {
  console.log('Usage: node promote-admin.js <email_or_username>');
  process.exit(1);
}

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  const user = await User.findOne({
    $or: [
      { email: emailOrUsername },
      { userName: emailOrUsername }
    ]
  });

  if (!user) {
    console.log(`User not found: ${emailOrUsername}`);
    process.exit(1);
  }

  user.role = 'admin';
  await user.save({ validateBeforeSave: false });
  console.log(`Successfully promoted ${user.userName} (${user.email}) to ADMIN!`);
  process.exit(0);
}).catch(err => {
  console.error('Error connecting to database:', err);
  process.exit(1);
});
