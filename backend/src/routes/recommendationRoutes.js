const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const { authenticateToken } = require('../middleware/authMiddleware');

router.use(authenticateToken);

router.get('/', recommendationController.generateRecommendations);

module.exports = router;
