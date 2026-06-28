const Booking = require('../models/booking.model');
const BaseRepository = require('./base.repository');

class BookingRepository extends BaseRepository {
  constructor() {
    super(Booking);
  }
}

module.exports = new BookingRepository();
