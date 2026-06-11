const express = require('express');
const router = express.Router();

const auth = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

const leaveController = require('./leavesController');

router.get(
  '/',
  auth,
  roleCheck(['manager', 'super_admin', 'employee']),
  leaveController.getLeaves
);

router.post(
  '/apply',
  auth,
  roleCheck(['employee', 'manager', 'super_admin']),
  leaveController.applyLeave
);

router.put(
  '/approve/:id',
  auth,
  roleCheck(['manager', 'super_admin']),
  leaveController.approveLeave
);

module.exports = router;