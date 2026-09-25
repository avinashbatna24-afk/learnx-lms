const express = require('express');
const router = express.Router();
const courseController = require('../controllers/courseController');
const studentController = require('../controllers/studentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

// Public/Student routes
router.get('/', courseController.getAllCourses);
router.get('/:id', courseController.getCourseById);

// Enrollment route
router.post('/:id/enroll', authenticateToken, studentController.enrollCourse);

// Instructor only routes
router.post('/', authenticateToken, authorizeRole('instructor'), courseController.createCourse);
router.put('/:id', authenticateToken, authorizeRole('instructor'), courseController.updateCourse);
router.delete('/:id', authenticateToken, authorizeRole('instructor'), courseController.deleteCourse);
router.get('/:courseId/content', authenticateToken, authorizeRole('instructor'), courseController.getCourseContent);

module.exports = router;
