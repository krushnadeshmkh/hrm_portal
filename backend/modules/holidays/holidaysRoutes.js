const express = require('express');
const router = express.Router();

const auth = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

const holidayController = require('./holidaysController');
router.get(
  '/',
  auth,
  roleCheck(['company_admin', 'super_admin', 'employee']),
  holidayController.getHolidays
);
router.post(
  '/add',
  auth,
  roleCheck(['company_admin', 'super_admin']),
  holidayController.addHoliday
);

module.exports = router;