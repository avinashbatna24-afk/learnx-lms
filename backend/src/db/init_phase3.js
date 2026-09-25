const db = require('./index');

const createPhase3Tables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS courses (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      difficulty VARCHAR(50),
      instructor_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      thumbnail VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS modules (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      order_number INTEGER
    );

    CREATE TABLE IF NOT EXISTS lessons (
      id SERIAL PRIMARY KEY,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      content TEXT,
      video_url VARCHAR(255),
      order_number INTEGER
    );
  `;
  try {
    await db.query(query);
    console.log('Phase 3 tables created successfully');
  } catch (error) {
    console.error('Error creating Phase 3 tables:', error);
  } finally {
    db.pool.end();
  }
};

createPhase3Tables();
