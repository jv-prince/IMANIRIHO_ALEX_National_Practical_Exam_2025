const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  departmentCode: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
  },
  departmentName: {
    type: String,
    required: true,
    trim: true,
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
}, { timestamps: true });

module.exports = mongoose.model('Department', departmentSchema);
