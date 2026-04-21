const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Match = require('../models/Match');
const Resource = require('../models/Resource');

// 获取教师列表
exports.getTeachers = async (req, res) => {
  try {
    const { subject, page = 1, page_size = 20 } = req.query;
    
    let query = {};
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    const skip = (page - 1) * page_size;
    
    const teachers = await Teacher.find(query)
      .populate('userId', 'name phone email avatar')
      .skip(skip)
      .limit(parseInt(page_size));

    const total = await Teacher.countDocuments(query);

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        teachers: teachers.map(t => ({
          id: t._id,
          user_id: t.userId._id,
          name: t.userId.name,
          subject: t.subject,
          education: t.education,
          experience: t.experience,
          rating: t.rating
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
    console.error('获取教师列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取教师详情
exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id)
      .populate('userId', 'name phone email avatar');

    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: '教师不存在'
      });
    }

    const resourcesCount = await Resource.countDocuments({ teacherId: teacher._id });

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        id: teacher._id,
        user_id: teacher.userId._id,
        name: teacher.userId.name,
        subject: teacher.subject,
        education: teacher.education,
        experience: teacher.experience,
        introduction: teacher.introduction,
        rating: teacher.rating,
        resources_count: resourcesCount
      }
    });
  } catch (error) {
    console.error('获取教师详情错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取当前教师的仪表盘数据
exports.getDashboard = async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ userId: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: '教师信息不存在'
      });
    }

    // 统计活跃学生数
    const activeMatches = await Match.countDocuments({
      teacherId: teacher._id,
      status: { $in: ['active', 'approved'] }
    });

    // 统计待处理请求
    const pendingMatches = await Match.countDocuments({
      teacherId: teacher._id,
      status: 'pending'
    });

    // 统计资源数
    const resourcesCount = await Resource.countDocuments({ teacherId: teacher._id });

    // 获取学生列表
    const matches = await Match.find({
      teacherId: teacher._id,
      status: { $in: ['active', 'approved', 'pending'] }
    })
    .populate('studentId')
    .limit(5);

    const students = matches.map(m => ({
      id: m.studentId._id,
      name: m.studentId.userId ? '学生' : '未知',
      grade: m.studentId.grade,
      status: m.status === 'pending' ? '待确认' : '活跃'
    }));

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        stats: {
          activeStudents: activeMatches,
          pendingRequests: pendingMatches,
          resourcesCount,
          unreadMessages: 0
        },
        students
      }
    });
  } catch (error) {
    console.error('获取仪表盘数据错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
