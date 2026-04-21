const express = require('express');
const router = express.Router();
const AiRecommendation = require('../models/AiRecommendation');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const LearningProgress = require('../models/LearningProgress');
const PsychologicalStatus = require('../models/PsychologicalStatus');
const auth = require('../middleware/auth'); // 假设有认证中间件

// 获取特定学生的AI推荐
router.get('/student/:studentId', auth, async (req, res) => {
  try {
    const recommendations = await AiRecommendation.find({ student: req.params.studentId })
      .populate({
        path: 'recommendedTeacher',
        populate: {
          path: 'user',
          select: 'name subject'
        }
      })
      .populate('student', ['user', 'grade'])
      .sort({ matchScore: -1 });
    
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 生成AI推荐
router.post('/generate/:studentId', auth, async (req, res) => {
  try {
    const studentId = req.params.studentId;
    
    // 获取学生信息
    const student = await Student.findById(studentId).populate('user');
    if (!student) {
      return res.status(404).json({ msg: 'Student not found' });
    }
    
    // 获取学生的学习进度
    const learningProgress = await LearningProgress.find({ student: studentId });
    
    // 获取学生的心理状态
    const psychologicalStatus = await PsychologicalStatus.findOne({ student: studentId })
      .sort({ assessmentDate: -1 });
    
    // 这里是一个简化的AI推荐逻辑，实际应用中可能更复杂
    // 根据学生的学习进度和心理状态来推荐合适的教师
    
    // 获取所有教师
    const allTeachers = await Teacher.find().populate('user', ['name', 'subject']);
    
    // 模拟AI推荐算法
    const recommendations = [];
    
    for (const teacher of allTeachers) {
      // 计算匹配度 - 这是一个简化的示例
      let matchScore = 0;
      let reason = '';
      
      // 根据学科匹配
      if (learningProgress.some(prog => prog.subject === teacher.subject)) {
        matchScore += 30;
        reason += `学科匹配(${teacher.subject})`;
      }
      
      // 根据教师评分
      matchScore += (teacher.rating / 5) * 20;
      
      // 可以添加更多复杂的匹配逻辑
      
      // 创建推荐记录
      const newRecommendation = new AiRecommendation({
        student: studentId,
        recommendedTeacher: teacher._id,
        matchScore: Math.min(matchScore, 100),
        reason: reason || '综合匹配'
      });
      
      await newRecommendation.save();
      recommendations.push(newRecommendation);
    }
    
    // 返回前3个最高匹配度的推荐
    const topRecommendations = recommendations
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);
    
    res.json(topRecommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 获取所有AI推荐
router.get('/', auth, async (req, res) => {
  try {
    const recommendations = await AiRecommendation.find()
      .populate({
        path: 'recommendedTeacher',
        populate: {
          path: 'user',
          select: 'name subject'
        }
      })
      .populate({
        path: 'student',
        populate: {
          path: 'user',
          select: 'name grade'
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(recommendations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;