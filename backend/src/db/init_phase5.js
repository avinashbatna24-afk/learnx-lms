const db = require('./index');

const createPhase5Tables = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS quizzes (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      option_a VARCHAR(255) NOT NULL,
      option_b VARCHAR(255) NOT NULL,
      option_c VARCHAR(255) NOT NULL,
      option_d VARCHAR(255) NOT NULL,
      correct_option VARCHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
      topic VARCHAR(255)
    );

    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id SERIAL PRIMARY KEY,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      score INTEGER NOT NULL,
      total_questions INTEGER NOT NULL,
      attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS quiz_answers (
      id SERIAL PRIMARY KEY,
      attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
      selected_option VARCHAR(1) CHECK (selected_option IN ('A', 'B', 'C', 'D')),
      is_correct BOOLEAN NOT NULL
    );
  `;
  try {
    await db.query(query);
    console.log('Phase 5 tables created successfully');
  } catch (error) {
    console.error('Error creating Phase 5 tables:', error);
  } finally {
    db.pool.end();
  }
};

createPhase5Tables();
