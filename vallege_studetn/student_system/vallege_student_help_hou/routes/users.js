const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');

// @route   POST api/users/register
// @desc    注册用户
// @access  Public
router.post('/register', async (req, res) => {
  try {
    console.log('收到注册请求:', req.body);
    
    const { username, password, role, name, phone, email } = req.body;

    // 基本验证
    if (!username || !password || !role || !name) {
      return res.status(400).json({ msg: '请填写所有必填字段' });
    }

    if (password.length < 6) {
      return res.status(400).json({ msg: '密码长度至少6位' });
    }

    if (!['teacher', 'student', 'parent', 'admin'].includes(role)) {
      return res.status(400).json({ msg: '角色必须是teacher, student, parent或admin之一' });
    }

    // 检查用户是否已存在
    let user = await User.findOne({ username });
    if (user) {
      console.log('用户已存在:', username);
      return res.status(400).json({ msg: '用户已存在' });
    }

    // 创建新用户
    user = new User({
      username,
      password,
      role,
      name,
      phone,
      email
    });

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    console.log('准备保存用户:', { username, role, name });

    // 保存用户
    await user.save();
    console.log('用户保存成功:', user._id);

    // 根据角色创建对应的详细信息
    if (role === 'teacher') {
      const teacher = new Teacher({
        user: user._id,
        subject: '',
        introduction: ''
      });
      await teacher.save();
      console.log('教师信息保存成功');
    } else if (role === 'student') {
      const student = new Student({
        user: user._id,
        grade: '',
        school: ''
      });
      await student.save();
      console.log('学生信息保存成功');
    } else if (role === 'parent') {
      const parent = new Parent({
        user: user._id,
        relation: ''
      });
      await parent.save();
      console.log('家长信息保存成功');
    }

    // 返回JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      'your_jwt_secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        console.log('注册成功，生成token');
        res.json({ 
          msg: '用户注册成功',
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
          }
        });
      }
    );
  } catch (err) {
    console.error('注册错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   POST api/users/login
// @desc    用户登录
// @access  Public
router.post('/login', async (req, res) => {
  try {
    console.log('收到登录请求:', req.body);
    
    const { username, password } = req.body;

    // 基本验证
    if (!username || !password) {
      return res.status(400).json({ msg: '请输入用户名和密码' });
    }

    // 检查用户是否存在
    let user = await User.findOne({ username });
    if (!user) {
      console.log('用户不存在:', username);
      return res.status(400).json({ msg: '用户名或密码错误' });
    }

    console.log('找到用户:', user.username, '角色:', user.role);

    // 检查密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('密码不匹配');
      return res.status(400).json({ msg: '用户名或密码错误' });
    }

    console.log('密码匹配成功');

    // 返回JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };

    jwt.sign(
      payload,
      'your_jwt_secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        console.log('登录成功，生成token');
        res.json({ 
          msg: '登录成功',
          token,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            name: user.name
          }
        });
      }
    );
  } catch (err) {
    console.error('登录错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/users/me
// @desc    获取当前用户信息
// @access  Private
router.get('/me', async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ msg: '无访问权限，未提供token' });
    }

    const decoded = jwt.verify(token, 'your_jwt_secret');
    const userId = decoded.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: '用户不存在' });
    }

    res.json(user);
  } catch (err) {
    console.error('获取用户信息错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/users/teachers
// @desc    获取所有教师列表
// @access  Private
router.get('/teachers', async (req, res) => {
  try {
    // 获取所有教师用户
    const teachers = await User.find({ role: 'teacher' }).select('-password');
    
    // 获取每个教师的详细信息
    const teachersWithDetails = await Promise.all(
      teachers.map(async (teacher) => {
        const teacherDetail = await Teacher.findOne({ user: teacher._id });
        return {
          id: teacher._id.toString(), // 确保ID是字符串
          username: teacher.username,
          name: teacher.name,
          phone: teacher.phone,
          email: teacher.email,
          role: teacher.role,
          detail: teacherDetail
        };
      })
    );

    res.json(teachersWithDetails);
  } catch (err) {
    console.error('获取教师列表错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;