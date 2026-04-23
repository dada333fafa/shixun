import express from 'express';
import mongoose from 'mongoose';
const { ObjectId } = mongoose.Types;
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
const PORT = process.env.PORT || 3000;

// 连接MongoDB数据库
const MONGODB_URI = 'mongodb://localhost:27017/rural_education_platform';

mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 中间件
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 数据模型定义

// 用户模型
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'parent', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  avatar: String,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const User = mongoose.model('User', UserSchema);

// 教师信息模型
const TeacherSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  education: String,
  experience: String,
  introduction: String,
  rating: {
    type: Number,
    default: 0
  }
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

// 学生信息模型
const StudentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  grade: {
    type: String,
    required: true
  },
  school: String,
  address: String,
  parent_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const Student = mongoose.model('Student', StudentSchema);

// 家长信息模型
const ParentSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relation: {
    type: String,
    required: true
  }
});

const Parent = mongoose.model('Parent', ParentSchema);

// 师生匹配模型
const TeacherStudentMatchSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },
  request_from: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  request_message: String,
  parent_approval: {
    type: Boolean,
    default: false
  },
  matched_at: Date,
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

const TeacherStudentMatch = mongoose.model('TeacherStudentMatch', TeacherStudentMatchSchema);

// 消息模型
const MessageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeacherStudentMatch'
  },
  content: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['sent', 'read'],
    default: 'sent'
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

const Message = mongoose.model('Message', MessageSchema);

// 学习进度模型
const LearningProgressSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  progress: {
    type: Number,
    default: 0
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
});

const LearningProgress = mongoose.model('LearningProgress', LearningProgressSchema);

// 心理状态模型
const PsychologicalStatusSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student'
  },
  assessment_date: {
    type: Date
  },
  assessmentDate: {
    type: Date
  },
  emotional_state: {
    type: String,
    enum: ['excellent', 'good', 'normal', 'poor', 'critical'],
    default: 'normal'
  },
  emotionalState: {
    type: String,
    enum: ['excellent', 'good', 'normal', 'poor', 'critical'],
    default: 'normal'
  },
  anxiety_level: {
    type: Number,
    default: 0
  },
  anxietyLevel: {
    type: Number,
    default: 0
  },
  depression_level: {
    type: Number,
    default: 0
  },
  depressionLevel: {
    type: Number,
    default: 0
  },
  counselor_notes: String,
  counselorNotes: String,
  recommendation: String,
  created_at: {
    type: Date,
    default: Date.now
  }
});

const PsychologicalStatus = mongoose.model('PsychologicalStatus', PsychologicalStatusSchema);

// 教学资源模型
const TeachingResourceSchema = new mongoose.Schema({
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  resource_type: {
    type: String,
    enum: ['courseware', 'lesson_plan', 'exercise', 'video', 'other'],
    required: true
  },
  file_path: String,
  upload_date: {
    type: Date,
    default: Date.now
  }
});

const TeachingResource = mongoose.model('TeachingResource', TeachingResourceSchema);

// 资源分享模型
const ResourceShareSchema = new mongoose.Schema({
  resource_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeachingResource',
    required: true
  },
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  shared_at: {
    type: Date,
    default: Date.now
  }
});

const ResourceShare = mongoose.model('ResourceShare', ResourceShareSchema);

// AI匹配推荐模型
const AIRecommendationSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  recommended_teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  match_score: {
    type: Number,
    required: true
  },
  reason: String,
  generated_at: {
    type: Date,
    default: Date.now
  }
});

const AIRecommendation = mongoose.model('AIRecommendation', AIRecommendationSchema);

// API路由

