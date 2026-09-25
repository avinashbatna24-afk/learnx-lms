const express = require('express');
const router = express.Router();
const lessonController = require('../controllers/lessonController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/modules/:moduleId/lessons', authenticateToken, authorizeRole('instructor'), lessonController.createLesson);
router.put('/lessons/:id', authenticateToken, authorizeRole('instructor'), lessonController.updateLesson);
router.delete('/lessons/:id', authenticateToken, authorizeRole('instructor'), lessonController.deleteLesson);

module.exports = router;
