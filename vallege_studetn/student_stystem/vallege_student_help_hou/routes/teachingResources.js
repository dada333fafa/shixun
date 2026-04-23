const express = require('express');
const router = express.Router();
const TeachingResource = require('../models/TeachingResource');
const ResourceShare = require('../models/ResourceShare');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const auth = require('../middleware/auth'); // 假设有认证中间件

// 上传教学资源
router.post('/upload', auth, async (req, res) => {
  try {
    const { title, description, resourceType } = req.body;
    
    // 验证用户是否为教师
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(401).json({ msg: 'Access denied. Only teachers can upload resources.' });
    }

    const newResource = new TeachingResource({
      teacher: teacher._id,
      title,
      description,
      resourceType,
      filePath: req.file ? req.file.path : null,
      fileName: req.file ? req.file.originalname : null
    });

    const resource = await newResource.save();
    res.json(resource);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 获取教学资源列表（支持搜索和筛选）
router.get('/', auth, async (req, res) => {
  try {
    const { keyword, subject, resourceType } = req.query;
    
    console.log('\n========== 获取资源列表 ==========');
    console.log('搜索关键词:', keyword);
    console.log('科目:', subject);
    console.log('资源类型:', resourceType);
    
    // 构建查询条件
    let query = {};
    
    // 关键词搜索（标题或描述）
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }
    
    // 科目筛选（通过教师科目）
    if (subject) {
      const teachers = await Teacher.find({ subject: { $regex: subject, $options: 'i' } });
      const teacherIds = teachers.map(t => t._id);
      query.teacher = { $in: teacherIds };
    }
    
    // 资源类型筛选
    if (resourceType) {
      query.resourceType = resourceType;
    }
    
    console.log('查询条件:', JSON.stringify(query));
    
    // 获取资源列表，并关联教师信息
    const resources = await TeachingResource.find(query)
      .populate({
        path: 'teacher',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    console.log('找到资源数量:', resources.length);
    
    res.json(resources);
  } catch (err) {
    console.error('获取资源列表错误:', err.message);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// 根据教师ID获取资源
router.get('/teacher/:teacherId', auth, async (req, res) => {
  try {
    const resources = await TeachingResource.find({ teacher: req.params.teacherId })
      .populate('teacher', ['user', 'subject'])
      .sort({ createdAt: -1 });
    res.json(resources);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 分享资源给学生
router.post('/share', auth, async (req, res) => {
  try {
    const { resourceId, studentId } = req.body;
    
    // 验证资源是否存在且属于当前教师或管理员
    const resource = await TeachingResource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({ msg: 'Resource not found' });
    }
    
    // 创建资源分享记录
    const newShare = new ResourceShare({
      resource: resourceId,
      student: studentId
    });
    
    await newShare.save();
    res.json(newShare);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 获取共享给特定学生的资源
router.get('/shared/:studentId', auth, async (req, res) => {
  try {
    const shares = await ResourceShare.find({ student: req.params.studentId })
      .populate({
        path: 'resource',
        populate: {
          path: 'teacher',
          select: 'user subject'
        }
      })
      .populate('student', ['user', 'grade']);
    
    const resources = shares.map(share => share.resource);
    res.json(resources);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 获取特定学生能看到的资源
router.get('/for-student/:studentId', auth, async (req, res) => {
  try {
    const resources = await ResourceShare.find({ student: req.params.studentId })
      .populate({
        path: 'resource',
        populate: {
          path: 'teacher',
          select: 'user subject'
        }
      })
      .select('resource')
      .exec();

    const resourceList = resources.map(item => item.resource);
    res.json(resourceList);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 下载资源（记录分享并返回文件路径）
router.post('/:resourceId/download', auth, async (req, res) => {
  try {
    const { resourceId } = req.params;
    
    console.log('\n========== 下载资源 ==========');
    console.log('资源ID:', resourceId);
    console.log('用户ID:', req.user._id);
    
    // 验证资源是否存在
    const resource = await TeachingResource.findById(resourceId)
      .populate({
        path: 'teacher',
        populate: {
          path: 'user',
          select: 'name'
        }
      });
    
    if (!resource) {
      return res.status(404).json({ msg: '资源不存在' });
    }
    
    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }
    
    // 检查是否已经分享过，避免重复记录
    const existingShare = await ResourceShare.findOne({
      resource: resourceId,
      student: student._id
    });
    
    if (!existingShare) {
      // 创建资源分享记录
      const newShare = new ResourceShare({
        resource: resourceId,
        student: student._id
      });
      await newShare.save();
      console.log('创建分享记录:', newShare._id);
    }
    
    // 返回资源信息（包含下载链接）
    res.json({
      msg: '下载准备完成',
      resource: {
        id: resource._id,
        title: resource.title,
        description: resource.description,
        resourceType: resource.resourceType,
        filePath: resource.filePath,
        fileName: resource.fileName || `${resource.title}.pdf`,
        teacherName: resource.teacher && resource.teacher.user ? resource.teacher.user.name : '教师'
      }
    });
  } catch (err) {
    console.error('下载资源错误:', err.message);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;