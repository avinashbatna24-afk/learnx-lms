const express = require('express');
const router = express.Router();
const quizController = require('../controllers/quizController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public/Student routes
router.get('/course/:courseId', authenticateToken, quizController.getQuizzesByCourse);
router.get('/:id', authenticateToken, quizController.getQuizById);
router.post('/:id/submit', authenticateToken, quizController.submitQuiz);
router.get('/attempt/:attemptId', authenticateToken, quizController.getQuizResult);

// Instructor routes
router.post('/', authenticateToken, authorizeRole('instructor'), quizController.createQuiz);
router.post('/:id/questions', authenticateToken, authorizeRole('instructor'), quizController.addQuestion);

module.exports = router;
