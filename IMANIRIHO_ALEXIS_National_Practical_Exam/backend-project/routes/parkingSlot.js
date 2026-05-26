const express = require('express');
const router = express.Router();
const ParkingSlot = require('../models/ParkingSlot');

// GET all slots
router.get('/', async (req, res) => {
  try {
    const slots = await ParkingSlot.find();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single slot
router.get('/:id', async (req, res) => {
  try {
    const slot = await ParkingSlot.findById(req.params.id);
    if (!slot) return res.status(404).json({ message: 'Slot not found' });
    res.json(slot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create slot
router.post('/', async (req, res) => {
  try {
    const slot = new ParkingSlot(req.body);
    await slot.save();
    res.status(201).json(slot);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
