const express = require('express');
const router = express.Router();

const auth = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

const employeeController = require('./employeeController');
router.post('/add', auth, roleCheck(['company_admin', 'super_admin']), employeeController.addEmployee);

router.get('/', auth, roleCheck(['company_admin', 'super_admin']), employeeController.getEmployees);

router.get('/profile', auth, employeeController.getEmployeeProfile);

module.exports = router;