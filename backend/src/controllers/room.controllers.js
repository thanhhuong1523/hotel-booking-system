/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const roomService = require('../services/room.service');
const { errorResponse } = require('../configs/app.response');

// TODO: Controller for create new room
exports.createRoom = async (req, res) => {
  try {
    const result = await roomService.createRoom(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: Controller for get all rooms list
exports.getRoomsList = async (req, res) => {
  try {
    const result = await roomService.getRoomsList(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: Controller for find a room by id or room slug_name
exports.getRoomByIdOrSlugName = async (req, res) => {
  try {
    const result = await roomService.getRoomByIdOrSlugName(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: Controller for edit room
exports.editRoomByAdmin = async (req, res) => {
  try {
    const result = await roomService.editRoomByAdmin(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: Controller for delete room using ID by admin
exports.deleteRoomById = async (req, res) => {
  try {
    const result = await roomService.deleteRoomById(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: Controller for get featured rooms list
exports.getFeaturedRoomsList = async (req, res) => {
  try {
    const result = await roomService.getFeaturedRoomsList(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};
