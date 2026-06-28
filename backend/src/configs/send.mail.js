/**
 * @name Hotel Room Booking System
 * @author Md. Samiur Rahman (Mukul)
 * @description Hotel Room Booking and Management System Software ~ Developed By Md. Samiur Rahman (Mukul)
 * @copyright ©2023 ― Md. Samiur Rahman (Mukul). All rights reserved.
 * @version v0.0.1
 *
 */

const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');
const { successResponse, errorResponse } = require('./app.response');

const sendEmail = async (res, user, url, subjects, message, title) => {
  const apiKey = process.env.SEND_GRID_API_KEY;
  const isSendGrid = apiKey && apiKey.startsWith('SG.');

  const isOTP = /^\d{6}$/.test(url);
  const htmlContent = isOTP
    ? `<div>
        <h4>${title}</h4>
        <p>${message}</p>
        <h2 style="font-size: 28px; letter-spacing: 4px; color: #1890ff; font-family: monospace;"><strong>${url}</strong></h2>
        <p>This code is valid for 15 minutes.</p>
      </div>`
    : `<div>
        <h4>${title}</h4>
        <a href="${url}" target="_blank"> >>> Click Here</a>
      </div>`;

  try {
    if (isSendGrid) {
      sgMail.setApiKey(apiKey);
      const msg = {
        to: user.email,
        from: process.env.SEND_SENDER_MAIL,
        subject: subjects,
        text: message,
        html: htmlContent
      };
      await sgMail.send(msg);
    } else {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.SEND_SENDER_MAIL,
          pass: apiKey
        }
      });
      const mailOptions = {
        from: process.env.SEND_SENDER_MAIL,
        to: user.email,
        subject: subjects,
        text: message,
        html: htmlContent
      };
      await transporter.sendMail(mailOptions);
    }

    res.status(200).json(successResponse(
      0,
      'SUCCESS',
      `Email sent to ${user.email} successful`
    ));
  } catch (error) {
    console.error('SEND MAIL ERROR:', error);
    if (error.response) {
      console.error('SEND MAIL ERROR DETAILS:', error.response.body);
    }

    // eslint-disable-next-line no-param-reassign
    user.resetPasswordToken = undefined;
    // eslint-disable-next-line no-param-reassign
    user.resetPasswordExpire = undefined;
    // eslint-disable-next-line no-param-reassign
    user.emailVerificationToken = undefined;
    // eslint-disable-next-line no-param-reassign
    user.emailVerificationExpire = undefined;

    await user.save({ validateBeforeSave: false });

    res.status(500).json(errorResponse(
      2,
      'SERVER SIDE ERROR',
      error?.message || error
    ));
  }
};

module.exports = sendEmail;
