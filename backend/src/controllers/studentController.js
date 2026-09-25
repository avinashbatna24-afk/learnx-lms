const db = require('../db');

const enrollCourse = async (req, res) => {
  try {
    const { id: course_id } = req.params;
    const student_id = req.user.id;

    // Check if course exists
    const courseCheck = await db.query('SELECT id FROM courses WHERE id = $1', [course_id]);
    if (courseCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    // Attempt to enroll (Unique constraint will handle duplicates, but we can check explicitly or handle error)
    const enrollCheck = await db.query('SELECT id FROM enrollments WHERE student_id = $1 AND course_id = $2', [student_id, course_id]);
    if (enrollCheck.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    const result = await db.query(
      'INSERT INTO enrollments (student_id, course_id) VALUES ($1, $2) RETURNING *',
      [student_id, course_id]
    );

    res.status(201).json({ success: true, message: 'Enrolled successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error enrolling in course:', error);
    res.status(500).json({ success: false, message: 'Server error enrolling in course' });
  }
};

const getMyCourses = async (req, res) => {
  try {
    const student_id = req.user.id;

    const query = `
      SELECT c.*, e.enrolled_at 
      FROM courses c
      JOIN enrollments e ON c.id = e.course_id
      WHERE e.student_id = $1
      ORDER BY e.enrolled_at DESC
    `;
    const result = await db.query(query, [student_id]);
    
    // In a real application, we would also calculate progress percentage here
    // For now, returning the courses is enough for Phase 4
    
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching enrolled courses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching enrolled courses' });
  }
};

const completeLesson = async (req, res) => {
  try {
    const { id: lesson_id } = req.params;
    const student_id = req.user.id;

    // Insert or do nothing on conflict if already marked complete
    const query = `
      INSERT INTO lesson_progress (student_id, lesson_id, completed)
      VALUES ($1, $2, TRUE)
      ON CONFLICT (student_id, lesson_id) DO NOTHING
      RETURNING *
    `;
    
    const result = await db.query(query, [student_id, lesson_id]);

    res.json({ success: true, message: 'Lesson marked as completed', data: result.rows[0] || { message: 'Already completed' } });
  } catch (error) {
    console.error('Error marking lesson complete:', error);
    res.status(500).json({ success: false, message: 'Server error marking lesson complete' });
  }
};

const getCourseProgress = async (req, res) => {
    try {
      const { courseId } = req.params;
      const student_id = req.user.id;
  
      // Get all lessons for the course
      const lessonsQuery = `
        SELECT l.id
        FROM lessons l
        JOIN modules m ON l.module_id = m.id
        WHERE m.course_id = $1
      `;
      const lessonsResult = await db.query(lessonsQuery, [courseId]);
      const totalLessons = lessonsResult.rows.length;
  
      if (totalLessons === 0) {
        return res.json({ success: true, data: { progress: 0, completedLessons: [] } });
      }
  
      // Get completed lessons by student for this course
      const completedQuery = `
        SELECT lp.lesson_id
        FROM lesson_progress lp
        JOIN lessons l ON lp.lesson_id = l.id
        JOIN modules m ON l.module_id = m.id
        WHERE lp.student_id = $1 AND m.course_id = $2 AND lp.completed = TRUE
      `;
      const completedResult = await db.query(completedQuery, [student_id, courseId]);
      
      const completedLessons = completedResult.rows.map(row => row.lesson_id);
      const progress = Math.round((completedLessons.length / totalLessons) * 100);
  
      res.json({ success: true, data: { progress, completedLessons } });
    } catch (error) {
      console.error('Error fetching course progress:', error);
      res.status(500).json({ success: false, message: 'Server error fetching course progress' });
    }
  };

module.exports = {
  enrollCourse,
  getMyCourses,
  completeLesson,
  getCourseProgress
};
