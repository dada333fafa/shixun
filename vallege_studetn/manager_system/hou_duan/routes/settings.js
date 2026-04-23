const express = require('express');
const router = express.Router();
const SystemSettings = require('../models/SystemSettings');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/settings
// @desc    获取系统设置
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = await SystemSettings.create({});
    }

    res.json({
      success: true,
      settings
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

// @route   PUT /api/settings
// @desc    更新系统设置
// @access  Private/Admin
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let settings = await SystemSettings.findOne();
    
    if (!settings) {
      settings = new SystemSettings(req.body);
    } else {
      Object.assign(settings, req.body);
    }

    await settings.save();

    res.json({
      success: true,
      message: '系统设置保存成功',
      settings
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
