//models/activity.js

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  type: { type: String, required: true }, // transport | electricity | diet | waste
  subtype: { type: String }, // e.g. car, bus, beef
  value: { type: Number, default: 0 }, // e.g. km, kWh, meals, kg
  co2Kg: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
