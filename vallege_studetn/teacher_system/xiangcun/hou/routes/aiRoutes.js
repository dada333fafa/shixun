const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const AiRecommendation = require('../models/AiRecommendation');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const LearningProgress = require('../models/LearningProgress');
const PsychologicalStatus = require('../models/PsychologicalStatus');

// 获取特定学生的AI推荐
router.get('/student/:studentId', protect, async (req, res) => {
  try {
    const recommendations = await AiRecommendation.find({ student: req.params.studentId })
      .populate({
        path: 'recommendedTeacher',
        populate: {
          path: 'teacher',
          populate: {
            path: 'user',
            select: 'name subject'
          }
        }
      })
      .sort({ matchScore: -1 });
    
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
