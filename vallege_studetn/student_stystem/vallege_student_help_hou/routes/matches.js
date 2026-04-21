const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const TeacherStudentMatch = require('../models/TeacherStudentMatch');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');
const mongoose = require('mongoose');

// @route   POST api/matches/request
// @desc    学生发送辅导请求
// @access  Private
router.post('/request', auth, async (req, res) => {
  try {
    const { teacherId, message } = req.body;

    console.log('\n========== 发送辅导请求调试 ==========');
    console.log('接收到的 teacherId:', teacherId);
    console.log('teacherId 类型:', typeof teacherId);
    console.log('当前用户 ID:', req.user._id);

    // 验证必填字段
    if (!teacherId) {
      return res.status(400).json({ msg: '教师ID不能为空' });
    }

    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    // 验证教师是否存在（根据user ID查找Teacher记录）
    // teacherId 应该是 User 的 ID，需要转换为 ObjectId
    let teacherUserId;
    try {
      teacherUserId = new mongoose.Types.ObjectId(teacherId);
    } catch (err) {
      console.error('teacherId 格式错误:', err.message);
      return res.status(400).json({ msg: '教师ID格式错误' });
    }
    
    const teacher = await Teacher.findOne({ user: teacherUserId });
    
    console.log('查找教师结果:', teacher ? `找到 (ID: ${teacher._id})` : '未找到');
    
    // 如果没找到，尝试直接按ID查找Teacher
    if (!teacher) {
      const teacherById = await Teacher.findById(teacherId);
      console.log('尝试按Teacher ID查找:', teacherById ? `找到 (user: ${teacherById.user})` : '未找到');
      
      // 检查是否存在对应的User
      const User = require('../models/User');
      const userExists = await User.findById(teacherUserId);
      console.log('对应的User是否存在:', userExists ? `存在 (${userExists.name})` : '不存在');
    }
    
    if (!teacher) {
      return res.status(404).json({ msg: '教师不存在' });
    }

    // 检查是否已经发送过请求
    const existingMatch = await TeacherStudentMatch.findOne({
      teacher: teacher._id,
      student: student._id,
      status: { $in: ['pending', 'approved', 'active'] }
    });

    if (existingMatch) {
      return res.status(400).json({ msg: '已经发送过请求或已经匹配' });
    }

    // 创建新的匹配请求
    const newMatch = new TeacherStudentMatch({
      teacher: teacher._id,  // 使用Teacher模型的ID
      student: student._id,
      requestFrom: 'student',
      requestMessage: message || '',
      status: 'pending',
      parentApproval: false
    });

    const match = await newMatch.save();

    // 填充教师和学生信息
    await match.populate('teacher');
    await match.populate('student');
    
    // 获取教师对应的User信息
    const teacherUser = await require('../models/User').findById(teacher.user);
    match._doc.teacherUser = teacherUser ? { name: teacherUser.name, username: teacherUser.username } : null;

    res.json({
      msg: '辅导请求已发送',
      match
    });
  } catch (err) {
    console.error('发送辅导请求错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   GET api/matches
// @desc    获取当前学生的所有匹配请求
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ msg: '当前用户不是学生' });
    }

    // 获取该学生的所有匹配
    const matches = await TeacherStudentMatch.find({ student: student._id })
      .populate('teacher')
      .populate('student')
      .sort({ createdAt: -1 });

    // 为每个匹配添加教师User信息
    const User = require('../models/User');
    const matchesWithUserInfo = await Promise.all(
      matches.map(async (match) => {
        const teacherUser = await User.findById(match.teacher.user);
        const matchObj = match.toObject();
        matchObj.teacherUser = teacherUser ? { name: teacherUser.name, username: teacherUser.username } : null;
        return matchObj;
      })
    );

    res.json(matchesWithUserInfo);
  } catch (err) {
    console.error('获取匹配列表错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

// @route   DELETE api/matches/:matchId
// @desc    取消辅导请求
// @access  Private
router.delete('/:matchId', auth, async (req, res) => {
  try {
    const match = await TeacherStudentMatch.findById(req.params.matchId);

    if (!match) {
      return res.status(404).json({ msg: '匹配请求不存在' });
    }

    // 获取当前学生信息
    const student = await Student.findOne({ user: req.user._id });
    if (!student || match.student.toString() !== student._id.toString()) {
      return res.status(403).json({ msg: '无权限操作此请求' });
    }

    // 只能取消pending状态的请求
    if (match.status !== 'pending') {
      return res.status(400).json({ msg: '只能取消待处理的请求' });
    }

    await match.deleteOne();

    res.json({ msg: '请求已取消' });
  } catch (err) {
    console.error('取消请求错误:', err);
    res.status(500).json({ msg: '服务器错误: ' + err.message });
  }
});

module.exports = router;
