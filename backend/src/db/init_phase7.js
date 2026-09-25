const db = require('./index');

const createPhase7Tables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS recommendations (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      topic VARCHAR(255) NOT NULL,
      recommendation_type VARCHAR(50) NOT NULL,
      reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await db.query(query);
    console.log('Phase 7 tables created successfully');
  } catch (error) {
    console.error('Error creating Phase 7 tables:', error);
  } finally {
    db.pool.end();
  }
};

createPhase7Tables();
