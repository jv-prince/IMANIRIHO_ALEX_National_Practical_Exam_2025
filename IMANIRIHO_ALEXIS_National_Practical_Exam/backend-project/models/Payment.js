const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  ParkingRecordId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingRecord', required: true },
  PlateNumber:     { type: String, required: true },
  AmountPaid:      { type: Number, required: true },
  PaymentDate:     { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
