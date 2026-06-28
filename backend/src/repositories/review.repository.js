const Review = require('../models/review.modal');
const BaseRepository = require('./base.repository');

class ReviewRepository extends BaseRepository {
  constructor() {
    super(Review);
  }
}

module.exports = new ReviewRepository();
