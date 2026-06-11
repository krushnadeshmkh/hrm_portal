const express = require('express');
const router = express.Router();

const auth = require('../../middleware/authMiddleware');
const roleCheck = require('../../middleware/roleCheck');

const employeeController = require('./employeeController');

router.post('/add', auth, roleCheck(['manager', 'super_admin']), employeeController.addEmployee);

router.get('/', auth, roleCheck(['manager', 'super_admin','employee']), employeeController.getEmployees);

router.get('/profile', auth, employeeController.getEmployeeProfile);

router.patch('/:id/position', auth, roleCheck(['manager', 'super_admin']), employeeController.updateEmployeePosition);

router.patch('/:id/salary', auth, roleCheck(['manager', 'super_admin']), employeeController.updateEmployeeSalary);

router.get('/me', auth, employeeController.getCurrentEmployee);

module.exports = router;