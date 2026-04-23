const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// 生成JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// 注册
exports.register = async (req, res) => {
  try {
    const { username, password, role, name, phone, email, grade, subject, education, experience } = req.body;

    // 验证必填字段
    if (!username || !password || !role || !name) {
      return res.status(400).json({
        status: 'error',
        message: '请填写所有必填字段'
      });
    }

    // 检查用户名是否已存在
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(409).json({
        status: 'error',
        message: '用户名已存在'
      });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await User.create({
      username,
      password: hashedPassword,
      role,
      name,
      phone,
      email
    });

    // 根据角色创建额外信息
    if (role === 'teacher') {
      await Teacher.create({
        user: user._id,
        subject: subject || '未填写',
        education: education || '',
        experience: experience || ''
      });
    } else if (role === 'student') {
      // 学生注册时自动创建Student记录
      await Student.create({
        user: user._id,
        grade: grade || '未填写',
        school: '',
        address: ''
      });
      console.log('✅ 已为学生创建记录, User ID:', user._id);
    } else if (role === 'parent') {
      // 家长注册时自动创建Parent记录
      await Parent.create({
        user: user._id,
        relation: req.body.relation || '其他'
      });
      console.log('✅ 已为家长创建记录, User ID:', user._id);
    }

    res.status(201).json({
      status: 'success',
      message: '注册成功',
      data: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 登录
exports.login = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // 验证必填字段
    if (!username || !password || !role) {
      return res.status(400).json({
        status: 'error',
        message: '请填写用户名、密码和角色'
      });
    }

    // 查找用户
    const user = await User.findOne({ username, role });
    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: '用户名或密码错误'
      });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        status: 'error',
        message: '用户名或密码错误'
      });
    }

    // 获取额外信息
    let extraInfo = {};
    if (role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        extraInfo = {
          subject: teacher.subject,
          education: teacher.education,
          experience: teacher.experience,
          rating: teacher.rating
        };
      }
    } else if (role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        extraInfo = {
          grade: student.grade,
          school: student.school
        };
      }
    } else if (role === 'parent') {
      const parent = await Parent.findOne({ user: user._id });
      if (parent) {
        extraInfo = {
          relation: parent.relation
        };
      }
    }

    // 生成token
    const token = generateToken(user._id);

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          avatar: user.avatar,
          ...extraInfo
        }
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 忘记密码
exports.forgotPassword = async (req, res) => {
  try {
    const { username, email } = req.body;

    if (!username || !email) {
      return res.status(400).json({
        status: 'error',
        message: '请填写用户名和邮箱'
      });
    }

    const user = await User.findOne({ username, email });
    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    // 这里应该发送重置邮件，暂时返回成功
    res.json({
      status: 'success',
      message: '密码重置链接已发送到您的邮箱'
    });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取当前用户信息
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    let extraInfo = {};
    if (user.role === 'teacher') {
      const teacher = await Teacher.findOne({ user: user._id });
      if (teacher) {
        extraInfo.teacher_info = {
          subject: teacher.subject,
          education: teacher.education,
          experience: teacher.experience,
          rating: teacher.rating
        };
      }
    } else if (user.role === 'student') {
      const student = await Student.findOne({ user: user._id });
      if (student) {
        extraInfo.student_info = {
          grade: student.grade,
          school: student.school,
          address: student.address
        };
      }
    }

    res.json({
      status: 'success',
      message: '获取成功',
      data: {
        ...user.toObject(),
        ...extraInfo
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 更新用户信息
exports.updateMe = async (req, res) => {
  try {
    const { name, phone, email, avatar } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, phone, email, avatar },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      status: 'success',
      message: '更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
