const express = require('express');
const router = express.Router();
const ParkingRecord = require('../models/ParkingRecord');
const ParkingSlot = require('../models/ParkingSlot');
const Payment = require('../models/Payment');

const RATE_PER_HOUR = 500; // 500 Rwf per hour

// Calculate duration in hours and amount
function calcDurationAndAmount(entryTime, exitTime) {
  const diffMs = new Date(exitTime) - new Date(entryTime);
  const diffHours = diffMs / (1000 * 60 * 60);
  // Minimum charge: 1 hour if under 1 hour
  const billableHours = diffHours < 1 ? 1 : Math.ceil(diffHours);
  const amount = billableHours * RATE_PER_HOUR;
  return { duration: parseFloat(diffHours.toFixed(2)), amount };
}

// GET all records
router.get('/', async (req, res) => {
  try {
    const records = await ParkingRecord.find().sort({ createdAt: -1 });
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single record
router.get('/:id', async (req, res) => {
  try {
    const record = await ParkingRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    res.json(record);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create record (car entry)
router.post('/', async (req, res) => {
  try {
    const { PlateNumber, SlotNumber, EntryTime } = req.body;

    // Mark slot as Occupied
    await ParkingSlot.findOneAndUpdate({ SlotNumber }, { SlotStatus: 'Occupied' });

    const record = new ParkingRecord({ PlateNumber, SlotNumber, EntryTime });
    await record.save();
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// PUT update record (car exit - sets ExitTime, calculates Duration)
router.put('/:id', async (req, res) => {
  try {
    const record = await ParkingRecord.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });

    const { ExitTime } = req.body;
    const { duration } = calcDurationAndAmount(record.EntryTime, ExitTime);

    record.ExitTime = ExitTime;
    record.Duration = duration;
    await record.save();

    // Mark slot as Available
    await ParkingSlot.findOneAndUpdate({ SlotNumber: record.SlotNumber }, { SlotStatus: 'Available' });

    res.json(record);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE record
router.delete('/:id', async (req, res) => {
  try {
    const record = await ParkingRecord.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).json({ message: 'Record not found' });
    // Free the slot
    await ParkingSlot.findOneAndUpdate({ SlotNumber: record.SlotNumber }, { SlotStatus: 'Available' });
    res.json({ message: 'Record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
