const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const TeachingResource = require('../models/TeachingResource');
const ResourceShare = require('../models/ResourceShare');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// 获取教学资源列表（支持搜索和筛选）
router.get('/', protect, async (req, res) => {
  try {
    const { keyword, subject, resourceType } = req.query;
    
    let query = {};
    
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    if (subject) {
      const teachers = await Teacher.find({ subject: { $regex: subject, $options: 'i' } });
      const teacherIds = teachers.map(t => t._id);
      query.teacher = { $in: teacherIds };
    }
    
    if (resourceType) {
      query.resourceType = resourceType;
    }
    
    const resources = await TeachingResource.find(query)
      .populate({
        path: 'teacher',
        populate: {
          path: 'teacher',
          populate: {
            path: 'user',
            select: 'name'
          }
        }
      })
      .sort({ createdAt: -1 });
    
    res.json(resources);
  } catch (err) {
    console.error('获取资源列表错误:', err.message);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// 下载资源
router.post('/:resourceId/download', protect, async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    const resource = await TeachingResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ msg: '资源不存在' });
    }
    
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }
    
    const existingShare = await ResourceShare.findOne({
      resource: resourceId,
      student: student._id
    });
    
    if (!existingShare) {
      const newShare = new ResourceShare({
        resource: resourceId,
        student: student._id
      });
      await newShare.save();
    }
    
    res.json({
      msg: '下载准备完成',
      resource
    });
  } catch (err) {
    console.error('下载资源错误:', err.message);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;
