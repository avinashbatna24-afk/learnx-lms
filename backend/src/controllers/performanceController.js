const db = require('../db');

const getMyPerformance = async (req, res) => {
  try {
    const student_id = req.user.id;

    // 1. Fetch overall average quiz score
    const avgScoreQuery = `
      SELECT COALESCE(AVG((score::decimal / total_questions) * 100), 0) as overall_average
      FROM quiz_attempts
      WHERE student_id = $1 AND total_questions > 0
    `;
    const avgScoreResult = await db.query(avgScoreQuery, [student_id]);
    const overall_average = Math.round(parseFloat(avgScoreResult.rows[0].overall_average));

    // 2. Fetch all answers for the student to analyze topics
    const answersQuery = `
      SELECT q.topic, qa.is_correct
      FROM quiz_answers qa
      JOIN questions q ON qa.question_id = q.id
      JOIN quiz_attempts att ON qa.attempt_id = att.id
      WHERE att.student_id = $1 AND q.topic IS NOT NULL AND q.topic != ''
    `;
    const answersResult = await db.query(answersQuery, [student_id]);
    
    // Process answers by topic
    const topicStats = {};
    answersResult.rows.forEach(ans => {
      const topic = ans.topic;
      if (!topicStats[topic]) {
        topicStats[topic] = { correct: 0, total: 0 };
      }
      topicStats[topic].total += 1;
      if (ans.is_correct) {
        topicStats[topic].correct += 1;
      }
    });

    const strong = [];
    const average = [];
    const weak = [];

    Object.keys(topicStats).forEach(topic => {
      const stat = topicStats[topic];
      const percentage = Math.round((stat.correct / stat.total) * 100);
      
      const topicObj = { topic, percentage, totalQuestions: stat.total };
      
      if (percentage >= 80) {
        strong.push(topicObj);
      } else if (percentage >= 50) {
        average.push(topicObj);
      } else {
        weak.push(topicObj);
      }
    });

    // 3. Fetch recent quiz scores
    const recentScoresQuery = `
      SELECT q.title as quiz_title, att.score, att.total_questions, att.attempted_at
      FROM quiz_attempts att
      JOIN quizzes q ON att.quiz_id = q.id
      WHERE att.student_id = $1
      ORDER BY att.attempted_at DESC
      LIMIT 5
    `;
    const recentScoresResult = await db.query(recentScoresQuery, [student_id]);
    const recentScores = recentScoresResult.rows.map(row => ({
      quiz_title: row.quiz_title,
      percentage: Math.round((row.score / row.total_questions) * 100),
      attempted_at: row.attempted_at
    }));

    res.json({
      success: true,
      data: {
        overall_average,
        topics: { strong, average, weak },
        recentScores
      }
    });

  } catch (error) {
    console.error('Error fetching performance:', error);
    res.status(500).json({ success: false, message: 'Server error fetching performance data' });
  }
};

module.exports = {
  getMyPerformance
};
