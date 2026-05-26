const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const { requireAuth } = require('../middleware/authMiddleware');

// @GET /api/salaries - Get all salaries
router.get('/', requireAuth, async (req, res) => {
  try {
    const salaries = await Salary.find()
      .populate({
        path: 'employee',
        populate: { path: 'department' },
      })
      .sort({ month: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @GET /api/salaries/report/monthly?month=YYYY-MM - Monthly payroll report
router.get('/report/monthly', requireAuth, async (req, res) => {
  try {
    const { month } = req.query;
    const query = month ? { month } : {};
    const salaries = await Salary.find(query)
      .populate({
        path: 'employee',
        populate: { path: 'department' },
      })
      .sort({ month: -1 });
    res.json(salaries);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @GET /api/salaries/:id - Get single salary record
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate({
      path: 'employee',
      populate: { path: 'department' },
    });
    if (!salary) return res.status(404).json({ message: 'Salary record not found.' });
    res.json(salary);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @POST /api/salaries - Create salary record
router.post('/', requireAuth, async (req, res) => {
  try {
    const { employee, month } = req.body;
    if (!employee || !month) {
      return res.status(400).json({ message: 'Employee and month are required.' });
    }

    // Check for duplicate salary entry for same employee and month
    const existing = await Salary.findOne({ employee, month });
    if (existing) {
      return res.status(409).json({ message: 'Salary for this employee and month already exists.' });
    }

    // Auto-calculate from department
    const emp = await Employee.findById(employee).populate('department');
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });

    const grossSalary = emp.department.grossSalary;
    const totalDeduction = emp.department.totalDeduction;
    const netSalary = grossSalary - totalDeduction;

    const salary = new Salary({
      employee,
      grossSalary,
      totalDeduction,
      netSalary,
      month,
    });
    await salary.save();
    const populated = await salary.populate({ path: 'employee', populate: { path: 'department' } });
    res.status(201).json({ message: 'Salary record created successfully.', salary: populated });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @PUT /api/salaries/:id - Update salary record
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { employee, month } = req.body;

    // Recalculate from department
    const emp = await Employee.findById(employee).populate('department');
    if (!emp) return res.status(404).json({ message: 'Employee not found.' });

    const grossSalary = emp.department.grossSalary;
    const totalDeduction = emp.department.totalDeduction;
    const netSalary = grossSalary - totalDeduction;

    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { employee, grossSalary, totalDeduction, netSalary, month },
      { new: true, runValidators: true }
    ).populate({ path: 'employee', populate: { path: 'department' } });

    if (!salary) return res.status(404).json({ message: 'Salary record not found.' });
    res.json({ message: 'Salary record updated successfully.', salary });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @DELETE /api/salaries/:id - Delete salary record
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ message: 'Salary record not found.' });
    res.json({ message: 'Salary record deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
