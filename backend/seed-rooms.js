/* eslint-disable no-process-exit, arrow-parens, no-shadow, no-plusplus, no-await-in-loop, no-continue, no-nested-ternary, no-unused-vars */
require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Room = require('./src/models/room.model');
const User = require('./src/models/user.model');

// Images are pre-generated and compressed in public/uploads/rooms/ as room-1.jpg, room-2.jpg, room-3.jpg

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(async () => {
  // Find the admin user to assign as created_by
  const adminUser = await mongoose.model('Users').findOne({ role: 'admin' });
  if (!adminUser) {
    console.error('No admin user found. Please run seed-admin.js first!');
    process.exit(1);
  }

  // Clear all existing rooms to ensure a clean seed of exactly 30 rooms across 3 floors
  await Room.deleteMany({});
  console.log('Cleared all existing rooms.');

  // Delete the heavy image from disk if it exists
  const uploadsDir = path.join(__dirname, 'public', 'uploads', 'rooms');
  const heavyImagePath = path.join(uploadsDir, 'phong-khach-san-tt-studio-1782668380215.jpg');
  if (fs.existsSync(heavyImagePath)) {
    try {
      fs.unlinkSync(heavyImagePath);
      console.log('Deleted heavy image phong-khach-san-tt-studio-1782668380215.jpg');
    } catch (err) {
      console.error('Error deleting heavy image:', err);
    }
  }

  // Seed 30 rooms (10 rooms per floor for floors 1, 2, 3)
  const roomTypes = ['single', 'couple', 'family', 'presidential'];
  const facilities = ['Wifi', 'TV', 'AC', 'Mini Bar', 'Parking', 'Pool'];
  const floors = [1, 2, 3];

  for (const floor of floors) {
    for (let r = 1; r <= 10; r++) {
      const roomNum = floor * 100 + r; // 101-110, 201-210, 301-310
      const roomName = `Room ${roomNum}`;
      const roomSlug = `room-${roomNum}`;

      const type = roomTypes[Math.floor(Math.random() * roomTypes.length)];
      const price = Math.floor(50 + Math.random() * 250);
      const size = Math.floor(20 + Math.random() * 60);
      const capacity = type === 'single' ? 1 : (type === 'couple' ? 2 : (type === 'family' ? 4 : 6));
      const roomImages = [
        { url: `/uploads/rooms/room-${1 + (roomNum % 3)}.jpg` }
      ];

      const newRoom = new Room({
        room_name: roomName,
        room_slug: roomSlug,
        room_type: type,
        room_price: price,
        room_size: size,
        room_capacity: capacity,
        allow_pets: Math.random() > 0.5,
        provide_breakfast: Math.random() > 0.5,
        featured_room: Math.random() > 0.7,
        room_description: `This is a beautiful and spacious ${type} room on floor ${floor} with premium quality amenities.`,
        room_status: 'available',
        extra_facilities: [facilities[roomNum % 6], facilities[(roomNum + 1) % 6]],
        room_images: roomImages,
        created_by: adminUser._id
      });

      await newRoom.save();
      console.log(`Seeded: ${roomName}`);
    }
  }

  console.log('Seeding of 30 rooms completed successfully.');
  process.exit(0);
}).catch(err => {
  console.error('Database connection or seeding error:', err);
  process.exit(1);
});
