const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 生成JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// @route   POST /api/auth/register
// @desc    注册新用户
// @access  Public
router.post('/register', async (req, res) => {
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

    // 创建用户
    const user = await User.create({
      username,
      password,
      role: role || 'admin',
      name,
      phone,
      email
    });

    if (user) {
      res.status(201).json({
        success: true,
        data: {
          _id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          token: generateToken(user._id)
        }
      });
    } else {
      res.status(400).json({ 
        success: false, 
        message: '注册失败' 
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ 
      success: false, 
      message: '服务器错误',
      error: error.message 
    });
  }
});

// @route   POST /api/auth/login
// @desc    用户登录
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    // 检查账户是否被禁用
    if (!user.isActive) {
      return res.status(403).json({ 
        success: false, 
        message: '账户已被禁用' 
      });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: '用户名或密码错误' 
      });
    }

    // 返回用户信息和token
    res.json({
      success: true,
      token: generateToken(user._id),
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

module.exports = router;
