const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
  PlateNumber: { type: String, required: true, unique: true },
  DriverName: { type: String, required: true },
  PhoneNumber: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
