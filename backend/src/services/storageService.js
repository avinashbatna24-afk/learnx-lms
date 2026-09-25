const fs = require('fs');
const path = require('path');

// Base upload directory setup
const UPLOAD_DIR = path.join(__dirname, '../../uploads/resources');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storageService = {
  /**
   * For local storage, multer has already saved the file to the physical disk.
   * We just return the metadata to save in the DB.
   * If this were AWS S3, this function would upload the buffer/stream to S3 and return the S3 URL.
   */
  uploadFile: async (file) => {
    if (!file) return null;
    
    // file is the multer file object
    return {
      file_name: file.filename,
      original_file_name: file.originalname,
      file_size: file.size,
      mime_type: file.mimetype,
      file_url: `/uploads/resources/${file.filename}` // Conceptual URL, will be served by static route or download endpoint
    };
  },

  deleteFile: async (fileName) => {
    if (!fileName) return false;
    
    const filePath = path.join(UPLOAD_DIR, fileName);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
    } catch (err) {
      console.error('Error deleting file:', err);
      return false;
    }
    return false;
  },

  getFilePath: (fileName) => {
    return path.join(UPLOAD_DIR, fileName);
  }
};

module.exports = storageService;
