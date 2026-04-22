const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const PsychologicalStatus = require('../models/PsychologicalStatus');
const Student = require('../models/Student');

// @route   POST api/psychological/assess
// @desc    提交心理健康评估
// @access  Private
router.post('/assess', protect, async (req, res) => {
  try {
    const {
      emotionalState,
      anxietyLevel,
      depressionLevel,
      assessmentData
    } = req.body;

    // 验证必填字段
    if (!emotionalState || anxietyLevel === undefined || depressionLevel === undefined) {
      return res.status(400).json({ msg: '评估数据不完整' });
    }

    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    // 根据评估分数生成建议
    let recommendation = '';
    if (anxietyLevel >= 7 || depressionLevel >= 7 || emotionalState === 'critical') {
      recommendation = '建议尽快联系心理咨询师进行专业辅导。';
    } else if (anxietyLevel >= 4 || depressionLevel >= 4 || emotionalState === 'poor') {
      recommendation = '建议与心理咨询师进行沟通，学习一些情绪管理技巧。';
    } else {
      recommendation = '你的心理状态良好，请继续保持积极的心态。';
    }

    // 创建心理评估记录
    const newAssessment = new PsychologicalStatus({
      student: student._id,
      assessmentDate: new Date(),
      emotionalState: emotionalState,
      anxietyLevel: anxietyLevel,
      depressionLevel: depressionLevel,
      counselorNotes: assessmentData ? JSON.stringify(assessmentData) : '',
      recommendation: recommendation
    });

    const assessment = await newAssessment.save();

    res.json({
      msg: '评估完成',
      assessment
    });
  } catch (err) {
    console.error('心理评估错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/psychological/history
// @desc    获取心理评估历史
// @access  Private
router.get('/history', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    const assessments = await PsychologicalStatus.find({ student: student._id })
      .sort({ assessmentDate: -1 });

    res.json(assessments);
  } catch (err) {
    console.error('获取评估历史错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;
