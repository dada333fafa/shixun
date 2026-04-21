const Match = require('../models/Match');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const User = require('../models/User');

// 创建匹配请求
exports.createMatch = async (req, res) => {
  try {
    const { teacher_id, student_id, request_from, request_message } = req.body;

    if (!teacher_id || !student_id || !request_from) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段'
      });
    }

    const match = await Match.create({
      teacherId: teacher_id,
      studentId: student_id,
      requestFrom: request_from,
      requestMessage: request_message || ''
    });

    res.status(201).json({
      status: 'success',
      message: '匹配请求已创建',
      data: match
    });
  } catch (error) {
    console.error('创建匹配错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取匹配列表
exports.getMatches = async (req, res) => {
  try {
    const { status, page = 1, page_size = 20 } = req.query;
    
    const teacher = await Teacher.findOne({ userId: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: '教师信息不存在'
      });
    }

    let query = { teacherId: teacher._id };
    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * page_size;
    
    const matches = await Match.find(query)
      .populate('teacherId')
      .populate('studentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(page_size));

    const total = await Match.countDocuments(query);

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        matches: matches.map(m => ({
          id: m._id,
          teacher_id: m.teacherId._id,
          teacher_name: m.teacherId.userId ? '教师' : '未知',
          student_id: m.studentId._id,
          student_name: m.studentId.userId ? '学生' : '未知',
          status: m.status,
          request_from: m.requestFrom,
          matched_at: m.updatedAt
        })),
        pagination: {
          total,
          page: parseInt(page),
          page_size: parseInt(page_size),
          pages: Math.ceil(total / page_size)
        }
      }
    });
  } catch (error) {
    console.error('获取匹配列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取匹配详情
exports.getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id)
      .populate('teacherId')
      .populate('studentId');

    if (!match) {
      return res.status(404).json({
        status: 'error',
        message: '匹配不存在'
      });
    }

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        id: match._id,
        teacher_id: match.teacherId._id,
        student_id: match.studentId._id,
        status: match.status,
        request_from: match.requestFrom,
        request_message: match.requestMessage,
        parent_approval: match.parentApproval,
        matched_at: match.matchedAt,
        created_at: match.createdAt
      }
    });
  } catch (error) {
    console.error('获取匹配详情错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 更新匹配状态
exports.updateMatch = async (req, res) => {
  try {
    const { status, parent_approval } = req.body;

    const match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({
        status: 'error',
        message: '匹配不存在'
      });
    }

    match.status = status || match.status;
    match.parentApproval = parent_approval !== undefined ? parent_approval : match.parentApproval;
    
    if (status === 'approved' || status === 'active') {
      match.matchedAt = new Date();
    }

    await match.save();

    res.json({
      status: 'success',
      message: '更新成功',
      data: {
        id: match._id,
        status: match.status,
        parent_approval: match.parentApproval,
        matched_at: match.matchedAt
      }
    });
  } catch (error) {
    console.error('更新匹配错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 删除匹配
exports.deleteMatch = async (req, res) => {
  try {
    const match = await Match.findByIdAndDelete(req.params.id);

    if (!match) {
      return res.status(404).json({
        status: 'error',
        message: '匹配不存在'
      });
    }

    res.json({
      status: 'success',
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除匹配错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
