const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const PsychologicalStatus = require('../models/PsychologicalStatus');
const Student = require('../models/Student');

// @route   POST api/psychological/assess
// @desc    提交心理健康评估
// @access  Private
router.post('/assess', auth, async (req, res) => {
  try {
    const {
      emotionalState,
      anxietyLevel,
      depressionLevel,
      assessmentData
    } = req.body;

    console.log('\n========== 心理评估请求 ==========');
    console.log('情绪状态:', emotionalState);
    console.log('焦虑水平:', anxietyLevel);
    console.log('抑郁水平:', depressionLevel);

    // 验证必填字段
    if (!emotionalState || anxietyLevel === undefined || depressionLevel === undefined) {
      return res.status(400).json({ msg: '评估数据不完整' });
    }

    // 验证数值范围
    if (anxietyLevel < 0 || anxietyLevel > 10 || depressionLevel < 0 || depressionLevel > 10) {
      return res.status(400).json({ msg: '焦虑或抑郁水平必须在0-10之间' });
    }

    // 验证情绪状态
    const validStates = ['excellent', 'good', 'normal', 'poor', 'critical'];
    if (!validStates.includes(emotionalState)) {
      return res.status(400).json({ msg: '无效的情绪状态' });
    }

    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    // 根据评估分数生成建议
    let recommendation = '';
    if (anxietyLevel >= 7 || depressionLevel >= 7 || emotionalState === 'critical') {
      recommendation = '建议尽快联系心理咨询师进行专业辅导。你的焦虑/抑郁水平较高，需要专业帮助。';
    } else if (anxietyLevel >= 4 || depressionLevel >= 4 || emotionalState === 'poor') {
      recommendation = '建议与心理咨询师进行沟通，学习一些情绪管理技巧。保持积极的生活态度，多与同学朋友交流。';
    } else if (emotionalState === 'excellent' || emotionalState === 'good') {
      recommendation = '你的心理状态良好，请继续保持积极的心态。如果遇到困难，随时可以寻求心理老师的帮助。';
    } else {
      recommendation = '你的心理状态基本正常，建议保持规律作息，适当运动，多与朋友交流。';
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

    console.log('评估记录已保存:', assessment._id);

    res.json({
      msg: '评估完成',
      assessment: {
        id: assessment._id,
        emotionalState: assessment.emotionalState,
        anxietyLevel: assessment.anxietyLevel,
        depressionLevel: assessment.depressionLevel,
        recommendation: assessment.recommendation,
        assessmentDate: assessment.assessmentDate
      }
    });
  } catch (err) {
    console.error('心理评估错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/psychological/history
// @desc    获取心理评估历史
// @access  Private
router.get('/history', auth, async (req, res) => {
  try {
    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    // 获取评估历史
    const assessments = await PsychologicalStatus.find({ student: student._id })
      .sort({ assessmentDate: -1 });

    res.json(assessments);
  } catch (err) {
    console.error('获取评估历史错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/psychological/latest
// @desc    获取最新评估结果
// @access  Private
router.get('/latest', auth, async (req, res) => {
  try {
    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    // 获取最新评估
    const latest = await PsychologicalStatus.findOne({ student: student._id })
      .sort({ assessmentDate: -1 });

    res.json(latest || {});
  } catch (err) {
    console.error('获取最新评估错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;