// 用户相关路由
app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username, password });
    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: '用户名或密码错误' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 注册路由
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, password, name, email, phone, role } = req.body;
    
    // 检查用户名是否已存在
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.json({ success: false, message: '用户名已存在' });
    }
    
    // 创建新用户
    const user = new User({
      username,
      password,
      role,
      name,
      email,
      phone
    });
    
    const savedUser = await user.save();
    
    // 根据角色创建相关记录
    if (role === 'teacher') {
      const teacher = new Teacher({
        user_id: savedUser._id,
        subject: '未设置'
      });
      await teacher.save();
    } else if (role === 'student') {
      const student = new Student({
        user_id: savedUser._id,
        grade: '未设置'
      });
      await student.save();
    } else if (role === 'parent') {
      const parent = new Parent({
        user_id: savedUser._id,
        relation: '未设置'
      });
      await parent.save();
    }
    
    res.json({ success: true, message: '注册成功', user: savedUser });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 忘记密码路由
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    
    // 检查邮箱是否存在
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: '邮箱不存在' });
    }
    
    // 这里可以添加发送重置密码邮件的逻辑
    // 暂时返回成功消息
    res.json({ success: true, message: '重置链接已发送到您的邮箱' });
  } catch (error) {
    console.error('忘记密码失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 家长相关路由
app.get('/api/parents/children/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // 验证parentId是否为有效的ObjectId
    if (!ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: '无效的家长ID' });
    }
    
    const children = await Student.find({ parent_id: new ObjectId(parentId) }).populate('user_id');
    res.json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 仪表盘数据路由
app.get('/api/dashboard/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // 验证parentId是否为有效的ObjectId
    if (!ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: '无效的家长ID' });
    }
    
    // 获取孩子数量
    const childrenCount = await Student.countDocuments({ parent_id: new ObjectId(parentId) });
    
    // 获取正在辅导的孩子数量
    const activeMatches = await TeacherStudentMatch.countDocuments({
      student_id: { $in: await Student.find({ parent_id: new ObjectId(parentId) }).distinct('_id') },
      status: 'active'
    });
    
    // 获取学习成绩
    const learningProgress = await LearningProgress.find({
      student_id: { $in: await Student.find({ parent_id: new ObjectId(parentId) }).distinct('_id') }
    });
    
    // 计算平均成绩
    const averageScore = learningProgress.length > 0 
      ? learningProgress.reduce((sum, item) => sum + item.progress, 0) / learningProgress.length
      : 0;
    
    // 获取心理状态
    const psychologicalStatus = await PsychologicalStatus.find({
      student_id: { $in: await Student.find({ parent_id: new ObjectId(parentId) }).distinct('_id') }
    }).sort({ assessment_date: -1 }).limit(1);
    
    res.json({
      success: true,
      data: {
        childrenCount,
        activeMatches,
        averageScore: Math.round(averageScore),
        psychologicalStatus: psychologicalStatus[0]?.emotional_state || 'normal'
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 孩子管理路由
app.get('/api/children/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    
    // 验证parentId是否为有效的ObjectId
    if (!ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: '无效的家长ID' });
    }
    
    const children = await Student.find({ parent_id: new ObjectId(parentId) }).populate('user_id');
    res.json({ success: true, children });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 教师沟通路由
app.get('/api/messages/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 验证userId是否为有效的ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }
    
    const messages = await Message.find({
      $or: [{ sender_id: new ObjectId(userId) }, { receiver_id: new ObjectId(userId) }]
    }).populate('sender_id').populate('receiver_id').sort({ created_at: -1 });
    res.json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 学习报告路由
app.get('/api/learning-report/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // 验证studentId是否为有效的ObjectId
    if (!ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: '无效的学生ID' });
    }
    
    const progress = await LearningProgress.find({ student_id: new ObjectId(studentId) });
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 心理状态路由
app.get('/api/psychological-status/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    // 验证studentId是否为有效的ObjectId
    if (!ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: '无效的学生ID' });
    }
    
    // 查询学生端的心理状态数据（使用student字段）
    const status = await PsychologicalStatus.find({ student_id: new ObjectId(studentId) })
      .sort({ assessment_date: -1 });
    
    // 如果没有找到，尝试使用student字段查询（学生端使用的字段名）
    if (status.length === 0) {
      const statusFromStudent = await PsychologicalStatus.find({ student: new ObjectId(studentId) })
        .sort({ assessment_date: -1 });
      return res.json({ success: true, status: statusFromStudent });
    }
    
    res.json({ success: true, status });
  } catch (error) {
    console.error('获取心理状态失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 匹配确认路由
app.get('/api/match-confirmation/:parentId', async (req, res) => {
  try {
    const { parentId } = req.params;
    console.log('获取匹配请求，家长ID:', parentId);
    
    // 验证parentId是否为有效的ObjectId
    if (!ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: '无效的家长ID' });
    }
    
    // 查找家长的所有孩子
    const children = await Student.find({ parent_id: new ObjectId(parentId) });
    console.log('家长的孩子:', children);
    
    const childIds = children.map(child => child._id);
    console.log('孩子ID列表:', childIds);
    
    // 查找与这些孩子相关的匹配请求
    const matches = await TeacherStudentMatch.find({
      student_id: { $in: childIds }
    });
    console.log('匹配记录:', matches);
    
    res.json({ success: true, matches });
  } catch (error) {
    console.error('获取匹配请求失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 添加孩子路由
app.post('/api/children/add', async (req, res) => {
  try {
    const { parentId, name, grade, subject } = req.body;
    
    // 验证parentId是否为有效的ObjectId
    if (!ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: '无效的家长ID' });
    }
    
    // 创建用户记录
    const user = new User({
      username: `student_${Date.now()}`,
      password: '123456',
      role: 'student',
      name: name
    });
    
    const savedUser = await user.save();
    
    // 创建学生记录
    const student = new Student({
      user_id: savedUser._id,
      grade: grade,
      parent_id: new ObjectId(parentId)
    });
    
    const savedStudent = await student.save();
    
    res.json({ success: true, message: '添加孩子成功', student: savedStudent });
  } catch (error) {
    console.error('添加孩子失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 删除孩子路由
app.post('/api/children/delete', async (req, res) => {
  try {
    const { childId } = req.body;
    
    // 验证childId是否为有效的ObjectId
    if (!ObjectId.isValid(childId)) {
      return res.status(400).json({ success: false, message: '无效的孩子ID' });
    }
    
    // 先删除相关的学生记录
    const student = await Student.findById(childId);
    if (!student) {
      return res.json({ success: false, message: '孩子不存在' });
    }
    
    // 删除用户记录
    await User.findByIdAndDelete(student.user_id);
    
    // 删除学生记录
    await Student.findByIdAndDelete(childId);
    
    res.json({ success: true, message: '删除孩子成功' });
  } catch (error) {
    console.error('删除孩子失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新用户信息路由
app.post('/api/users/update', async (req, res) => {
  try {
    const { userId, name } = req.body;
    console.log('更新用户信息:', req.body);
    
    // 验证userId是否为有效的ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }
    
    // 更新用户信息
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, updated_at: new Date() },
      { new: true }
    );
    
    console.log('更新用户结果:', updatedUser);
    
    if (!updatedUser) {
      return res.json({ success: false, message: '用户不存在' });
    }
    
    res.json({ success: true, message: '更新成功', user: updatedUser });
  } catch (error) {
    console.error('更新用户失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 更新学生信息路由
app.post('/api/students/update', async (req, res) => {
  try {
    const { studentId, grade, school, address } = req.body;
    console.log('更新学生信息:', req.body);
    
    // 验证studentId是否为有效的ObjectId
    if (!ObjectId.isValid(studentId)) {
      return res.status(400).json({ success: false, message: '无效的学生ID' });
    }
    
    // 更新学生信息
    const updatedStudent = await Student.findByIdAndUpdate(
      studentId,
      { grade, school, address },
      { new: true }
    );
    
    console.log('更新学生结果:', updatedStudent);
    
    if (!updatedStudent) {
      return res.json({ success: false, message: '学生不存在' });
    }
    
    res.json({ success: true, message: '更新成功', student: updatedStudent });
  } catch (error) {
    console.error('更新学生失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取教师列表路由
app.get('/api/parents/teachers/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // 验证userId是否为有效的ObjectId
    if (!ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }
    
    // 获取家长的所有孩子
    const children = await Student.find({ parent_id: new ObjectId(userId) }).distinct('_id');
    
    // 获取与这些孩子相关的匹配记录
    const matches = await TeacherStudentMatch.find({
      student_id: { $in: children },
      status: { $in: ['active', 'approved'] }
    }).distinct('teacher_id');
    
    // 获取教师信息
    const teachers = await Teacher.find({ _id: { $in: matches } }).populate('user_id');
    
    res.json({ success: true, teachers });
  } catch (error) {
    console.error('获取教师列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 按孩子获取教师列表路由
app.get('/api/parents/child-teachers/:childId', async (req, res) => {
  try {
    const { childId } = req.params;
    
    // 验证childId是否为有效的ObjectId
    if (!ObjectId.isValid(childId)) {
      return res.status(400).json({ success: false, message: '无效的孩子ID' });
    }
    
    // 获取与这个孩子相关的匹配记录
    const matches = await TeacherStudentMatch.find({
      student_id: new ObjectId(childId),
      status: { $in: ['active', 'approved'] }
    }).distinct('teacher_id');
    
    // 获取教师信息
    const teachers = await Teacher.find({ _id: { $in: matches } }).populate('user_id');
    
    res.json({ success: true, teachers });
  } catch (error) {
    console.error('获取孩子教师列表失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 发送消息路由
app.post('/api/messages/send', async (req, res) => {
  try {
    const { sender_id, receiver_id, content } = req.body;
    
    // 验证sender_id和receiver_id是否为有效的ObjectId
    if (!ObjectId.isValid(sender_id) || !ObjectId.isValid(receiver_id)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }
    
    const message = new Message({
      sender_id: new ObjectId(sender_id),
      receiver_id: new ObjectId(receiver_id),
      content: content
    });
    
    const savedMessage = await message.save();
    
    // 填充发送者和接收者信息
    await savedMessage.populate('sender_id');
    await savedMessage.populate('receiver_id');
    
    res.json({ success: true, message: '消息发送成功', data: savedMessage });
  } catch (error) {
    console.error('发送消息失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 获取两人之间的对话记录
app.get('/api/messages/conversation/:userId1/:userId2', async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    
    // 验证userId1和userId2是否为有效的ObjectId
    if (!ObjectId.isValid(userId1) || !ObjectId.isValid(userId2)) {
      return res.status(400).json({ success: false, message: '无效的用户ID' });
    }
    
    const messages = await Message.find({
      $or: [
        { sender_id: new ObjectId(userId1), receiver_id: new ObjectId(userId2) },
        { sender_id: new ObjectId(userId2), receiver_id: new ObjectId(userId1) }
      ]
    })
      .populate('sender_id')
      .populate('receiver_id')
      .sort({ created_at: 1 });
    
    res.json({ success: true, messages });
  } catch (error) {
    console.error('获取对话记录失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 同意匹配请求路由
app.post('/api/match/approve', async (req, res) => {
  try {
    const { matchId, parentId } = req.body;
    
    // 验证matchId和parentId是否为有效的ObjectId
    if (!ObjectId.isValid(matchId) || !ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: '无效的ID' });
    }
    
    const match = await TeacherStudentMatch.findById(matchId);
    if (!match) {
      return res.json({ success: false, message: '匹配请求不存在' });
    }
    
    // 验证是否是孩子的家长
    const student = await Student.findById(match.student_id);
    if (student.parent_id.toString() !== parentId) {
      return res.json({ success: false, message: '无权操作此请求' });
    }
    
    // 更新匹配状态
    match.parent_approval = true;
    match.status = 'approved';
    match.updated_at = new Date();
    
    await match.save();
    
    res.json({ success: true, message: '已同意辅导请求' });
  } catch (error) {
    console.error('同意请求失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 拒绝匹配请求路由
app.post('/api/match/reject', async (req, res) => {
  try {
    const { matchId, parentId } = req.body;
    
    // 验证matchId和parentId是否为有效的ObjectId
    if (!ObjectId.isValid(matchId) || !ObjectId.isValid(parentId)) {
      return res.status(400).json({ success: false, message: '无效的ID' });
    }
    
    const match = await TeacherStudentMatch.findById(matchId);
    if (!match) {
      return res.json({ success: false, message: '匹配请求不存在' });
    }
    
    // 验证是否是孩子的家长
    const student = await Student.findById(match.student_id);
    if (student.parent_id.toString() !== parentId) {
      return res.json({ success: false, message: '无权操作此请求' });
    }
    
    // 更新匹配状态
    match.parent_approval = false;
    match.status = 'rejected';
    match.updated_at = new Date();
    
    await match.save();
    
    res.json({ success: true, message: '已拒绝辅导请求' });
  } catch (error) {
    console.error('拒绝请求失败:', error);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`服务器运行在 http://localhost:${PORT}`);
});
