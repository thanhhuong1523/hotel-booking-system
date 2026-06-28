/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const reviewService = require('../services/review.service');
const { errorResponse } = require('../configs/app.response');

// TODO: controller for room review add
exports.roomReviewAdd = async (req, res) => {
  try {
    const result = await reviewService.roomReviewAdd(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: controller for get an room reviews list
exports.getRoomReviewsList = async (req, res) => {
  try {
    const result = await reviewService.getRoomReviewsList(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: controller for edit self room review
exports.editSelfRoomReview = async (req, res) => {
  try {
    const result = await reviewService.editSelfRoomReview(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};
