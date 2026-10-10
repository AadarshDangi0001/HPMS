const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const {
  createAppointment,
  getAppointments,
  getAppointmentById,
  updateAppointmentStatus,
} = require('../controllers/appointmentController');

const router = express.Router();

router.post(
  '/',
  [
    body('patient').isMongoId().withMessage('Please select a valid patient'),
    body('doctor').isMongoId().withMessage('Please select a valid doctor'),
    body('department').trim().notEmpty().withMessage('Department is required'),
    body('date')
      .notEmpty()
      .withMessage('Date is required')
      .matches(/^\d{4}-\d{2}-\d{2}$/)
      .withMessage('Date must be in YYYY-MM-DD format'),
    body('time')
      .notEmpty()
      .withMessage('Time is required')
      .matches(/^\d{2}:\d{2}$/)
      .withMessage('Time must be in HH:MM format'),
    body('reason').optional({ checkFalsy: true }).isLength({ max: 300 }),
  ],
  validateRequest,
  createAppointment
);

router.get('/', getAppointments);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid appointment ID')], validateRequest, getAppointmentById);

router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid appointment ID'),
    body('status').isIn(['Confirmed', 'Pending', 'Cancelled', 'Completed']).withMessage('Invalid status value'),
  ],
  validateRequest,
  updateAppointmentStatus
);

module.exports = router;
