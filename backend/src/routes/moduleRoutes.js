const express = require('express');
const router = express.Router();
const moduleController = require('../controllers/moduleController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/courses/:courseId/modules', authenticateToken, authorizeRole('instructor'), moduleController.createModule);
router.put('/modules/:id', authenticateToken, authorizeRole('instructor'), moduleController.updateModule);
router.delete('/modules/:id', authenticateToken, authorizeRole('instructor'), moduleController.deleteModule);
router.patch('/modules/:id/order', authenticateToken, authorizeRole('instructor'), moduleController.updateModuleOrder);

module.exports = router;
