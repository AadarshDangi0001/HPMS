const express = require('express');
const { body, param } = require('express-validator');
const validateRequest = require('../middleware/validateRequest');
const { getBeds, updateBedStatus } = require('../controllers/bedController');

const router = express.Router();

router.get('/', getBeds);

router.patch(
  '/:id/status',
  [
    param('id').isMongoId().withMessage('Invalid bed ID'),
    body('status').isIn(['Available', 'Occupied', 'Maintenance']).withMessage('Invalid bed status'),
    body('patientId').optional({ checkFalsy: true }).isMongoId().withMessage('Invalid patient ID'),
  ],
  validateRequest,
  updateBedStatus
);

module.exports = router;
