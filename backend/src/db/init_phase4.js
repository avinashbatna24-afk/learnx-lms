const db = require('./index');

const createPhase4Tables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS enrollments (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, course_id)
    );

    CREATE TABLE IF NOT EXISTS lesson_progress (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
      completed BOOLEAN DEFAULT TRUE,
      completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, lesson_id)
    );
  `;
  try {
    await db.query(query);
    console.log('Phase 4 tables created successfully');
  } catch (error) {
    console.error('Error creating Phase 4 tables:', error);
  } finally {
    db.pool.end();
  }
};

createPhase4Tables();
