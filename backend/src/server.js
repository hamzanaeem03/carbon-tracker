// Simple Express backend with MongoDB + Prometheus metrics
//server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { collectDefaultMetrics, register, Histogram, Gauge, Counter } = require('prom-client');
const Activity = require('./models/activity');
const { initMetrics, httpRequestDuration } = require('./metrics');

const PORT = process.env.PORT || 4000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/carbon_dev';
const app = express();

app.use(helmet());
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// init prom-client defaults & custom metrics
collectDefaultMetrics();
initMetrics(); // setup custom metrics

// connect mongoose (dev-friendly)
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connect error:', err.message));

// ----- Helpers: emission factors -----
const EMISSION_FACTORS = {
  transport: { car: 0.192, bus: 0.089, train: 0.041, flight: 0.255 }, // kg per km
  electricity: { default: 0.475 }, // kg per kWh
  diet: { beef: 27, chicken: 6.9, vegetarian: 2.5, vegan: 1.5 }, // kg per meal
  waste: { default: 0.5 } // kg CO2 per kg waste
};

function calculateCO2(activity) {
  // returns kg CO2 for the given activity object
  const { type, subtype, value } = activity;
  if (type === 'transport') {
    const factor = EMISSION_FACTORS.transport[subtype] ?? 0;
    return factor * Number(value || 0);
  } else if (type === 'electricity') {
    const factor = EMISSION_FACTORS.electricity.default;
    return factor * Number(value || 0);
  } else if (type === 'diet') {
    const factor = EMISSION_FACTORS.diet[subtype] ?? 0;
    return factor * Number(value || 0); // value = number of meals
  } else if (type === 'waste') {
    const factor = EMISSION_FACTORS.waste.default;
    return factor * Number(value || 0); // value = kg of waste
  }
  return 0;
}

// ----- Routes -----
// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

// Metrics (Prometheus)
app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// Add activity
app.post('/api/activities', async (req, res) => {
  const end = httpRequestDuration.startTimer({ route: '/api/activities', method: 'POST' });
  try {
    const { userId, type, subtype, value, timestamp } = req.body;
    if (!userId || !type) return res.status(400).json({ error: 'userId and type required' });

    const co2Kg = calculateCO2({ type, subtype, value });
    const activity = new Activity({
      userId,
      type,
      subtype,
      value,
      co2Kg,
      timestamp: timestamp ? new Date(timestamp) : new Date()
    });
    await activity.save();

    // update metrics
    const metrics = require('./metrics');
    metrics.activitiesTracked.inc({ type });
    metrics.totalCarbon.set(await Activity.aggregate([{ $group: { _id: null, sum: { $sum: "$co2Kg" } } }]).then(r => (r[0] ? r[0].sum : 0)));
    metrics.activeUsers.set(await Activity.distinct('userId').then(list => list.length));

    end();
    res.status(201).json(activity);
  } catch (err) {
    end();
    res.status(500).json({ error: err.message });
  }
});

// Get activities for a user
app.get('/api/activities/:userId', async (req, res) => {
  const end = httpRequestDuration.startTimer({ route: '/api/activities/:userId', method: 'GET' });
  try {
    const activities = await Activity.find({ userId: req.params.userId }).sort({ timestamp: -1 }).limit(200).lean();
    end();
    res.json(activities);
  } catch (err) {
    end();
    res.status(500).json({ error: err.message });
  }
});

// Get user stats
app.get('/api/stats/:userId', async (req, res) => {
  const end = httpRequestDuration.startTimer({ route: '/api/stats/:userId', method: 'GET' });
  try {
    const userId = req.params.userId;
    const activities = await Activity.find({ userId }).lean();
    const totalCO2 = activities.reduce((s, a) => s + (a.co2Kg || 0), 0);
    const byType = activities.reduce((acc, cur) => {
      acc[cur.type] = (acc[cur.type] || 0) + (cur.co2Kg || 0);
      return acc;
    }, {});
    end();
    res.json({ totalCO2Kg: totalCO2, byType, activitiesCount: activities.length });
  } catch (err) {
    end();
    res.status(500).json({ error: err.message });
  }
});

// Global stats
app.get('/api/global-stats', async (req, res) => {
  const end = httpRequestDuration.startTimer({ route: '/api/global-stats', method: 'GET' });
  try {
    const totalUsers = await Activity.distinct('userId').then(list => list.length);
    const agg = await Activity.aggregate([{ $group: { _id: null, totalCO2: { $sum: '$co2Kg' }, count: { $sum: 1 } } }]);
    const totalCO2Kg = agg[0] ? agg[0].totalCO2 : 0;
    const activitiesCount = agg[0] ? agg[0].count : 0;

    end();
    res.json({ totalUsers, totalCO2Kg, activitiesCount });
  } catch (err) {
    end();
    res.status(500).json({ error: err.message });
  }
});

// Delete activity
app.delete('/api/activities/:id', async (req, res) => {
  const end = httpRequestDuration.startTimer({ route: '/api/activities/:id', method: 'DELETE' });
  try {
    const removed = await Activity.findByIdAndDelete(req.params.id);
    // update gauges/counters (simple recalculation)
    const metrics = require('./metrics');
    metrics.totalCarbon.set(await Activity.aggregate([{ $group: { _id: null, sum: { $sum: "$co2Kg" } } }]).then(r => (r[0] ? r[0].sum : 0)));
    metrics.activeUsers.set(await Activity.distinct('userId').then(list => list.length));

    end();
    if (!removed) return res.status(404).json({ error: 'Not found' });
    res.json({ ok: true });
  } catch (err) {
    end();
    res.status(500).json({ error: err.message });
  }
});

// default root
app.get('/', (req, res) => res.send('Carbon Footprint Tracker - Backend'));

// start server
app.listen(PORT, () => {
  console.log(`Backend listening on port ${PORT}`);
});
