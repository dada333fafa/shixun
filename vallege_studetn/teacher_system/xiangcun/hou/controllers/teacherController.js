const Teacher = require('../models/Teacher');
const User = require('../models/User');
const TeacherStudentMatch = require('../models/TeacherStudentMatch');
const Resource = require('../models/Resource');

// 获取教师列表
exports.getTeachers = async (req, res) => {
  try {
    const { subject, page = 1, page_size = 100 } = req.query;
    
    let query = {};
    if (subject) {
      query.subject = { $regex: subject, $options: 'i' };
    }

    const skip = (page - 1) * page_size;
    
    const teachers = await Teacher.find(query)
      .populate('user', 'name phone email avatar')
      .skip(skip)
      .limit(parseInt(page_size));

    const total = await Teacher.countDocuments(query);

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        teachers: teachers.map(t => ({
          id: t._id,
          user_id: t.user._id,
          name: t.user.name,
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
      .populate('user', 'name phone email avatar');

    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: '教师不存在'
      });
    }

    const resourcesCount = await Resource.countDocuments({ teacher: teacher._id });

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        id: teacher._id,
        user_id: teacher.user._id,
        name: teacher.user.name,
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
    const teacher = await Teacher.findOne({ user: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: '教师信息不存在'
      });
    }

    // 统计活跃学生数
    const activeMatches = await TeacherStudentMatch.countDocuments({
      teacher: teacher._id,
      status: { $in: ['active', 'approved'] }
    });

    // 统计待处理请求
    const pendingMatches = await TeacherStudentMatch.countDocuments({
      teacher: teacher._id,
      status: 'pending'
    });

    // 统计资源数
    const resourcesCount = await Resource.countDocuments({ teacher: teacher._id });

    // 获取学生列表
    let students = [];
    try {
      console.log('🔍 开始查询匹配数据...');
      console.log('  Teacher ID:', teacher._id);
      
      const matches = await TeacherStudentMatch.find({
        teacher: teacher._id,
        status: { $in: ['active', 'approved', 'pending'] }
      })
      .populate({ 
        path: 'student', 
        select: 'grade',
        populate: { path: 'user', select: 'name' } 
      })
      .sort({ createdAt: -1 })
      .limit(5);

      console.log('📦 匹配数据数量:', matches.length);
      matches.forEach((m, index) => {
        console.log(`📦 学生${index + 1}:`, {
          studentName: m.student?.user?.name || '未找到',
          studentId: m.student?._id,
          status: m.status,
          grade: m.student?.grade
        });
      });

      students = matches.filter(m => m.student).map(m => {
        const studentInfo = m.student.user || {};
        return {
          id: m.student._id.toString(),
          name: studentInfo.name || '学生',
          grade: m.student.grade || '未设置',
          status: m.status === 'pending' ? '待确认' : '活跃'
        };
      });
      
      console.log('✅ 最终学生列表:', students);
    } catch (matchError) {
      console.error('❌ 获取匹配数据错误:', matchError.message);
      console.error('❌ 错误堆栈:', matchError.stack);
      students = [];
    }

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
