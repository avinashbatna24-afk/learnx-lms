const db = require('./index');

const migratePhaseA = async () => {
  const query = `
    -- 1. Courses Table Upgrades
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS course_code VARCHAR(50);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS department VARCHAR(255);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS semester VARCHAR(50);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS academic_year VARCHAR(50);
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS credits INTEGER;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS objectives TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS prerequisites TEXT;
    ALTER TABLE courses ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'DRAFT';

    -- 2. Quizzes Table Upgrades
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS instructions TEXT;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS start_date TIMESTAMP;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS end_date TIMESTAMP;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS total_marks INTEGER;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS passing_marks INTEGER;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS max_attempts INTEGER DEFAULT 1;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS randomize_questions BOOLEAN DEFAULT FALSE;
    ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS show_results BOOLEAN DEFAULT TRUE;

    -- 3. New LMS Tables
    CREATE TABLE IF NOT EXISTS course_materials (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      material_type VARCHAR(100),
      file_url TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS resources (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      resource_type VARCHAR(100),
      url TEXT,
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id SERIAL PRIMARY KEY,
      course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
      module_id INTEGER REFERENCES modules(id) ON DELETE CASCADE,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      instructions TEXT,
      total_marks INTEGER,
      start_date TIMESTAMP,
      due_date TIMESTAMP,
      allow_late_submission BOOLEAN DEFAULT FALSE,
      late_penalty DECIMAL(5, 2),
      submission_type VARCHAR(50),
      created_by INTEGER REFERENCES users(id),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assignment_submissions (
      id SERIAL PRIMARY KEY,
      assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
      student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
      text_submission TEXT,
      file_url TEXT,
      submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_late BOOLEAN DEFAULT FALSE,
      marks INTEGER,
      feedback TEXT,
      graded_at TIMESTAMP,
      graded_by INTEGER REFERENCES users(id)
    );

    -- 4. Quiz Questions Refactor
    -- Warning: Dropping old quiz_answers and questions tables since format completely changes
    DROP TABLE IF EXISTS quiz_answers CASCADE;
    DROP TABLE IF EXISTS questions CASCADE;

    CREATE TABLE IF NOT EXISTS quiz_questions (
      id SERIAL PRIMARY KEY,
      quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      question_type VARCHAR(50) NOT NULL,
      marks INTEGER DEFAULT 1,
      negative_marks DECIMAL(5, 2) DEFAULT 0,
      topic VARCHAR(255),
      order_number INTEGER,
      explanation TEXT
    );

    CREATE TABLE IF NOT EXISTS quiz_options (
      id SERIAL PRIMARY KEY,
      question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
      option_text TEXT NOT NULL,
      is_correct BOOLEAN DEFAULT FALSE,
      order_number INTEGER
    );

    CREATE TABLE IF NOT EXISTS quiz_answers (
      id SERIAL PRIMARY KEY,
      attempt_id INTEGER REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      question_id INTEGER REFERENCES quiz_questions(id) ON DELETE CASCADE,
      selected_option_id INTEGER REFERENCES quiz_options(id) ON DELETE SET NULL,
      text_answer TEXT,
      is_correct BOOLEAN,
      marks_awarded DECIMAL(5, 2)
    );
  `;
  try {
    await db.query(query);
    console.log('Phase A migration completed successfully!');
  } catch (error) {
    console.error('Error during Phase A migration:', error);
  } finally {
    db.pool.end();
  }
};

migratePhaseA();
