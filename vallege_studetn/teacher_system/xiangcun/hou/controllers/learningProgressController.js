const LearningProgress = require('../models/LearningProgress');

// 获取学习进度
exports.getLearningProgress = async (req, res) => {
  try {
    const { student_id } = req.query;

    let query = {};
    
    if (student_id) {
      query.studentId = student_id;
    }

    const progress = await LearningProgress.find(query)
      .populate('studentId')
      .sort({ updatedAt: -1 });

    res.json({
      status: 'success',
      message: '获取成功',
      data: progress
    });
  } catch (error) {
    console.error('获取学习进度错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 创建或更新学习进度
exports.updateLearningProgress = async (req, res) => {
  try {
    const { student_id, subject, progress } = req.body;

    if (!student_id || !subject || progress === undefined) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段'
      });
    }

    // 查找是否存在记录
    let record = await LearningProgress.findOne({ studentId: student_id, subject });

    if (record) {
      // 更新
      record.progress = progress;
      await record.save();
    } else {
      // 创建
      record = await LearningProgress.create({
        studentId: student_id,
        subject,
        progress
      });
    }

    res.status(201).json({
      status: 'success',
      message: '更新成功',
      data: record
    });
  } catch (error) {
    console.error('更新学习进度错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
