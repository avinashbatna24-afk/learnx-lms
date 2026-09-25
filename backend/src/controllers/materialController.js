const db = require('../db');

const createMaterial = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { course_id, title, description, material_type, file_url } = req.body;
    const instructor_id = req.user.id;

    const result = await db.query(
      'INSERT INTO course_materials (course_id, module_id, title, description, material_type, file_url, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [course_id, moduleId, title, description, material_type, file_url, instructor_id]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteMaterial = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM course_materials WHERE id = $1', [id]);
    res.json({ success: true, message: 'Material deleted' });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createMaterial, deleteMaterial };
