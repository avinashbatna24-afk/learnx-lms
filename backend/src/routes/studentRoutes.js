const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// All routes here should be protected and generally for students
// (Though instructors might also be students in some systems, we'll just check authentication)
router.use(authenticateToken);

router.get('/my-courses', studentController.getMyCourses);
router.post('/lessons/:id/complete', studentController.completeLesson);
router.get('/courses/:courseId/progress', studentController.getCourseProgress);

module.exports = router;
