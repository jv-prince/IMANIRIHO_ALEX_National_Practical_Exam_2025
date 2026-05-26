const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');
const { requireAuth } = require('../middleware/authMiddleware');

// @GET /api/employees - Get all employees (with department populated)
router.get('/', requireAuth, async (req, res) => {
  try {
    const employees = await Employee.find().populate('department').sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @GET /api/employees/:id - Get single employee
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id).populate('department');
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });
    res.json(emp);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @POST /api/employees - Create employee
router.post('/', requireAuth, async (req, res) => {
  try {
    const { employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, department } = req.body;
    if (!employeeNumber || !firstName || !lastName || !position || !address || !telephone || !gender || !hiredDate || !department) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await Employee.findOne({ employeeNumber });
    if (existing) {
      return res.status(409).json({ message: 'Employee number already exists.' });
    }
    const emp = new Employee({
      employeeNumber,
      firstName,
      lastName,
      position,
      address,
      telephone,
      gender,
      hiredDate: new Date(hiredDate),
      department,
    });
    await emp.save();
    const populated = await emp.populate('department');
    res.status(201).json({ message: 'Employee created successfully.', employee: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @PUT /api/employees/:id - Update employee
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate, department } = req.body;
    const emp = await Employee.findByIdAndUpdate(
      req.params.id,
      { employeeNumber, firstName, lastName, position, address, telephone, gender, hiredDate: new Date(hiredDate), department },
      { new: true, runValidators: true }
    ).populate('department');
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Employee updated successfully.', employee: emp });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @DELETE /api/employees/:id - Delete employee
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });
    res.json({ message: 'Employee deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
