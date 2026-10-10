const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const {
  createDoctor,
  getDoctors,
  getDoctorById,
  updateAvailability,
} = require('../controllers/doctorController');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Doctor name is required').isLength({ max: 100 }),
    body('specialization').trim().notEmpty().withMessage('Specialization is required').isLength({ max: 100 }),
    body('department').trim().notEmpty().withMessage('Department is required').isLength({ max: 100 }),
    body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 7, max: 20 }),
    body('consultationStart').trim().notEmpty().withMessage('Consultation start time is required'),
    body('consultationEnd').trim().notEmpty().withMessage('Consultation end time is required'),
  ],
  validateRequest,
  createDoctor
);

router.get('/', getDoctors);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid doctor ID')], validateRequest, getDoctorById);

router.patch(
  '/:id/availability',
  [
    param('id').isMongoId().withMessage('Invalid doctor ID'),
    body('isAvailable').isBoolean().withMessage('isAvailable must be true or false'),
  ],
  validateRequest,
  updateAvailability
);

module.exports = router;
