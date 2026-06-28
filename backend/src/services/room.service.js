const fs = require('fs');
const appRoot = require('app-root-path');
const logger = require('../middleware/winston.logger');
const roomRepository = require('../repositories/room.repository');
const { errorResponse, successResponse } = require('../configs/app.response');
const MyQueryHelper = require('../configs/api.feature');

class RoomService {
  async createRoom(req) {
    const {
      room_name, room_slug, room_type, room_price, room_size, room_capacity, allow_pets, provide_breakfast, featured_room, room_description, extra_facilities
    } = req.body;

    const deleteFiles = () => {
      if (req.files) {
        for (const element of req.files) {
          fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
            if (err) { logger.error(err); }
          });
        }
      }
    };

    // check fields
    if (!room_name) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_name` filed is required') };
    }
    if (!room_slug) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_slug` filed is required') };
    }
    if (!room_type) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_type` filed is required') };
    }
    if (!room_price) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_price` filed is required') };
    }
    if (!room_size) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_size` filed is required') };
    }
    if (!room_capacity) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_capacity` filed is required') };
    }
    if (!room_description) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_description` filed is required') };
    }
    if (!extra_facilities || !extra_facilities[0]) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Minimum 1 `extra_facilities` filed is required') };
    }
    if (!req.files || !req.files[0]) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Minimum 1 `room_images` filed is required') };
    }

    // check if room_name already exist
    const roomName = await roomRepository.findOne({ room_name });
    if (roomName) {
      deleteFiles();
      throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Sorry, `room_name` already exists') };
    }

    // check if room_slug already exist
    const roomSlug = await roomRepository.findOne({ room_slug });
    if (roomSlug) {
      deleteFiles();
      throw { status: 409, response: errorResponse(9, 'ALREADY EXIST', 'Sorry, `room_slug` already exists') };
    }

    const data = {
      room_name,
      room_slug,
      room_type,
      room_price,
      room_size,
      room_capacity,
      allow_pets,
      provide_breakfast,
      featured_room,
      room_description,
      extra_facilities,
      room_images: req.files.map((file) => ({ url: `/uploads/rooms/${file.filename}` })),
      created_by: req.user.id
    };

    const room = await roomRepository.create(data);
    return successResponse(0, 'SUCCESS', 'New room create successful', room);
  }

  async getRoomsList(req) {
    const rooms = await roomRepository.find();
    const roomQuery = new MyQueryHelper(roomRepository.model.find(), req.query).search('room_name').sort().paginate();
    const findRooms = await roomQuery.query;

    const mappedRooms = findRooms?.map((data) => ({
      id: data._id,
      room_name: data.room_name,
      room_slug: data.room_slug,
      room_type: data.room_type,
      room_price: data.room_price,
      room_size: data.room_size,
      room_capacity: data.room_capacity,
      allow_pets: data.allow_pets,
      provide_breakfast: data.provide_breakfast,
      featured_room: data.featured_room,
      room_description: data.room_description,
      room_status: data.room_status,
      extra_facilities: data.extra_facilities,
      room_images: data?.room_images?.map(
        (img) => ({ url: process.env.APP_BASE_URL + img.url })
      ),
      created_by: data.created_by,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    }));

    return successResponse(0, 'SUCCESS', 'Rooms list data found successful', {
      rows: mappedRooms,
      total_rows: rooms.length,
      response_rows: findRooms.length,
      total_page: req?.query?.keyword ? Math.ceil(findRooms.length / req.query.limit) : Math.ceil(rooms.length / req.query.limit),
      current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
    });
  }

  async getRoomByIdOrSlugName(id) {
    let room = null;

    if (/^[0-9a-fA-F]{24}$/.test(id)) {
      room = await roomRepository.model.findById(id).populate('created_by');
    } else {
      room = await roomRepository.model.findOne({ room_slug: id }).populate('created_by');
    }

    if (!room) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Room does not exist') };
    }

    const organizedRoom = {
      id: room?._id,
      room_name: room?.room_name,
      room_slug: room?.room_slug,
      room_type: room?.room_type,
      room_price: room?.room_price,
      room_size: room?.room_size,
      room_capacity: room?.room_capacity,
      allow_pets: room?.allow_pets,
      provide_breakfast: room?.provide_breakfast,
      featured_room: room?.featured_room,
      room_description: room?.room_description,
      room_status: room?.room_status,
      extra_facilities: room?.extra_facilities,
      room_images: room?.room_images?.map(
        (img) => ({ url: process.env.APP_BASE_URL + img.url })
      ),
      created_by: {
        id: room?.created_by._id,
        userName: room?.created_by.userName,
        fullName: room?.created_by.fullName,
        email: room?.created_by.email,
        phone: room?.created_by.phone,
        avatar: process.env.APP_BASE_URL + room?.created_by.avatar,
        gender: room?.created_by.gender,
        dob: room?.created_by.dob,
        address: room?.created_by.address,
        role: room?.created_by.role,
        verified: room?.created_by.verified,
        status: room?.created_by.status,
        createdAt: room?.created_by.createdAt,
        updatedAt: room?.created_by.updatedAt
      },
      created_at: room?.createdAt,
      updated_at: room?.updatedAt
    };

    return successResponse(0, 'SUCCESS', 'User information get successful', organizedRoom);
  }

  async editRoomByAdmin(req) {
    const {
      room_name, room_slug, room_type, room_price, room_size, room_capacity, allow_pets, provide_breakfast, featured_room, room_description, extra_facilities
    } = req.body;

    const deleteFiles = () => {
      if (req.files) {
        for (const element of req.files) {
          fs.unlink(`${appRoot}/public/uploads/rooms/${element.filename}`, (err) => {
            if (err) { logger.error(err); }
          });
        }
      }
    };

    if (!room_name) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_name` filed is required') };
    }
    if (!room_slug) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_slug` filed is required') };
    }
    if (!room_type) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_type` filed is required') };
    }
    if (!room_price) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_price` filed is required') };
    }
    if (!room_size) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_size` filed is required') };
    }
    if (!room_capacity) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_capacity` filed is required') };
    }
    if (!room_description) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', '`room_description` filed is required') };
    }
    if (!extra_facilities || !extra_facilities[0]) {
      deleteFiles();
      throw { status: 400, response: errorResponse(1, 'FAILED', 'Minimum 1 `extra_facilities` filed is required') };
    }
    let room = null;
    if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
      room = await roomRepository.findById(req.params.id);
    }

    if (!room) {
      deleteFiles();
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Room does not exist') };
    }

    const updateData = {
      room_name,
      room_slug,
      room_type,
      room_price,
      room_size,
      room_capacity,
      allow_pets,
      provide_breakfast,
      featured_room,
      room_description,
      extra_facilities,
      updatedAt: Date.now()
    };

    if (req.files && req.files.length > 0) {
      // delete old images
      for (const element of room.room_images) {
        fs.unlink(`${appRoot}/public/${element.url}`, (err) => {
          if (err) { logger.error(err); }
        });
      }
      updateData.room_images = req.files.map((file) => ({ url: `/uploads/rooms/${file.filename}` }));
    }

    const updatedRoom = await roomRepository.update(
      req.params.id,
      updateData
    );

    return successResponse(0, 'SUCCESS', 'New room updated successful', updatedRoom);
  }

  async deleteRoomById(id) {
    const room = await roomRepository.findById(id);

    if (!room) {
      throw { status: 404, response: errorResponse(4, 'UNKNOWN ACCESS', 'Room does not exist') };
    }

    await roomRepository.delete(room.id);

    // delete old images
    for (const element of room.room_images) {
      fs.unlink(`${appRoot}/public/${element.url}`, (err) => {
        if (err) { logger.error(err); }
      });
    }

    return successResponse(0, 'SUCCESS', 'Room delete form database successful');
  }

  async getFeaturedRoomsList(req) {
    const rooms = await roomRepository.model.find({ featured_room: true });
    const roomQuery = new MyQueryHelper(roomRepository.model.find({ featured_room: true }), req.query).search('room_name').sort().paginate();
    const findRooms = await roomQuery.query;

    const mappedRooms = findRooms?.map((data) => ({
      id: data._id,
      room_name: data.room_name,
      room_slug: data.room_slug,
      room_type: data.room_type,
      room_price: data.room_price,
      room_size: data.room_size,
      room_capacity: data.room_capacity,
      allow_pets: data.allow_pets,
      provide_breakfast: data.provide_breakfast,
      featured_room: data.featured_room,
      room_description: data.room_description,
      room_status: data.room_status,
      extra_facilities: data.extra_facilities,
      room_images: data?.room_images?.map(
        (img) => ({ url: process.env.APP_BASE_URL + img.url })
      ),
      created_by: data.created_by,
      created_at: data.createdAt,
      updated_at: data.updatedAt
    }));

    return successResponse(0, 'SUCCESS', 'Featured rooms list data found successful', {
      rows: mappedRooms,
      total_rows: rooms.length,
      response_rows: findRooms.length,
      total_page: req?.query?.keyword ? Math.ceil(findRooms.length / req.query.limit) : Math.ceil(rooms.length / req.query.limit),
      current_page: req?.query?.page ? parseInt(req.query.page, 10) : 1
    });
  }
}

module.exports = new RoomService();
