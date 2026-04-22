const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/users
// @desc    获取用户列表(支持分页和筛选)
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
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
        isActive: user.isActive,
        createdAt: user.createdAt
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// @route   POST /api/users
// @desc    创建新用户
// @access  Private/Admin
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { username, password, role, name, phone, email } = req.body;

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

    // 创建用户
    const user = await User.create({
      username,
      password,
      role,
      name,
      phone,
      email,
      isActive: true
    });

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
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// @route   PUT /api/users/:id
// @desc    更新用户信息
// @access  Private/Admin
router.put('/:id', protect, adminOnly, async (req, res) => {
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
        phone: user.phone
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// @route   PUT /api/users/:id/status
// @desc    更新用户状态
// @access  Private/Admin
router.put('/:id/status', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: '用户不存在' 
      });
    }

    user.isActive = req.body.isActive;
    await user.save();

    res.json({
      success: true,
      message: '用户状态更新成功',
      user: {
        _id: user._id,
        username: user.username,
        name: user.name,
        isActive: user.isActive
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

module.exports = router;
