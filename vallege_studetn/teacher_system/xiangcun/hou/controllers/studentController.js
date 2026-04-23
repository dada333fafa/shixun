const Student = require('../models/Student');
const User = require('../models/User');
const Match = require('../models/Match');
const Teacher = require('../models/Teacher');
const TeacherStudentMatch = require('../models/TeacherStudentMatch');

// 获取学生列表 (教师)
exports.getStudents = async (req, res) => {
  try {
    const { grade, page = 1, page_size = 20 } = req.query;
    
    // 获取当前教师的Teacher记录
    const teacher = await Teacher.findOne({ user: req.user.id });
    
    if (!teacher) {
      return res.status(404).json({
        status: 'error',
        message: '教师信息不存在'
      });
    }
    
    // 查找与该教师有活跃匹配关系的学生ID（必须是active状态）
    const matches = await TeacherStudentMatch.find({
      teacher: teacher._id,
      status: { $in: ['active'] }  // 只查询active状态的匹配
    }).distinct('student');
    
    // 显示所有学生，不再限制为已匹配的学生
    let studentQuery = {};
    
    // 如果有匹配的学生，则只显示这些学生
    if (matches.length > 0) {
      studentQuery._id = { $in: matches };
    } else {
      // 如果没有匹配的学生，返回空列表
      return res.json({
        status: 'success',
        message: '获取成功',
        data: {
          students: [],
          pagination: {
            total: 0,
            page: parseInt(page),
            page_size: parseInt(page_size),
            pages: 0
          }
        }
      });
    }
    
    if (grade) {
      studentQuery.grade = { $regex: grade, $options: 'i' };
    }

    const skip = (page - 1) * page_size;
    
    const students = await Student.find(studentQuery)
      .populate('user', 'name phone email')
      .skip(skip)
      .limit(parseInt(page_size));

    const total = await Student.countDocuments(studentQuery);

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        students: students
          .filter(s => s.user) // 过滤掉没有关联用户的无效记录
          .map(s => ({
            id: s._id,
            user_id: s.user._id,
            name: s.user.name,
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
      .populate('user', 'name phone email');

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
        user_id: student.user._id,
        name: student.user.name,
        grade: student.grade,
        school: student.school,
        address: student.address,
        parent_id: student.parent
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
