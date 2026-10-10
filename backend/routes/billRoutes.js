const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { createBill, getBills, getBillById, updatePaymentStatus } = require('../controllers/billController');

const router = express.Router();

router.post(
  '/',
  [
    body('patient').isMongoId().withMessage('Please select a valid patient'),
    body('consultationCharges').optional().isFloat({ min: 0 }).withMessage('Consultation charges must be a positive number'),
    body('roomCharges').optional().isFloat({ min: 0 }).withMessage('Room charges must be a positive number'),
    body('laboratoryCharges').optional().isFloat({ min: 0 }).withMessage('Laboratory charges must be a positive number'),
    body('medicationCharges').optional().isFloat({ min: 0 }).withMessage('Medication charges must be a positive number'),
  ],
  validateRequest,
  createBill
);

router.get('/', getBills);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid bill ID')], validateRequest, getBillById);

router.patch('/:id/payment', [param('id').isMongoId().withMessage('Invalid bill ID')], validateRequest, updatePaymentStatus);

module.exports = router;
