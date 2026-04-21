const Psychological = require('../models/Psychological');
const Student = require('../models/Student');

// 获取心理状态
exports.getPsychologicalStatus = async (req, res) => {
  try {
    const { student_id, limit = 10 } = req.query;

    let query = {};
    
    if (student_id) {
      query.studentId = student_id;
    }

    const records = await Psychological.find(query)
      .populate('studentId')
      .sort({ assessmentDate: -1 })
      .limit(parseInt(limit));

    res.json({
      status: 'success',
      message: '获取成功',
      data: records
    });
  } catch (error) {
    console.error('获取心理状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 提交心理评估
exports.createPsychologicalRecord = async (req, res) => {
  try {
    const { student_id, emotional_state, anxiety_level, depression_level, counselor_notes, recommendation } = req.body;

    if (!student_id || !emotional_state) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段'
      });
    }

    const record = await Psychological.create({
      studentId: student_id,
      assessmentDate: new Date(),
      emotionalState: emotional_state,
      anxietyLevel: anxiety_level || 0,
      depressionLevel: depression_level || 0,
      counselorNotes: counselor_notes || '',
      recommendation: recommendation || ''
    });

    res.status(201).json({
      status: 'success',
      message: '提交成功',
      data: record
    });
  } catch (error) {
    console.error('提交心理评估错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
