const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const TeacherStudentMatch = require('../models/TeacherStudentMatch');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const Parent = require('../models/Parent');
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
    
    // 如果家长已经同意，直接变为 active 状态
    if (match.parentApproval) {
      match.status = 'active';
    }
    
    await match.save();

    await match.populate('teacher');
    await match.populate('student');

    res.json({
      msg: match.status === 'active' ? '已同意辅导请求，家长已确认，可以开始聊天' : '已同意辅导请求，等待家长确认',
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

// @route   GET api/matches/parent/pending
// @desc    获取家长待确认的匹配请求
// @access  Private (Parent)
router.get('/parent/pending', protect, async (req, res) => {
  try {
    console.log('\n========== 🔍 家长获取待确认匹配请求 ==========');
    console.log('👤 当前家长 User ID:', req.user.id);
    
    const parent = await Parent.findOne({ user: req.user.id });
    console.log('🔍 查找到的 Parent 文档:', parent ? parent._id : '未找到');
    
    if (!parent) {
      console.error('❌ 当前用户不是家长');
      return res.status(400).json({ success: false, message: '当前用户不是家长' });
    }

    // 查找该家长关联的学生的所有匹配请求
    // 包括待处理、已同意、已拒绝、已接收的所有状态
    console.log('📦 查询条件: requestFrom = student (所有学生发起的请求)');
    
    const matches = await TeacherStudentMatch.find({
      requestFrom: 'student'  // 学生发起的所有请求
    })
      .populate({ 
        path: 'student', 
        populate: { 
          path: 'user', 
          select: 'name email'
        } 
      })
      .populate({ 
        path: 'teacher', 
        populate: { 
          path: 'user', 
          select: 'name email' 
        } 
      })
      .sort({ createdAt: -1 });

    console.log('📦 查询到的总匹配请求数量:', matches.length);
    
    // 打印每个请求的状态，方便调试
    matches.forEach((match, index) => {
      console.log(`  ${index + 1}. matchId: ${match._id}, status: ${match.status}, parentApproval: ${match.parentApproval}, requestFrom: ${match.requestFrom}`);
    });

    // 过滤出只属于该家长的孩子
    // Student.parent 字段存储的是家长的 User ID
    const parentMatches = matches.filter(match => {
      if (!match.student) {
        console.log('⚠️ 匹配记录缺少学生信息, matchId:', match._id);
        return false;
      }
      
      // 获取学生的 parent 字段（应该是家长的 User ID）
      const studentParentId = match.student.parent;
      
      console.log('🔍 检查匹配记录:', {
        matchId: match._id,
        studentId: match.student._id,
        studentUserId: match.student.user,
        studentParentId: studentParentId,
        currentParentUserId: req.user.id
      });
      
      // 检查学生的 parent 是否等于当前家长的 User ID
      if (!studentParentId) {
        console.log('⚠️ 学生没有关联家长, studentId:', match.student._id);
        return false;
      }
      
      const isMatch = studentParentId.toString() === req.user.id.toString();
      console.log('✅ 匹配结果:', isMatch);
      return isMatch;
    });

    console.log('📦 找到的待确认匹配请求数量:', parentMatches.length);
    console.log('========== 🔍 查询完成 ==========\n');

    res.json({
      success: true,
      matches: parentMatches
    });
  } catch (err) {
    console.error('❌ 获取待确认匹配请求错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   PUT api/matches/:id/parent-approve
// @desc    家长同意匹配请求
// @access  Private (Parent)
router.put('/:id/parent-approve', protect, async (req, res) => {
  try {
    console.log('\n========== ✅ 家长同意匹配请求 ==========');
    console.log('👤 当前家长 User ID:', req.user.id);
    console.log('📝 匹配请求 ID:', req.params.id);
    
    const parent = await Parent.findOne({ user: req.user.id });
    if (!parent) {
      console.error('❌ 当前用户不是家长');
      return res.status(400).json({ success: false, message: '当前用户不是家长' });
    }

    const match = await TeacherStudentMatch.findById(req.params.id)
      .populate({ 
        path: 'student', 
        populate: { 
          path: 'user', 
          select: 'name email'
        } 
      });
      
    if (!match) {
      console.error('❌ 匹配请求不存在');
      return res.status(404).json({ success: false, message: '匹配请求不存在' });
    }

    console.log('🔍 匹配记录信息:', {
      matchId: match._id,
      studentId: match.student?._id,
      studentParentId: match.student?.parent,
      currentParentUserId: req.user.id
    });

    // 验证这个学生是否属于当前家长
    // 关键：检查 student.parent 字段（存储的是家长的 User ID）
    if (!match.student) {
      console.error('❌ 匹配记录缺少学生信息');
      return res.status(400).json({ success: false, message: '匹配记录数据不完整' });
    }
    
    const studentParentId = match.student.parent;
    if (!studentParentId || studentParentId.toString() !== req.user.id.toString()) {
      console.error('❌ 权限验证失败 - 学生不属于当前家长');
      console.error('  student.parent:', studentParentId);
      console.error('  req.user.id:', req.user.id);
      return res.status(403).json({ success: false, message: '无权操作此请求' });
    }

    console.log('✅ 权限验证通过');

    // 检查请求是否由学生发起
    if (match.requestFrom !== 'student') {
      console.error('❌ 不是学生发起的请求');
      return res.status(400).json({ success: false, message: '只能审批学生发起的请求' });
    }

    // 如果是 pending 状态，说明教师还未审批，家长先同意
    if (match.status === 'pending') {
      match.parentApproval = true;
      // 状态保持 pending，等待教师审批
      await match.save();
      
      await match.populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });
      await match.populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
      
      return res.json({
        success: true,
        message: '家长已同意，等待教师审批',
        match
      });
    }

    // 如果是 approved 状态，说明教师已同意，家长同意后变为 active
    if (match.status === 'approved') {
      match.parentApproval = true;
      match.status = 'active';
      match.matchedAt = new Date();
      await match.save();
      
      await match.populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });
      await match.populate({ path: 'student', populate: { path: 'user', select: 'name email' } });
      
      return res.json({
        success: true,
        message: '已同意辅导请求，现在可以开始聊天',
        match
      });
    }

    return res.status(400).json({ success: false, message: '该请求当前状态不允许操作' });
  } catch (err) {
    console.error('❌ 家长同意请求错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   PUT api/matches/:id/parent-reject
// @desc    家长拒绝匹配请求
// @access  Private (Parent)
router.put('/:id/parent-reject', protect, async (req, res) => {
  try {
    console.log('\n========== ❌ 家长拒绝匹配请求 ==========');
    console.log('👤 当前家长 User ID:', req.user.id);
    console.log('📝 匹配请求 ID:', req.params.id);
    
    const parent = await Parent.findOne({ user: req.user.id });
    if (!parent) {
      console.error('❌ 当前用户不是家长');
      return res.status(400).json({ success: false, message: '当前用户不是家长' });
    }

    const match = await TeacherStudentMatch.findById(req.params.id)
      .populate({ 
        path: 'student', 
        populate: { 
          path: 'user', 
          select: 'name email'
        } 
      });
      
    if (!match) {
      console.error('❌ 匹配请求不存在');
      return res.status(404).json({ success: false, message: '匹配请求不存在' });
    }

    console.log('🔍 匹配记录信息:', {
      matchId: match._id,
      studentId: match.student?._id,
      studentParentId: match.student?.parent,
      currentParentUserId: req.user.id
    });

    // 验证这个学生是否属于当前家长
    // 关键：检查 student.parent 字段（存储的是家长的 User ID）
    if (!match.student) {
      console.error('❌ 匹配记录缺少学生信息');
      return res.status(400).json({ success: false, message: '匹配记录数据不完整' });
    }
    
    const studentParentId = match.student.parent;
    if (!studentParentId || studentParentId.toString() !== req.user.id.toString()) {
      console.error('❌ 权限验证失败 - 学生不属于当前家长');
      console.error('  student.parent:', studentParentId);
      console.error('  req.user.id:', req.user.id);
      return res.status(403).json({ success: false, message: '无权操作此请求' });
    }

    console.log('✅ 权限验证通过');

    // 检查请求是否由学生发起
    if (match.requestFrom !== 'student') {
      console.error('❌ 不是学生发起的请求');
      return res.status(400).json({ success: false, message: '只能审批学生发起的请求' });
    }

    // 拒绝请求，无论当前是什么状态
    match.parentApproval = false;
    match.status = 'rejected';
    await match.save();

    await match.populate({ path: 'teacher', populate: { path: 'user', select: 'name email' } });
    await match.populate({ path: 'student', populate: { path: 'user', select: 'name email' } });

    res.json({
      success: true,
      message: '已拒绝辅导请求',
      match
    });
  } catch (err) {
    console.error('❌ 家长拒绝请求错误:', err);
    res.status(500).json({ success: false, message: '服务器错误: ' + err.message });
  }
});

// @route   POST api/matches/request-from-teacher
// @desc    教师发送辅导邀请
// @access  Private (教师)
router.post('/request-from-teacher', protect, async (req, res) => {
  try {
    const { studentId, message } = req.body;

    console.log('\n========== 🎯 教师发送辅导邀请 ==========');
    console.log('当前教师 User ID:', req.user.id);
    console.log('📥 接收到的 studentId:', studentId);
    console.log('📝 邀请消息:', message);

    // 获取当前教师信息
    const teacher = await Teacher.findOne({ user: req.user.id });
    console.log('🔍 查找到的 Teacher 文档:', teacher ? teacher._id : '未找到');
    
    if (!teacher) {
      console.error('❌ 当前用户不是教师');
      return res.status(400).json({ msg: '当前用户不是教师' });
    }

    // 验证学生是否存在
    let studentUserId;
    try {
      studentUserId = new mongoose.Types.ObjectId(studentId);
      console.log('✅ studentId 转换为 ObjectId 成功:', studentUserId);
    } catch (err) {
      console.error('❌ studentId 格式错误:', err);
      return res.status(400).json({ msg: '学生ID格式错误' });
    }
    
    const student = await Student.findOne({ user: studentUserId });
    console.log('🔍 查找到的 Student 文档:', student ? student._id : '未找到');
    
    if (!student) {
      console.error('❌ 学生不存在，studentUserId:', studentUserId);
      return res.status(404).json({ msg: '学生不存在' });
    }

    // 检查是否已经发送过邀请
    const existingMatch = await TeacherStudentMatch.findOne({
      teacher: teacher._id,
      student: student._id,
      status: { $in: ['pending', 'approved', 'active'] }
    });

    if (existingMatch) {
      console.log('⚠️ 已经发送过邀请或已经匹配');
      return res.status(400).json({ msg: '已经发送过邀请或已经匹配' });
    }

    // 创建新的匹配请求
    const newMatch = new TeacherStudentMatch({
      teacher: teacher._id,
      student: student._id,
      requestFrom: 'teacher',
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
      msg: '辅导邀请已发送',
      match
    });
  } catch (err) {
    console.error('❌ 发送辅导邀请错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;
