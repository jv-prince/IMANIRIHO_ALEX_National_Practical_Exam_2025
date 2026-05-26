const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  SlotNumber: { type: String, required: true, unique: true },
  SlotStatus: { type: String, enum: ['Available', 'Occupied'], default: 'Available' },
}, { timestamps: true });

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema);
