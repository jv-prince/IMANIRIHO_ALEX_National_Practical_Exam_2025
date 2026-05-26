const mongoose = require('mongoose');

const parkingRecordSchema = new mongoose.Schema({
  PlateNumber: { type: String, required: true, ref: 'Car' },
  SlotNumber:  { type: String, required: true, ref: 'ParkingSlot' },
  EntryTime:   { type: Date, required: true },
  ExitTime:    { type: Date, default: null },
  Duration:    { type: Number, default: 0 }, // in hours (decimal)
}, { timestamps: true });

module.exports = mongoose.model('ParkingRecord', parkingRecordSchema);
