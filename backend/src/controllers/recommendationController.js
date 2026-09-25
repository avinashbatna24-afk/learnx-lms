const db = require('../db');

const generateRecommendations = async (req, res) => {
  try {
    const student_id = req.user.id;

    // 1. Clear old recommendations
    await db.query('DELETE FROM recommendations WHERE student_id = $1', [student_id]);

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

    const newRecommendations = [];

    // 3. Generate recommendations based on rule engine
    Object.keys(topicStats).forEach(topic => {
      const stat = topicStats[topic];
      const percentage = Math.round((stat.correct / stat.total) * 100);
      
      let recommendation_type = '';
      let reason = '';

      if (percentage >= 80) {
        recommendation_type = 'advanced';
        reason = `You scored ${percentage}% in ${topic}. We recommend taking on advanced challenges to master this topic.`;
      } else if (percentage >= 50) {
        recommendation_type = 'practice';
        reason = `You scored ${percentage}% in ${topic}. Consistent practice will help you improve.`;
      } else {
        recommendation_type = 'beginner';
        reason = `You scored ${percentage}% in ${topic}. We recommend revisiting the foundational concepts.`;
      }

      newRecommendations.push({
        student_id,
        topic,
        recommendation_type,
        reason
      });
    });

    // 4. Save new recommendations to DB
    for (const rec of newRecommendations) {
      await db.query(
        'INSERT INTO recommendations (student_id, topic, recommendation_type, reason) VALUES ($1, $2, $3, $4)',
        [rec.student_id, rec.topic, rec.recommendation_type, rec.reason]
      );
    }

    // 5. Fetch and return
    const result = await db.query('SELECT * FROM recommendations WHERE student_id = $1 ORDER BY created_at DESC', [student_id]);
    
    res.json({
      success: true,
      message: 'Recommendations generated successfully',
      data: result.rows
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ success: false, message: 'Server error generating recommendations' });
  }
};

module.exports = {
  generateRecommendations
};
