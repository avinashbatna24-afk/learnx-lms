const db = require('../db');

const createAssignment = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { 
      course_id, title, description, instructions, 
      total_marks, start_date, due_date, 
      allow_late_submission, late_penalty, submission_type 
    } = req.body;
    const instructor_id = req.user.id;

    const result = await db.query(
      `INSERT INTO assignments (
        course_id, module_id, title, description, instructions, 
        total_marks, start_date, due_date, allow_late_submission, 
        late_penalty, submission_type, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *`,
      [
        course_id, moduleId, title, description, instructions, 
        total_marks, start_date || null, due_date || null, allow_late_submission || false, 
        late_penalty || 0, submission_type, instructor_id
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating assignment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM assignments WHERE id = $1', [id]);
    res.json({ success: true, message: 'Assignment deleted' });
  } catch (error) {
    console.error('Error deleting assignment:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createAssignment, deleteAssignment };
