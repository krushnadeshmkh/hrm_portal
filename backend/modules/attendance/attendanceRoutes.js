const express = require('express');
const router = express.Router();

const protect = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

const attendanceController = require('../attendance/attendanceController');

const isAdmin = roleCheck([
  'company_admin',
  'super_admin',
  'software_owner'
]);
router.post('/mark', protect, attendanceController.markAttendance);
router.get('/today', protect, attendanceController.getToday);
router.get('/all', protect, isAdmin, attendanceController.getAllAttendance);
router.put('/edit', protect, isAdmin, attendanceController.editAttendance);
router.put('/session/edit', protect, isAdmin, attendanceController.editSession);

module.exports = router;