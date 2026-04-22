const express = require('express');
const router = express.Router();
const TeachingResource = require('../models/TeachingResource');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// @route   GET /api/resources
// @desc    获取教学资源列表
// @access  Private/Admin
router.get('/', protect, adminOnly, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const query = {};
    
    if (req.query.search) {
      query.title = { $regex: req.query.search, $options: 'i' };
    }
    
    if (req.query.type) {
      query.resourceType = req.query.type;
    }

    const resources = await TeachingResource.find(query)
      .populate({
        path: 'teacherId',
        populate: {
          path: 'userId',
          select: 'name'
        }
      })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await TeachingResource.countDocuments(query);

    res.json({
      success: true,
      resources: resources.map(resource => ({
        _id: resource._id,
        id: resource._id,
        title: resource.title,
        description: resource.description,
        resourceType: resource.resourceType,
        teacherName: resource.teacherId?.userId?.name || '未知',
        uploadDate: resource.createdAt,
        downloadCount: resource.downloadCount
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

module.exports = router;
