const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const aiService = require('../services/aiService');

// @route   POST /api/v1/ai/match-student
// @desc    为学生匹配老师
// @access  Private (学生)
router.post('/match-student', protect, async (req, res) => {
  try {
    const { grade, learningNeeds, teacherPersonality } = req.body;

    // 验证输入
    if (!grade || !learningNeeds) {
      return res.status(400).json({
        success: false,
        message: '请提供年级和学习需求'
      });
    }

    // 调用AI匹配服务（从ai_teacher_profiles表读取）
    const result = await aiService.matchTeachersForStudent({
      grade,
      learningNeeds,
      teacherPersonality
    });

    res.json(result);
  } catch (error) {
    console.error('学生匹配教师失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// @route   POST /api/v1/ai/match-teacher
// @desc    为老师匹配学生
// @access  Private (教师)
router.post('/match-teacher', protect, async (req, res) => {
  try {
    const { subject, gradeRange, experience, teachingStyle, introduction } = req.body;

    // 验证输入
    if (!subject || !gradeRange || !experience) {
      return res.status(400).json({
        success: false,
        message: '请提供科目、年级范围和教学经验'
      });
    }

    // 调用AI匹配服务（从ai_student_profiles表读取）
    const result = await aiService.matchStudentsForTeacher({
      subject,
      gradeRange,
      experience,
      teachingStyle,
      introduction
    });

    res.json(result);
  } catch (error) {
    console.error('教师匹配学生失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// @route   GET /api/v1/ai/recommendations
// @desc    获取AI推荐列表
// @access  Private
router.get('/recommendations', protect, async (req, res) => {
  try {
    // 这里可以返回之前保存的推荐记录
    // 暂时返回空数组，后续可以扩展
    res.json({
      success: true,
      recommendations: []
    });
  } catch (error) {
    console.error('获取推荐列表失败:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

module.exports = router;
