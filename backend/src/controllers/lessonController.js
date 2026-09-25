const db = require('../db');

const createLesson = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { title, content, video_url } = req.body;

    const orderRes = await db.query('SELECT COALESCE(MAX(order_number), 0) + 1 as next_order FROM lessons WHERE module_id = $1', [moduleId]);
    const order_number = orderRes.rows[0].next_order;

    const result = await db.query(
      'INSERT INTO lessons (module_id, title, content, video_url, order_number) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [moduleId, title, content, video_url, order_number]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error creating lesson:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const updateLesson = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, video_url } = req.body;
    
    const result = await db.query(
      'UPDATE lessons SET title = $1, content = $2, video_url = $3 WHERE id = $4 RETURNING *',
      [title, content, video_url, id]
    );
    
    if (result.rows.length === 0) return res.status(404).json({ success: false, message: 'Lesson not found' });
    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error('Error updating lesson:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteLesson = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM lessons WHERE id = $1', [id]);
    res.json({ success: true, message: 'Lesson deleted' });
  } catch (error) {
    console.error('Error deleting lesson:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { createLesson, updateLesson, deleteLesson };
