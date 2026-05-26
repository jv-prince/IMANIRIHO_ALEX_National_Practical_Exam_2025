const mongoose = require('mongoose');

const salarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true,
  },
  grossSalary: {
    type: Number,
    required: true,
    min: 0,
  },
  totalDeduction: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  netSalary: {
    type: Number,
    required: true,
    min: 0,
  },
  month: {
    type: String,
    required: true, // Format: "YYYY-MM"
  },
}, { timestamps: true });

module.exports = mongoose.model('Salary', salarySchema);
