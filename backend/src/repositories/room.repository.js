const Room = require('../models/room.model');
const BaseRepository = require('./base.repository');

class RoomRepository extends BaseRepository {
  constructor() {
    super(Room);
  }
}

module.exports = new RoomRepository();
