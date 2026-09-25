const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const resourceController = require('../controllers/resourceController');
const { authenticateToken, authorizeRole } = require('../middleware/authMiddleware');

const UPLOAD_DIR = path.join(__dirname, '../../uploads/resources');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'resource_' + uniqueSuffix + path.extname(file.originalname));
  }
});

const MAX_SIZE = (process.env.MAX_FILE_SIZE_MB || 25) * 1024 * 1024;

const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'image/jpeg',
    'image/png',
    'image/webp',
    'text/plain',
    'text/csv'
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: fileFilter
});

// We catch multer errors to format them nicely
const handleUpload = (req, res, next) => {
  const uploadSingle = upload.single('file');
  uploadSingle(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: `File size exceeds the ${process.env.MAX_FILE_SIZE_MB || 25} MB limit.` });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};

router.post('/modules/:moduleId/resources', authenticateToken, authorizeRole('instructor'), handleUpload, resourceController.createResource);
router.put('/resources/:id', authenticateToken, authorizeRole('instructor'), handleUpload, resourceController.updateResource);
router.delete('/resources/:id', authenticateToken, authorizeRole('instructor'), resourceController.deleteResource);
router.get('/resources/:id/download', authenticateToken, resourceController.downloadResource);

module.exports = router;
