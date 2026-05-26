const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');
const ParkingRecord = require('../models/ParkingRecord');

const RATE_PER_HOUR = 500;

function calcAmount(entryTime, exitTime) {
  const diffMs = new Date(exitTime) - new Date(entryTime);
  const diffHours = diffMs / (1000 * 60 * 60);
  const billableHours = diffHours < 1 ? 1 : Math.ceil(diffHours);
  return billableHours * RATE_PER_HOUR;
}

// GET all payments
router.get('/', async (req, res) => {
  try {
    const payments = await Payment.find().sort({ PaymentDate: -1 });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET daily report - payments for a specific date
router.get('/report/daily', async (req, res) => {
  try {
    const { date } = req.query;
    let start, end;
    if (date) {
      start = new Date(date);
      start.setHours(0, 0, 0, 0);
      end = new Date(date);
      end.setHours(23, 59, 59, 999);
    } else {
      start = new Date();
      start.setHours(0, 0, 0, 0);
      end = new Date();
      end.setHours(23, 59, 59, 999);
    }

    const payments = await Payment.find({
      PaymentDate: { $gte: start, $lte: end },
    });

    // Enrich with parking record details
    const enriched = await Promise.all(
      payments.map(async (p) => {
        const record = await ParkingRecord.findById(p.ParkingRecordId);
        return {
          _id: p._id,
          PlateNumber: p.PlateNumber,
          EntryTime: record ? record.EntryTime : null,
          ExitTime: record ? record.ExitTime : null,
          Duration: record ? record.Duration : null,
          AmountPaid: p.AmountPaid,
          PaymentDate: p.PaymentDate,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET bill for a parking record
router.get('/bill/:recordId', async (req, res) => {
  try {
    const record = await ParkingRecord.findById(req.params.recordId);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const exitTime = record.ExitTime || new Date();
    const amount = calcAmount(record.EntryTime, exitTime);

    const payment = await Payment.findOne({ ParkingRecordId: record._id });

    res.json({
      PlateNumber: record.PlateNumber,
      EntryTime: record.EntryTime,
      ExitTime: record.ExitTime,
      Duration: record.Duration,
      AmountPaid: payment ? payment.AmountPaid : amount,
      PaymentDate: payment ? payment.PaymentDate : null,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create payment
router.post('/', async (req, res) => {
  try {
    const { ParkingRecordId, PlateNumber, PaymentDate } = req.body;

    const record = await ParkingRecord.findById(ParkingRecordId);
    if (!record) return res.status(404).json({ message: 'Parking record not found' });

    const exitTime = record.ExitTime || new Date();
    const AmountPaid = calcAmount(record.EntryTime, exitTime);

    const payment = new Payment({
      ParkingRecordId,
      PlateNumber: PlateNumber || record.PlateNumber,
      AmountPaid,
      PaymentDate: PaymentDate || new Date(),
    });
    await payment.save();
    res.status(201).json(payment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
