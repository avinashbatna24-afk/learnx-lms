const db = require('../db');
const storageService = require('../services/storageService');
const fs = require('fs');

const createResource = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { course_id, title, description, resource_type, source_type, external_url } = req.body;
    const instructor_id = req.user.id;

    if (!course_id || !title || !source_type) {
      // If we uploaded a file but validation fails, delete the file to prevent orphans
      if (req.file) await storageService.deleteFile(req.file.filename);
      return res.status(400).json({ success: false, message: 'Missing required fields' });
    }

    let file_name = null;
    let original_file_name = null;
    let file_url = null;
    let file_size = null;
    let mime_type = null;
    let ext_url = null;

    if (source_type === 'FILE') {
      if (!req.file) {
        return res.status(400).json({ success: false, message: 'File is required for FILE source type' });
      }
      const fileMeta = await storageService.uploadFile(req.file);
      file_name = fileMeta.file_name;
      original_file_name = fileMeta.original_file_name;
      file_url = fileMeta.file_url;
      file_size = fileMeta.file_size;
      mime_type = fileMeta.mime_type;
    } else if (source_type === 'EXTERNAL_LINK') {
      if (!external_url) {
        return res.status(400).json({ success: false, message: 'URL is required for EXTERNAL_LINK source type' });
      }
      ext_url = external_url;
    } else {
      if (req.file) await storageService.deleteFile(req.file.filename);
      return res.status(400).json({ success: false, message: 'Invalid source_type' });
    }

    const result = await db.query(
      `INSERT INTO resources 
        (course_id, module_id, title, description, resource_type, source_type, file_name, original_file_name, file_url, file_size, mime_type, external_url, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING *`,
      [course_id, moduleId, title, description, resource_type, source_type, file_name, original_file_name, file_url, file_size, mime_type, ext_url, instructor_id]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating resource:', error);
    if (req.file) await storageService.deleteFile(req.file.filename);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, resource_type, source_type, external_url } = req.body;
    
    // Check existing resource
    const resCheck = await db.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (resCheck.rows.length === 0) {
      if (req.file) await storageService.deleteFile(req.file.filename);
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    const existing = resCheck.rows[0];

    let file_name = existing.file_name;
    let original_file_name = existing.original_file_name;
    let file_url = existing.file_url;
    let file_size = existing.file_size;
    let mime_type = existing.mime_type;
    let ext_url = source_type === 'EXTERNAL_LINK' ? external_url : null;
    let oldFileToDelete = null;

    if (source_type === 'FILE' && req.file) {
      const fileMeta = await storageService.uploadFile(req.file);
      file_name = fileMeta.file_name;
      original_file_name = fileMeta.original_file_name;
      file_url = fileMeta.file_url;
      file_size = fileMeta.file_size;
      mime_type = fileMeta.mime_type;
      
      if (existing.file_name) {
        oldFileToDelete = existing.file_name;
      }
    } else if (source_type === 'EXTERNAL_LINK') {
      file_name = null; original_file_name = null; file_url = null; file_size = null; mime_type = null;
      if (existing.file_name) {
        oldFileToDelete = existing.file_name;
      }
    }

    const result = await db.query(
      `UPDATE resources SET 
        title = $1, description = $2, resource_type = $3, source_type = $4, 
        file_name = $5, original_file_name = $6, file_url = $7, file_size = $8, 
        mime_type = $9, external_url = $10, updated_at = CURRENT_TIMESTAMP
       WHERE id = $11 RETURNING *`,
      [title || existing.title, description || existing.description, resource_type || existing.resource_type, source_type || existing.source_type, 
       file_name, original_file_name, file_url, file_size, mime_type, ext_url, id]
    );

    if (oldFileToDelete) {
      await storageService.deleteFile(oldFileToDelete);
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating resource:', error);
    if (req.file) await storageService.deleteFile(req.file.filename);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    const resCheck = await db.query('SELECT file_name FROM resources WHERE id = $1', [id]);
    if (resCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    
    await db.query('DELETE FROM resources WHERE id = $1', [id]);
    
    if (resCheck.rows[0].file_name) {
      await storageService.deleteFile(resCheck.rows[0].file_name);
    }
    
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const downloadResource = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const resQuery = await db.query('SELECT r.*, c.instructor_id FROM resources r JOIN courses c ON r.course_id = c.id WHERE r.id = $1', [id]);
    if (resQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }
    const resource = resQuery.rows[0];

    if (resource.source_type !== 'FILE' || !resource.file_name) {
      return res.status(400).json({ success: false, message: 'Not a downloadable file resource' });
    }

    // Access control: instructor owns course, or student is enrolled
    if (userRole === 'instructor' && resource.instructor_id !== userId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    } else if (userRole === 'student') {
      const enrollCheck = await db.query('SELECT * FROM enrollments WHERE student_id = $1 AND course_id = $2', [userId, resource.course_id]);
      if (enrollCheck.rows.length === 0) {
        return res.status(403).json({ success: false, message: 'Not enrolled in this course' });
      }
    }

    const filePath = storageService.getFilePath(resource.file_name);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, message: 'Physical file not found on server' });
    }

    res.download(filePath, resource.original_file_name);
  } catch (error) {
    console.error('Error downloading resource:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createResource, updateResource, deleteResource, downloadResource };
