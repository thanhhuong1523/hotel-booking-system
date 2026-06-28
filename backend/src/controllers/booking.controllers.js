/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const bookingService = require('../services/booking.service');
const { errorResponse } = require('../configs/app.response');

// TODO: controller for placed booking order
exports.placedBookingOrder = async (req, res) => {
  try {
    const result = await bookingService.placedBookingOrder(req);
    res.status(201).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: controller for get all specific user booking order
exports.getBookingOrderByUserId = async (req, res) => {
  try {
    const result = await bookingService.getBookingOrderByUserId(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: controller for cancel self booking order
exports.cancelSelfBookingOrder = async (req, res) => {
  try {
    const result = await bookingService.cancelSelfBookingOrder(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: controller for get all booking order by admin
exports.getBookingOrderForAdmin = async (req, res) => {
  try {
    const result = await bookingService.getBookingOrderForAdmin(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: controller for updated booking order by admin
exports.updatedBookingOrderByAdmin = async (req, res) => {
  try {
    const result = await bookingService.updatedBookingOrderByAdmin(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};

// TODO: controller for checking out a booking
exports.checkoutBookingOrder = async (req, res) => {
  try {
    const result = await bookingService.checkoutBookingOrder(req);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};
