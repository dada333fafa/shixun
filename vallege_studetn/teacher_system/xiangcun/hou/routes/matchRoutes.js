const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const TeacherStudentMatch = require('../models/TeacherStudentMatch');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @route   POST api/matches/request
// @desc    学生发送辅导请求
// @access  Private
router.post('/request', protect, async (req, res) => {
  try {
    const { teacherId, message } = req.body;

    console.log('\n========== 🎯 学生发送辅导请求 ==========');
    console.log(' 当前学生 User ID:', req.user.id);
    console.log('📥 接收到的 teacherId:', teacherId);
    console.log('📝 辅导需求:', message);

    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user.id });
    console.log('🔍 查找到的 Student 文档:', student ? student._id : '未找到');
    
    if (!student) {
      console.error('❌ 当前用户不是学生');
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    // 验证教师是否存在
    let teacherUserId;
    try {
      teacherUserId = new mongoose.Types.ObjectId(teacherId);
      console.log('✅ teacherId 转换为 ObjectId 成功:', teacherUserId);
    } catch (err) {
      console.error('❌ teacherId 格式错误:', err);
      return res.status(400).json({ msg: '教师ID格式错误' });
    }
    
    const teacher = await Teacher.findOne({ user: teacherUserId });
    console.log('🔍 查找到的 Teacher 文档:', teacher ? teacher._id : '未找到');
    
    if (!teacher) {
      console.error('❌ 教师不存在，teacherUserId:', teacherUserId);
      return res.status(404).json({ msg: '教师不存在' });
    }

    // 检查是否已经发送过请求
    const existingMatch = await TeacherStudentMatch.findOne({
      teacher: teacher._id,
      student: student._id,
      status: { $in: ['pending', 'approved', 'active'] }
    });

    if (existingMatch) {
      console.log('⚠️ 已经发送过请求或已经匹配');
      return res.status(400).json({ msg: '已经发送过请求或已经匹配' });
    }

    // 创建新的匹配请求
    const newMatch = new TeacherStudentMatch({
      teacher: teacher._id,
      student: student._id,
      requestFrom: 'student',
      requestMessage: message || '',
      status: 'pending',
      parentApproval: false
    });

    console.log('💾 准备保存匹配请求...');
    const match = await newMatch.save();
    console.log('✅ 匹配请求保存成功, _id:', match._id);
    
    await match.populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });
    await match.populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    console.log('========== 🎯 请求处理完成 ==========\n');

    res.json({
      msg: '辅导请求已发送',
      match
    });
  } catch (err) {
    console.error('❌ 发送辅导请求错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/matches
// @desc    获取当前学生的所有匹配请求
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    const matches = await TeacherStudentMatch.find({ student: student._id })
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    res.json(matches);
  } catch (err) {
    console.error('获取匹配列表错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/matches/teacher/pending
// @desc    获取当前教师收到的待处理请求
// @access  Private (Teacher)
router.get('/teacher/pending', protect, async (req, res) => {
  try {
    console.log('\n========== 🔍 教师获取待处理请求 ==========');
    console.log('👤 当前教师 User ID:', req.user.id);
    console.log('👤 当前教师名称:', req.user.name);
    
    const teacher = await Teacher.findOne({ user: req.user.id });
    console.log('🔍 查找到的 Teacher 文档:', teacher ? teacher._id : '未找到');
    
    if (!teacher) {
      console.error('❌ 当前用户不是教师');
      return res.status(400).json({ msg: '当前用户不是教师' });
    }

    const matches = await TeacherStudentMatch.find({
      teacher: teacher._id,
      status: 'pending'
    })
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    console.log('📦 找到的待处理请求数量:', matches.length);
    console.log('========== 🔍 查询完成 ==========\n');

    res.json({
      msg: '获取成功',
      data: matches
    });
  } catch (err) {
    console.error('❌ 获取待处理请求错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/matches/teacher/all
// @desc    获取当前教师的所有匹配
// @access  Private (Teacher)
router.get('/teacher/all', protect, async (req, res) => {
  try {
    console.log('\n========== 🔍 教师获取匹配列表 ==========');
    console.log('👤 当前教师 User ID:', req.user.id);
    console.log('👤 当前教师名称:', req.user.name);
    
    const teacher = await Teacher.findOne({ user: req.user.id });
    console.log('🔍 查找到的 Teacher 文档:', teacher ? teacher._id : '未找到');
    
    if (!teacher) {
      console.error('❌ 当前用户不是教师');
      return res.status(400).json({ msg: '当前用户不是教师' });
    }

    const { status } = req.query;
    const query = { teacher: teacher._id };
    if (status) {
      query.status = status;
    }
    
    console.log(' 查询条件:', JSON.stringify(query));

    const matches = await TeacherStudentMatch.find(query)
      .populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } })
      .populate({ path: 'student', populate: { path: 'user', select: 'name email' } })
      .sort({ createdAt: -1 });

    console.log('📦 找到的匹配记录数量:', matches.length);
    console.log('========== 🔍 查询完成 ==========\n');

    res.json({
      msg: '获取成功',
      data: matches
    });
  } catch (err) {
    console.error('❌ 获取匹配列表错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   PUT api/matches/:id/approve
// @desc    教师同意匹配请求
// @access  Private (Teacher)
router.put('/:id/approve', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(400).json({ msg: '当前用户不是教师' });
    }

    const match = await TeacherStudentMatch.findOne({
      _id: req.params.id,
      teacher: teacher._id
    });

    if (!match) {
      return res.status(404).json({ msg: '匹配请求不存在' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ msg: '该请求已处理' });
    }

    match.status = 'approved';
    match.matchedAt = new Date();
    await match.save();

    await match.populate('teacher');
    await match.populate('student');

    res.json({
      msg: '已同意辅导请求',
      match
    });
  } catch (err) {
    console.error('同意请求错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   PUT api/matches/:id/reject
// @desc    教师拒绝匹配请求
// @access  Private (Teacher)
router.put('/:id/reject', protect, async (req, res) => {
  try {
    const teacher = await Teacher.findOne({ user: req.user.id });
    if (!teacher) {
      return res.status(400).json({ msg: '当前用户不是教师' });
    }

    const match = await TeacherStudentMatch.findOne({
      _id: req.params.id,
      teacher: teacher._id
    });

    if (!match) {
      return res.status(404).json({ msg: '匹配请求不存在' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ msg: '该请求已处理' });
    }

    match.status = 'rejected';
    await match.save();

    await match.populate('teacher');
    await match.populate('student');

    res.json({
      msg: '已拒绝辅导请求',
      match
    });
  } catch (err) {
    console.error('拒绝请求错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   DELETE api/matches/:id
// @desc    学生取消匹配请求
// @access  Private (Student)
router.delete('/:id', protect, async (req, res) => {
  try {
    const student = await Student.findOne({ user: req.user.id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    const match = await TeacherStudentMatch.findOne({
      _id: req.params.id,
      student: student._id
    });

    if (!match) {
      return res.status(404).json({ msg: '匹配请求不存在' });
    }

    if (match.status !== 'pending') {
      return res.status(400).json({ msg: '只能取消待确认的请求' });
    }

    await TeacherStudentMatch.findByIdAndDelete(req.params.id);

    res.json({
      msg: '已取消辅导请求'
    });
  } catch (err) {
    console.error('取消请求错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;
