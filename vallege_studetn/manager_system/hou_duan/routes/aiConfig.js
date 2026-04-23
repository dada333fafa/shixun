const express = require('express');
const router = express.Router();
const AIConfig = require('../models/AIConfig');
const aiService = require('../services/aiService');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/ai-config
// @desc    获取AI配置
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    let config = await AIConfig.findOne();
    
    if (!config) {
      config = await AIConfig.create({});
    }

    res.json({
      success: true,
      config
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

// @route   PUT /api/ai-config
// @desc    更新AI配置
// @access  Private/Admin
router.put('/', protect, adminOnly, async (req, res) => {
  try {
    let config = await AIConfig.findOne();
    
    if (!config) {
      config = new AIConfig(req.body);
    } else {
      Object.assign(config, req.body);
    }

    await config.save();

    res.json({
      success: true,
      message: 'AI配置保存成功',
      config
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

// @route   POST /api/ai-config/match
// @desc    AI匹配教师
// @access  Private/Admin
router.post('/match', protect, adminOnly, async (req, res) => {
  try {
    const { grade, learningNeeds, psychologicalState } = req.body;
    
    // 验证输入
    if (!grade || !learningNeeds || !psychologicalState) {
      return res.status(400).json({
        success: false,
        message: '请提供完整的学生信息（年级、学习需求、心理状态）'
      });
    }
    
    const studentInfo = {
      grade,
      learningNeeds,
      psychologicalState
    };
    
    // 调用AI匹配服务
    const result = await aiService.matchTeachers(studentInfo);
    
    res.json(result);
  } catch (error) {
    console.error('AI匹配失败:', error);
    res.status(500).json({ 
      success: false, 
      message: 'AI匹配失败',
      error: error.message 
    });
  }
});

module.exports = router;
