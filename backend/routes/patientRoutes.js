const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { createPatient, getPatients, getPatientById } = require('../controllers/patientController');

const router = express.Router();

router.post(
  '/',
  [
    body('name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 100 }),
    body('age').notEmpty().withMessage('Age is required').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
    body('gender').notEmpty().withMessage('Gender is required').isIn(['Male', 'Female', 'Other']),
    body('phone').trim().notEmpty().withMessage('Phone number is required').isLength({ min: 7, max: 20 }),
    body('email').optional({ checkFalsy: true }).isEmail().withMessage('Enter a valid email'),
    body('address').optional({ checkFalsy: true }).isLength({ max: 250 }),
    body('bloodGroup').optional({ checkFalsy: true }).isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
    body('symptoms').optional({ checkFalsy: true }).isLength({ max: 500 }),
  ],
  validateRequest,
  createPatient
);

router.get('/', getPatients);

router.get('/:id', [param('id').isMongoId().withMessage('Invalid patient ID')], validateRequest, getPatientById);

module.exports = router;
