const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Parent = require('../models/Parent');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const TeacherStudentMatch = require('../models/TeacherStudentMatch');
const ParentChildRequest = require('../models/ParentChildRequest');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   GET api/parents/children/:parentId
// @desc    获取家长的孩子列表
// @access  Private
router.get('/parents/children/:parentId', protect, async (req, res) => {
  try {
    console.log('🔍 获取孩子列表，家长ID:', req.params.parentId);
    
    const parent = await Parent.findOne({ user: req.params.parentId }).populate('user');
    if (!parent) {
      return res.status(404).json({ success: false, message: '家长不存在' });
    }

    // 查找已被家长接受的孩子（通过ParentChildRequest表）
    const acceptedRequests = await ParentChildRequest.find({
      parent: parent._id,
      status: 'accepted'
    })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });

    // 转换为孩子列表格式
    const children = acceptedRequests.map(req => ({
      _id: req.student._id,
      user_id: req.student.user,
      grade: req.student.grade,
      school: req.student.school,
      address: req.student.address,
      status: 'accepted'
    }));

    res.json({
      success: true,
      children
    });
  } catch (err) {
    console.error('❌ 获取孩子列表错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/children/pending/:parentId
// @desc    获取家长发送的待处理请求
// @access  Private
router.get('/parents/children/pending/:parentId', protect, async (req, res) => {
  try {
    console.log('🔍 获取待处理请求，家长ID:', req.params.parentId);
    
    const parent = await Parent.findOne({ user: req.params.parentId });
    if (!parent) {
      return res.status(404).json({ success: false, message: '家长不存在' });
    }

    // 查找该家长发送的所有待处理请求
    const pendingRequests = await ParentChildRequest.find({
      parent: parent._id,
      status: 'pending'
    })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      requests: pendingRequests
    });
  } catch (err) {
    console.error('❌ 获取待处理请求错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   POST api/parents/children/add
// @desc    添加孩子（发送请求给真实学生）
// @access  Private
router.post('/parents/children/add', protect, async (req, res) => {
  try {
    const { parentId, studentName, grade, message } = req.body;
    
    console.log('➕ 添加孩子请求:', req.body);

    // 查找家长
    const parent = await Parent.findOne({ user: parentId }).populate('user');
    if (!parent) {
      return res.status(404).json({ success: false, message: '家长不存在' });
    }

    console.log('✅ 找到家长:', parent.user.name);

    // 根据姓名查找真实存在的学生
    const studentUser = await User.findOne({ name: studentName, role: 'student' });
    if (!studentUser) {
      return res.status(404).json({ success: false, message: '未找到该姓名的学生，请检查姓名是否正确' });
    }

    // 查找对应的Student记录
    const student = await Student.findOne({ user: studentUser._id });
    if (!student) {
      return res.status(404).json({ success: false, message: '该用户没有学生身份记录' });
    }

    // 检查是否已经发送过请求
    const existingRequest = await ParentChildRequest.findOne({
      parent: parent._id,
      student: student._id,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: '已经发送过请求，请等待学生处理' });
    }

    // 检查是否已经是家长的孩子
    const alreadyChild = await ParentChildRequest.findOne({
      parent: parent._id,
      student: student._id,
      status: 'accepted'
    });

    if (alreadyChild) {
      return res.status(400).json({ success: false, message: '该学生已经是您的孩子' });
    }

    // 创建添加孩子请求
    const newRequest = new ParentChildRequest({
      parent: parent._id,
      student: student._id,
      message: message || `家长${parent.user.name}请求添加您为孩子`,
      status: 'pending'
    });

    await newRequest.save();
    await newRequest.populate([{ path: 'parent', populate: { path: 'user', select: 'name' } }, { path: 'student', populate: { path: 'user', select: 'name' } }]);

    res.json({
      success: true,
      message: '请求已发送，等待学生确认',
      request: newRequest
    });
  } catch (err) {
    console.error('❌ 添加孩子错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   POST api/parents/users/update
// @desc    更新用户信息
// @access  Private
router.post('/parents/users/update', protect, async (req, res) => {
  try {
    const { userId, name } = req.body;
    
    const User = require('../models/User');
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ success: false, message: '用户不存在' });
    }

    if (name) user.name = name;
    await user.save();

    res.json({
      success: true,
      message: '更新成功',
      user
    });
  } catch (err) {
    console.error('❌ 更新用户错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   POST api/parents/students/update
// @desc    更新学生信息
// @access  Private
router.post('/parents/students/update', protect, async (req, res) => {
  try {
    const { studentId, grade, school, address } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: '学生不存在' });
    }

    if (grade) student.grade = grade;
    if (school) student.school = school;
    if (address) student.address = address;
    
    await student.save();

    res.json({
      success: true,
      message: '更新成功',
      student
    });
  } catch (err) {
    console.error('❌ 更新学生错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   POST api/parents/children/delete
// @desc    删除孩子
// @access  Private
router.post('/parents/children/delete', protect, async (req, res) => {
  try {
    const { childId } = req.body;
    
    const student = await Student.findByIdAndDelete(childId);
    if (!student) {
      return res.status(404).json({ success: false, message: '学生不存在' });
    }

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (err) {
    console.error('❌ 删除孩子错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/dashboard/:parentId
// @desc    获取家长仪表盘数据
// @access  Private
router.get('/parents/dashboard/:parentId', protect, async (req, res) => {
  try {
    console.log('📊 获取仪表盘数据，家长ID:', req.params.parentId);
    
    const parent = await Parent.findOne({ user: req.params.parentId });
    if (!parent) {
      return res.status(404).json({ success: false, message: '家长不存在' });
    }

    // 获取孩子数量
    const childrenCount = await Student.countDocuments({ parent: parent._id });
    
    // 获取待确认的匹配请求数量
    const pendingMatches = await TeacherStudentMatch.countDocuments({
      status: 'approved',
      parentApproval: false
    });

    // 获取进行中的匹配数量
    const activeMatches = await TeacherStudentMatch.countDocuments({
      status: 'active'
    });

    res.json({
      success: true,
      data: {
        childrenCount,
        pendingMatches,
        activeMatches
      }
    });
  } catch (err) {
    console.error('❌ 获取仪表盘数据错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/messages/:parentId
// @desc    获取家长的消息
// @access  Private
router.get('/parents/messages/:parentId', protect, async (req, res) => {
  try {
    console.log('💬 获取消息，家长ID:', req.params.parentId);
    
    const parent = await Parent.findOne({ user: req.params.parentId });
    if (!parent) {
      return res.status(404).json({ success: false, message: '家长不存在' });
    }

    const Message = require('../models/Message');
    const messages = await Message.find({
      $or: [
        { sender: req.user.id },
        { receiver: req.user.id }
      ]
    })
      .populate('sender', 'name')
      .populate('receiver', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      messages
    });
  } catch (err) {
    console.error('❌ 获取消息错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/child-teachers/:childId
// @desc    按孩子获取相关的教师列表（只显示已匹配的教师）
// @access  Private
router.get('/parents/child-teachers/:childId', protect, async (req, res) => {
  try {
    console.log('🔍 获取孩子的教师列表，孩子ID:', req.params.childId);
    
    // 验证childId是否为有效的ObjectId
    if (!mongoose.Types.ObjectId.isValid(req.params.childId)) {
      return res.status(400).json({ success: false, message: '无效的孩子ID' });
    }
    
    // 获取与这个孩子相关的匹配记录（注意：字段名是student和teacher，不是student_id和teacher_id）
    const matches = await TeacherStudentMatch.find({
      student: new mongoose.Types.ObjectId(req.params.childId),
      status: { $in: ['active', 'approved'] }
    }).distinct('teacher');
    
    console.log('🔍 匹配的教师IDs:', matches);
    
    // 获取教师信息（注意：Teacher模型的关联字段是user，不是user_id）
    const teachers = await Teacher.find({ _id: { $in: matches } }).populate('user', 'name email phone');
    
    console.log(`✅ 找到 ${teachers.length} 位教师`);
    
    res.json({ success: true, teachers });
  } catch (err) {
    console.error('❌ 获取孩子教师列表失败:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/teachers
// @desc    获取教师列表
// @access  Private
router.get('/parents/teachers', protect, async (req, res) => {
  try {
    console.log('👨‍🏫 获取教师列表');
    
    const teachers = await Teacher.find({})
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      teachers
    });
  } catch (err) {
    console.error('❌ 获取教师列表错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/learning-progress/:studentId
// @desc    获取学生学习进度
// @access  Private
router.get('/parents/learning-progress/:studentId', protect, async (req, res) => {
  try {
    console.log('📚 获取学习进度，学生ID:', req.params.studentId);
    
    const LearningProgress = require('../models/LearningProgress');
    const progress = await LearningProgress.find({ student: req.params.studentId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      progress
    });
  } catch (err) {
    console.error('❌ 获取学习进度错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/psychological-status/:studentId
// @desc    获取学生心理状态
// @access  Private
router.get('/parents/psychological-status/:studentId', protect, async (req, res) => {
  try {
    console.log('\n========== 获取心理状态 ==========');
    console.log(' 学生ID:', req.params.studentId);
    console.log('📝 req.user:', req.user);
    
    const PsychologicalStatus = require('../models/PsychologicalStatus');
    
    // 先查询所有心理状态记录，看看数据库中有什么
    const allStatus = await PsychologicalStatus.find({}).sort({ createdAt: -1 }).limit(5);
    console.log('📊 数据库中最近的心理状态记录:', allStatus.map(s => ({
      student: s.student,
      emotionalState: s.emotionalState,
      anxietyLevel: s.anxietyLevel,
      depressionLevel: s.depressionLevel,
      createdAt: s.createdAt
    })));
    
    // 查询该学生的心理状态
    const status = await PsychologicalStatus.find({ student: req.params.studentId })
      .sort({ createdAt: -1 })
      .limit(10);

    console.log('✅ 查询结果数量:', status.length);
    if (status.length > 0) {
      console.log('✅ 第一条记录:', status[0]);
    }

    res.json({
      success: true,
      status
    });
  } catch (err) {
    console.error('❌ 获取心理状态错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/parents/children/student/requests/:studentId
// @desc    学生获取家长添加孩子的请求
// @access  Private
router.get('/parents/children/student/requests/:userId', protect, async (req, res) => {
  try {
    console.log('🔍 学生获取家长请求，用户ID:', req.params.userId);
    console.log('🔍 req.user:', req.user);
    
    // 先通过userId找到对应的Student记录
    const student = await Student.findOne({ user: req.params.userId });
    if (!student) {
      console.log('⚠️ 未找到Student记录，userId:', req.params.userId);
      // 返回空数组而不是404
      return res.json({ 
        success: true, 
        requests: [],
        processedRequests: [],
        message: '未找到学生记录'
      });
    }

    console.log('✅ 找到Student记录，studentId:', student._id);

    // 查找发送给该学生的所有待处理请求
    const pendingRequests = await ParentChildRequest.find({
      student: student._id,
      status: 'pending'
    })
      .populate({ path: 'parent', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });

    // 查找已处理的请求（accepted + rejected）
    const processedRequests = await ParentChildRequest.find({
      student: student._id,
      status: { $in: ['accepted', 'rejected'] }
    })
      .populate({ path: 'parent', populate: { path: 'user', select: 'name email phone' } })
      .sort({ createdAt: -1 });

    console.log(`✅ 找到 ${pendingRequests.length} 条待处理请求，${processedRequests.length} 条已处理请求`);

    res.json({
      success: true,
      requests: pendingRequests,
      processedRequests: processedRequests
    });
  } catch (err) {
    console.error('❌ 获取家长请求错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   PUT api/parents/children/requests/:requestId/accept
// @desc    学生接受家长的添加请求
// @access  Private
router.put('/parents/children/requests/:requestId/accept', protect, async (req, res) => {
  try {
    console.log('✅ 学生接受家长请求，请求ID:', req.params.requestId);
    
    const request = await ParentChildRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: '请求不存在' });
    }

    // 验证当前用户是该请求对应的学生
    const student = await Student.findOne({ user: req.user.id });
    if (!student || String(request.student) !== String(student._id)) {
      return res.status(403).json({ success: false, message: '无权处理此请求' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: '该请求已处理' });
    }

    // 更新请求状态为已接受
    request.status = 'accepted';
    await request.save();

    // 🔥 关键：更新学生的parent字段，关联到家长的user_id
    const Parent = require('../models/Parent');
    const parentRecord = await Parent.findById(request.parent).populate('user');
    if (parentRecord && parentRecord.user) {
      student.parent = parentRecord.user._id; // 设置parent字段为家长的User ID
      await student.save();
      console.log('✅ 已更新学生', student.user, '的parent字段为:', parentRecord.user._id);
    }

    await request.populate([{ path: 'parent', populate: { path: 'user', select: 'name' } }, { path: 'student', populate: { path: 'user', select: 'name' } }]);

    res.json({
      success: true,
      message: '已接受家长请求',
      request
    });
  } catch (err) {
    console.error('❌ 接受请求错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   PUT api/parents/children/requests/:requestId/reject
// @desc    学生拒绝家长的添加请求
// @access  Private
router.put('/parents/children/requests/:requestId/reject', protect, async (req, res) => {
  try {
    console.log('❌ 学生拒绝家长请求，请求ID:', req.params.requestId);
    
    const request = await ParentChildRequest.findById(req.params.requestId);
    if (!request) {
      return res.status(404).json({ success: false, message: '请求不存在' });
    }

    // 验证当前用户是该请求对应的学生
    const student = await Student.findOne({ user: req.user.id });
    if (!student || String(request.student) !== String(student._id)) {
      return res.status(403).json({ success: false, message: '无权处理此请求' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: '该请求已处理' });
    }

    // 更新请求状态为已拒绝
    request.status = 'rejected';
    await request.save();

    await request.populate([{ path: 'parent', populate: { path: 'user', select: 'name' } }, { path: 'student', populate: { path: 'user', select: 'name' } }]);

    res.json({
      success: true,
      message: '已拒绝家长请求',
      request
    });
  } catch (err) {
    console.error('❌ 拒绝请求错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   GET api/messages/conversation/:userId1/:userId2
// @desc    获取两人之间的对话记录
// @access  Private
router.get('/messages/conversation/:userId1/:userId2', protect, async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    console.log('💬 获取对话记录:', userId1, '<->', userId2);
    
    // 验证userId1和userId2是否为有效的ObjectId
    if (!mongoose.Types.ObjectId.isValid(userId1) || !mongoose.Types.ObjectId.isValid(userId2)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }
    
    const Message = require('../models/Message');
    
    const messages = await Message.find({
      $or: [
        { senderId: new mongoose.Types.ObjectId(userId1), receiverId: new mongoose.Types.ObjectId(userId2) },
        { senderId: new mongoose.Types.ObjectId(userId2), receiverId: new mongoose.Types.ObjectId(userId1) }
      ]
    })
      .populate('senderId', 'name username')
      .populate('receiverId', 'name username')
      .sort({ createdAt: 1 });
    
    console.log(`✅ 找到 ${messages.length} 条消息`);
    console.log('第一条消息:', messages[0] ? JSON.stringify(messages[0], null, 2) : '无');
    
    res.json({ success: true, messages });
  } catch (err) {
    console.error('❌ 获取对话记录失败:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

module.exports = router;
