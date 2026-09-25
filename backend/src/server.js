require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const studentRoutes = require('./routes/studentRoutes');
const quizRoutes = require('./routes/quizRoutes');
const performanceRoutes = require('./routes/performanceRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const moduleRoutes = require('./routes/moduleRoutes');
const lessonRoutes = require('./routes/lessonRoutes');
const materialRoutes = require('./routes/materialRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/student', studentRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api', moduleRoutes);
app.use('/api', lessonRoutes);
app.use('/api', materialRoutes);
app.use('/api', resourceRoutes);
app.use('/api', assignmentRoutes);

// Health check API
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running correctly', data: { timestamp: new Date() } });
});

// Database test API
app.get('/api/db-test', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW() AS current_time');
    res.json({
      success: true,
      message: 'Database connection successful',
      data: { db_time: result.rows[0].current_time }
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
