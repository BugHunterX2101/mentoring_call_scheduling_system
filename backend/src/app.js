const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./modules/auth/auth.routes');
const availabilityRoutes = require('./modules/availability/availability.routes');
const requirementsRoutes = require('./modules/requirements/requirements.routes');
const mentorsRoutes = require('./modules/mentors/mentors.routes');
const recommendationsRoutes = require('./modules/recommendations/recommendations.routes');
const bookingsRoutes = require('./modules/bookings/bookings.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/requirements', requirementsRoutes);
app.use('/api/mentors', mentorsRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/bookings', bookingsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
