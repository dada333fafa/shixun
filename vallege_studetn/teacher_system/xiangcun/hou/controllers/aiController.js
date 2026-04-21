const AIRecommendation = require('../models/AIRecommendation');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// 获取AI推荐
exports.getAIRecommendations = async (req, res) => {
  try {
    const { student_id, limit = 5 } = req.query;

    let query = {};
    
    if (student_id) {
      query.studentId = student_id;
    }

    const recommendations = await AIRecommendation.find(query)
      .populate('studentId')
      .populate('teacherId')
      .sort({ matchScore: -1 })
      .limit(parseInt(limit));

    res.json({
      status: 'success',
      message: '获取成功',
      data: recommendations.map(r => ({
        id: r._id,
        student_id: r.studentId._id,
        teacher_id: r.teacherId._id,
        teacher_name: r.teacherId.userId ? '教师' : '未知',
        subject: r.teacherId.subject,
        match_score: r.matchScore,
        reason: r.reason,
        generated_at: r.createdAt
      }))
    });
  } catch (error) {
    console.error('获取AI推荐错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 生成AI推荐 (模拟)
exports.generateAIRecommendations = async (req, res) => {
  try {
    const { subject, grade, experience, availability } = req.body;

    // 模拟AI匹配逻辑
    const teachers = await Teacher.find({
      subject: { $regex: subject || '.*', $options: 'i' }
    }).populate('userId');

    // 随机生成推荐
    const recommendations = teachers.slice(0, 5).map(teacher => ({
      teacherId: teacher._id,
      matchScore: Math.floor(Math.random() * 30) + 70, // 70-100
      reason: `根据${subject || '学科'}需求匹配`
    }));

    res.json({
      status: 'success',
      message: '推荐生成成功',
      data: recommendations
    });
  } catch (error) {
    console.error('生成AI推荐错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
