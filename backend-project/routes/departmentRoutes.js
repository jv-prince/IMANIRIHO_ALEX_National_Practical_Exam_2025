const express = require('express');
const router = express.Router();
const Department = require('../models/Department');
const { requireAuth } = require('../middleware/authMiddleware');

// @GET /api/departments - Get all departments
router.get('/', requireAuth, async (req, res) => {
  try {
    const departments = await Department.find().sort({ departmentCode: 1 });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @GET /api/departments/:id - Get single department
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found.' });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @POST /api/departments - Create department
router.post('/', requireAuth, async (req, res) => {
  try {
    const { departmentCode, departmentName, grossSalary, totalDeduction } = req.body;
    if (!departmentCode || !departmentName || grossSalary === undefined) {
      return res.status(400).json({ message: 'All fields are required.' });
    }
    const existing = await Department.findOne({ departmentCode: departmentCode.toUpperCase() });
    if (existing) {
      return res.status(409).json({ message: 'Department code already exists.' });
    }
    const dept = new Department({
      departmentCode: departmentCode.toUpperCase(),
      departmentName,
      grossSalary: Number(grossSalary),
      totalDeduction: Number(totalDeduction) || 0,
    });
    await dept.save();
    res.status(201).json({ message: 'Department created successfully.', department: dept });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @PUT /api/departments/:id - Update department
router.put('/:id', requireAuth, async (req, res) => {
  try {
    const { departmentCode, departmentName, grossSalary, totalDeduction } = req.body;
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      {
        departmentCode: departmentCode?.toUpperCase(),
        departmentName,
        grossSalary: Number(grossSalary),
        totalDeduction: Number(totalDeduction) || 0,
      },
      { new: true, runValidators: true }
    );
    if (!dept) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department updated successfully.', department: dept });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

// @DELETE /api/departments/:id - Delete department
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const dept = await Department.findByIdAndDelete(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found.' });
    res.json({ message: 'Department deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error.', error: err.message });
  }
});

module.exports = router;
