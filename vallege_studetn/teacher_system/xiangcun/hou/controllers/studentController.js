const Student = require('../models/Student');
const User = require('../models/User');
const Match = require('../models/Match');
const Teacher = require('../models/Teacher');

// 获取学生列表 (教师)
exports.getStudents = async (req, res) => {
  try {
    const { grade, page = 1, page_size = 20 } = req.query;
    
    const teacher = await Teacher.findOne({ userId: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: '教师信息不存在'
      });
    }

    // 获取该教师匹配的学生
    const matches = await Match.find({
      teacherId: teacher._id,
      status: { $in: ['active', 'approved'] }
    }).populate('studentId');

    let query = { _id: { $in: matches.map(m => m.studentId._id) } };
    
    if (grade) {
      query.grade = { $regex: grade, $options: 'i' };
    }

    const skip = (page - 1) * page_size;
    
    const students = await Student.find(query)
      .populate('userId', 'name phone email')
      .skip(skip)
      .limit(parseInt(page_size));

    const total = await Student.countDocuments(query);

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        students: students.map(s => ({
          id: s._id,
          user_id: s.userId._id,
          name: s.userId.name,
          grade: s.grade,
          school: s.school,
          address: s.address,
          status: '活跃'
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
    console.error('获取学生列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取学生详情
exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id)
      .populate('userId', 'name phone email');

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: '学生不存在'
      });
    }

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        id: student._id,
        user_id: student.userId._id,
        name: student.userId.name,
        grade: student.grade,
        school: student.school,
        address: student.address,
        parent_id: student.parentId
      }
    });
  } catch (error) {
    console.error('获取学生详情错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
