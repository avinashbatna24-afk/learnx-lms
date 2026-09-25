const express = require('express');
const router = express.Router();
const assignmentController = require('../controllers/assignmentController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/modules/:moduleId/assignments', authenticateToken, authorizeRole('instructor'), assignmentController.createAssignment);
router.delete('/assignments/:id', authenticateToken, authorizeRole('instructor'), assignmentController.deleteAssignment);

module.exports = router;
