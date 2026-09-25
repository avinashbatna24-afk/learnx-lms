const db = require('../db');

// Instructor: Create a quiz
const createQuiz = async (req, res) => {
  try {
    const { course_id, module_id, title, description } = req.body;
    
    if (!course_id || !title) {
      return res.status(400).json({ success: false, message: 'Course ID and title are required' });
    }

    const result = await db.query(
      'INSERT INTO quizzes (course_id, module_id, title, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [course_id, module_id || null, title, description]
    );

    res.status(201).json({ success: true, message: 'Quiz created successfully', data: result.rows[0] });
  } catch (error) {
    console.error('Error creating quiz:', error);
    res.status(500).json({ success: false, message: 'Server error creating quiz' });
  }
};

// Instructor: Add a question to a quiz
const addQuestion = async (req, res) => {
  try {
    const { id: quiz_id } = req.params;
    const { question_text, question_type, marks, options, explanation } = req.body;

    if (!question_text || !question_type || !options || !Array.isArray(options)) {
      return res.status(400).json({ success: false, message: 'Invalid question format' });
    }

    // Insert Question
    const qResult = await db.query(
      `INSERT INTO quiz_questions (quiz_id, question_text, question_type, marks, explanation)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [quiz_id, question_text, question_type, marks || 1, explanation]
    );
    const newQuestion = qResult.rows[0];

    // Insert Options
    for (let i = 0; i < options.length; i++) {
      await db.query(
        `INSERT INTO quiz_options (question_id, option_text, is_correct, order_number) VALUES ($1, $2, $3, $4)`,
        [newQuestion.id, options[i].text, options[i].is_correct || false, i + 1]
      );
    }

    res.status(201).json({ success: true, message: 'Question added successfully', data: newQuestion });
  } catch (error) {
    console.error('Error adding question:', error);
    res.status(500).json({ success: false, message: 'Server error adding question' });
  }
};

// Student/Public: Get a quiz (exclude correct answers)
const getQuizById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const quizResult = await db.query('SELECT * FROM quizzes WHERE id = $1', [id]);
    if (quizResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    const quiz = quizResult.rows[0];

    // Fetch questions
    const questionsResult = await db.query(
      'SELECT id, question_text, question_type, marks FROM quiz_questions WHERE quiz_id = $1 ORDER BY id',
      [id]
    );
    const questions = questionsResult.rows;

    // Fetch options (excluding is_correct flag for students)
    for (let q of questions) {
      const optionsRes = await db.query('SELECT id, option_text, order_number FROM quiz_options WHERE question_id = $1 ORDER BY order_number', [q.id]);
      q.options = optionsRes.rows;
    }

    quiz.questions = questions;
    res.json({ success: true, data: quiz });
  } catch (error) {
    console.error('Error fetching quiz:', error);
    res.status(500).json({ success: false, message: 'Server error fetching quiz' });
  }
};

// Student/Public: Get quizzes for a course
const getQuizzesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const result = await db.query('SELECT id, title, description FROM quizzes WHERE course_id = $1', [courseId]);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    console.error('Error fetching course quizzes:', error);
    res.status(500).json({ success: false, message: 'Server error fetching quizzes' });
  }
};

// Student: Submit a quiz
const submitQuiz = async (req, res) => {
  try {
    const { id: quiz_id } = req.params;
    const { answers } = req.body; // Array of { question_id, selected_option_ids: [] }
    const student_id = req.user.id;

    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers must be an array' });
    }

    const questionsResult = await db.query('SELECT id, marks FROM quiz_questions WHERE quiz_id = $1', [quiz_id]);
    const questions = questionsResult.rows;
    const total_questions = questions.length;
    
    if (total_questions === 0) {
      return res.status(400).json({ success: false, message: 'Quiz has no questions' });
    }

    let score = 0;
    const processedAnswers = [];

    // Score calculation logic for phase F
    for (let q of questions) {
      const studentAnswer = answers.find(a => a.question_id === q.id);
      let is_correct = false;
      let selectedOptionId = null;

      if (studentAnswer && studentAnswer.selected_option_ids && studentAnswer.selected_option_ids.length > 0) {
        selectedOptionId = studentAnswer.selected_option_ids[0];
        
        // Simple scoring: checks if the selected option is correct
        const correctRes = await db.query('SELECT is_correct FROM quiz_options WHERE id = $1', [selectedOptionId]);
        if (correctRes.rows.length > 0 && correctRes.rows[0].is_correct) {
          is_correct = true;
          score += q.marks;
        }
      }
      
      processedAnswers.push({
        question_id: q.id,
        selected_option_id: selectedOptionId,
        is_correct
      });
    }

    const attemptResult = await db.query(
      'INSERT INTO quiz_attempts (student_id, quiz_id, score, total_questions) VALUES ($1, $2, $3, $4) RETURNING id',
      [student_id, quiz_id, score, total_questions]
    );
    const attempt_id = attemptResult.rows[0].id;

    for (let ans of processedAnswers) {
      await db.query(
        'INSERT INTO quiz_answers (attempt_id, question_id, selected_option_id, is_correct) VALUES ($1, $2, $3, $4)',
        [attempt_id, ans.question_id, ans.selected_option_id, ans.is_correct]
      );
    }

    res.json({ 
      success: true, 
      message: 'Quiz submitted successfully', 
      data: { attempt_id, score, total_questions }
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ success: false, message: 'Server error submitting quiz' });
  }
};

// Student: Get quiz result
const getQuizResult = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const student_id = req.user.id;
    
    const resultQuery = await db.query(
      'SELECT * FROM quiz_attempts WHERE id = $1 AND student_id = $2',
      [attemptId, student_id]
    );
    
    if (resultQuery.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Attempt not found' });
    }
    
    res.json({ success: true, data: resultQuery.rows[0] });
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    res.status(500).json({ success: false, message: 'Server error fetching quiz result' });
  }
};

module.exports = {
  createQuiz,
  addQuestion,
  getQuizById,
  getQuizzesByCourse,
  submitQuiz,
  getQuizResult
};
