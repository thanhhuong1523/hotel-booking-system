/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const appsService = require('../services/apps.service');
const { errorResponse } = require('../configs/app.response');

// TODO: Controller for get users list for admin
exports.getDashboardData = async (req, res) => {
  try {
    const result = await appsService.getDashboardData(req.user);
    res.status(200).json(result);
  } catch (error) {
    res.status(error.status || 500).json(error.response || errorResponse(2, 'SERVER SIDE ERROR', error));
  }
};
