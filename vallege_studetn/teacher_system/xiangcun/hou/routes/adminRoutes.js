const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
const bcrypt = require('bcryptjs');
const { protect, authorize } = require('../middleware/auth');

// 获取所有用户（仅管理员）
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // 构建查询条件
    const query = {};
    
    if (req.query.search) {
      query.$or = [
        { username: { $regex: req.query.search, $options: 'i' } },
        { name: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    if (req.query.role) {
      query.role = req.query.role;
    }
    
    if (req.query.status) {
      query.isActive = req.query.status === 'active';
    }

    const users = await User.find(query)
      .select('-password')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users: users.map(user => ({
        _id: user._id,
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive !== false, // 默认为true
        createdAt: user.createdAt
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 创建新用户
router.post('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { username, password, role, name, phone, email } = req.body;

    // 验证必填字段
    if (!username || !password || !role || !name) {
      return res.status(400).json({
        success: false,
        message: '请填写所有必填字段'
      });
    }

    // 检查用户是否已存在
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
    }

    // 验证角色
    const validRoles = ['teacher', 'student', 'parent', 'admin'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        message: '无效的角色类型'
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
      email,
      isActive: true
    });

    // 根据角色创建额外信息
    if (role === 'teacher') {
      await Teacher.create({
        user: user._id,
        subject: '未填写',
        education: '',
        experience: ''
      });
    } else if (role === 'student') {
      await Student.create({
        user: user._id,
        grade: '未填写',
        school: '',
        address: ''
      });
    } else if (role === 'parent') {
      await Parent.create({
        user: user._id,
        relation: '其他'
      });
    }

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});

// 更新用户信息
router.put('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 更新用户信息
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.phone = req.body.phone || user.phone;
    user.role = req.body.role || user.role;

    await user.save();

    res.json({
      success: true,
      message: '用户信息更新成功',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器错误',
      error: error.message
    });
  }
});
router.put('/users/:id/status', protect, authorize('admin'), async (req, res) => {
  try {
    const { isActive } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    res.json({
      status: 'success',
      message: '用户状态更新成功',
      data: user
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
});

// 删除用户
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在'
      });
    }

    res.json({
      status: 'success',
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
});

// 获取系统统计信息
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const teacherCount = await User.countDocuments({ role: 'teacher' });
    const studentCount = await User.countDocuments({ role: 'student' });
    const parentCount = await User.countDocuments({ role: 'parent' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    res.json({
      status: 'success',
      message: '获取统计信息成功',
      data: {
        teachers: teacherCount,
        students: studentCount,
        parents: parentCount,
        admins: adminCount,
        total: teacherCount + studentCount + parentCount + adminCount
      }
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
});

module.exports = router;