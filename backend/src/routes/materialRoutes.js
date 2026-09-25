const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

router.post('/modules/:moduleId/materials', authenticateToken, authorizeRole('instructor'), materialController.createMaterial);
router.delete('/materials/:id', authenticateToken, authorizeRole('instructor'), materialController.deleteMaterial);

module.exports = router;
