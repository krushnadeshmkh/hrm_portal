const express = require('express');
const router = express.Router();

const protect = require('../../middleware/authMiddleware');
const dashboardController = require('../dashboard/dashboardController');
router.get('/summary', protect, dashboardController.getSummary);
router.get('/activities', protect, dashboardController.getActivities);

module.exports = router;