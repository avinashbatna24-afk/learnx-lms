const express = require('express');
const router = express.Router();
const performanceController = require('../controllers/performanceController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', performanceController.getMyPerformance);

module.exports = router;
