const db = require('../db');

// Courses
const getAllCourses = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM courses ORDER BY created_at DESC');
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching courses:', error);
    res.status(500).json({ success: false, message: 'Server error fetching courses' });
  }
};

const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const courseResult = await db.query('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (courseResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const course = courseResult.rows[0];
    
    // Fetch modules and lessons
    const modulesResult = await db.query('SELECT * FROM modules WHERE course_id = $1 ORDER BY order_number', [id]);
    const modules = modulesResult.rows;
    
    for (let module of modules) {
      const lessonsResult = await db.query('SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_number', [module.id]);
      module.lessons = lessonsResult.rows;
    }
    
    course.modules = modules;
    
    res.json({ success: true, data: course });
  } catch (error) {
    console.error('Error fetching course details:', error);
    res.status(500).json({ success: false, message: 'Server error fetching course details' });
  }
};

const createCourse = async (req, res) => {
  try {
    const { 
      title, description, category, difficulty, thumbnail,
      course_code, department, semester, academic_year, 
      credits, objectives, prerequisites, status 
    } = req.body;
    const instructor_id = req.user.id;
    
    if (!title) {
      return res.status(400).json({ success: false, message: 'Course title is required' });
    }
    
    const result = await db.query(
      `INSERT INTO courses (
        title, description, category, difficulty, instructor_id, thumbnail,
        course_code, department, semester, academic_year, credits, objectives, prerequisites, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`,
      [
        title, description, category, difficulty, instructor_id, thumbnail,
        course_code, department, semester, academic_year, credits, objectives, prerequisites, status || 'DRAFT'
      ]
    );
    
    res.status(201).json({ success: true, message: 'Course created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating course:', error);
    res.status(500).json({ success: false, message: 'Server error creating course' });
  }
};

const updateCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      title, description, category, difficulty, thumbnail,
      course_code, department, semester, academic_year, 
      credits, objectives, prerequisites, status 
    } = req.body;
    const instructor_id = req.user.id;
    
    // Ensure the course belongs to the instructor
    const courseCheck = await db.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [id, instructor_id]);
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this course' });
    }
    
    const result = await db.query(
      `UPDATE courses SET 
        title = $1, description = $2, category = $3, difficulty = $4, thumbnail = $5,
        course_code = $6, department = $7, semester = $8, academic_year = $9, 
        credits = $10, objectives = $11, prerequisites = $12, status = $13
      WHERE id = $14 RETURNING *`,
      [
        title, description, category, difficulty, thumbnail,
        course_code, department, semester, academic_year, 
        credits, objectives, prerequisites, status, id
      ]
    );
    
    res.json({ success: true, message: 'Course updated successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error updating course:', error);
    res.status(500).json({ success: false, message: 'Server error updating course' });
  }
};

const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor_id = req.user.id;
    
    // Ensure the course belongs to the instructor
    const courseCheck = await db.query('SELECT * FROM courses WHERE id = $1 AND instructor_id = $2', [id, instructor_id]);
    if (courseCheck.rows.length === 0) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this course' });
    }
    
    await db.query('DELETE FROM courses WHERE id = $1', [id]);
    
    res.json({ success: true, message: 'Course deleted successfully' });
  } catch (error) {
    console.error('Error deleting course:', error);
    res.status(500).json({ success: false, message: 'Server error deleting course' });
  }
};

const getCourseContent = async (req, res) => {
  try {
    const { courseId } = req.params;
    
    const modulesRes = await db.query('SELECT * FROM modules WHERE course_id = $1 ORDER BY order_number', [courseId]);
    const modules = modulesRes.rows;

    for (let mod of modules) {
      const modId = mod.id;
      
      const [lessons, materials, resources, assignments, quizzes] = await Promise.all([
        db.query('SELECT * FROM lessons WHERE module_id = $1 ORDER BY order_number', [modId]),
        db.query('SELECT * FROM course_materials WHERE module_id = $1', [modId]),
        db.query('SELECT * FROM resources WHERE module_id = $1', [modId]),
        db.query('SELECT * FROM assignments WHERE module_id = $1', [modId]),
        db.query('SELECT * FROM quizzes WHERE module_id = $1', [modId])
      ]);

      mod.lessons = lessons.rows;
      mod.materials = materials.rows;
      mod.resources = resources.rows;
      mod.assignments = assignments.rows;
      mod.quizzes = quizzes.rows;
    }

    res.json({ success: true, data: modules });
  } catch (error) {
    console.error('Error fetching course content:', error);
    res.status(500).json({ success: false, message: 'Server error fetching course content' });
  }
};

module.exports = {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getCourseContent
};
