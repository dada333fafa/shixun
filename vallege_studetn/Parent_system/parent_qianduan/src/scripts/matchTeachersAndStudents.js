import mongoose from 'mongoose';

// 连接MongoDB数据库
const MONGODB_URI = 'mongodb://localhost:27017/rural_education_platform';

mongoose.connect(MONGODB_URI)
.then(() => console.log('MongoDB连接成功'))
.catch(err => console.error('MongoDB连接失败:', err));

// 数据模型定义

// 用户模型
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student', 'parent', 'admin'], required: true },
  name: { type: String, required: true },
  phone: String,
  email: String,
  avatar: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const User = mongoose.model('User', UserSchema);

// 教师信息模型
const TeacherSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true },
  education: String,
  experience: String,
  introduction: String,
  rating: { type: Number, default: 0 }
});

const Teacher = mongoose.model('Teacher', TeacherSchema);

// 学生信息模型
const StudentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  grade: { type: String, required: true },
  school: String,
  address: String,
  parent_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const Student = mongoose.model('Student', StudentSchema);

// 家长信息模型
const ParentSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  relation: { type: String, required: true }
});

const Parent = mongoose.model('Parent', ParentSchema);

// 师生匹配模型
const TeacherStudentMatchSchema = new mongoose.Schema({
  teacher_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'active', 'completed'], default: 'pending' },
  request_from: { type: String, enum: ['teacher', 'student'], required: true },
  request_message: String,
  parent_approval: { type: Boolean, default: false },
  matched_at: Date,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

const TeacherStudentMatch = mongoose.model('TeacherStudentMatch', TeacherStudentMatchSchema);

// 消息模型
const MessageSchema = new mongoose.Schema({
  sender_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  match_id: { type: mongoose.Schema.Types.ObjectId, ref: 'TeacherStudentMatch' },
  content: { type: String, required: true },
  status: { type: String, enum: ['sent', 'read'], default: 'sent' },
  created_at: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', MessageSchema);

// 匹配老师和学生并添加示例消息
async function matchTeachersAndStudents() {
  try {
    // 获取老师和学生信息
    const teachers = await Teacher.find().populate('user_id');
    const students = await Student.find().populate('user_id');
    const parents = await Parent.find().populate('user_id');

    console.log('找到的老师:', teachers.map(t => `${t.user_id.name} (${t.subject})`));
    console.log('找到的学生:', students.map(s => `${s.user_id.name} (${s.grade})`));
    console.log('找到的家长:', parents.map(p => `${p.user_id.name}`));

    // 找到王老师（数学老师）和张三（三年级学生）
    const wangTeacher = teachers.find(t => t.user_id.name === '王老师');
    const zhangStudent = students.find(s => s.user_id.name === '张三');

    // 找到李老师（语文老师）和李四（五年级学生）
    const liTeacher = teachers.find(t => t.user_id.name === '李老师');
    const liStudent = students.find(s => s.user_id.name === '李四');

    // 找到张三爸爸和李四妈妈
    const zhangParent = parents.find(p => p.user_id.name === '张三爸爸');
    const liParent = parents.find(p => p.user_id.name === '李四妈妈');

    if (!wangTeacher || !zhangStudent || !liTeacher || !liStudent) {
      console.error('找不到对应的老师或学生');
      return;
    }

    console.log('王老师ID:', wangTeacher._id);
    console.log('张三学生ID:', zhangStudent._id);
    console.log('李老师ID:', liTeacher._id);
    console.log('李四学生ID:', liStudent._id);

    // 为王老师和张三创建匹配
    const wangZhangMatch = new TeacherStudentMatch({
      teacher_id: wangTeacher._id,
      student_id: zhangStudent._id,
      status: 'active',
      request_from: 'teacher',
      request_message: '我是王老师，想辅导张三同学的数学',
      parent_approval: true,
      matched_at: new Date()
    });

    // 为李老师和李四创建匹配
    const liLiMatch = new TeacherStudentMatch({
      teacher_id: liTeacher._id,
      student_id: liStudent._id,
      status: 'active',
      request_from: 'teacher',
      request_message: '我是李老师，想辅导李四同学的语文',
      parent_approval: true,
      matched_at: new Date()
    });

    // 保存匹配记录
    const savedWangZhangMatch = await wangZhangMatch.save();
    const savedLiLiMatch = await liLiMatch.save();

    console.log('创建匹配成功');

    // 添加示例消息：王老师 -> 张三爸爸
    const message1 = new Message({
      sender_id: wangTeacher.user_id._id,
      receiver_id: zhangParent.user_id._id,
      match_id: savedWangZhangMatch._id,
      content: '您好，张家长！张三最近在数学学习上有很大进步，尤其是在应用题方面。建议在家多练习一些实际生活中的数学问题，帮助他巩固所学知识。',
      status: 'read',
      created_at: new Date('2026-03-30T10:00:00')
    });

    // 添加示例消息：张三爸爸 -> 王老师
    const message2 = new Message({
      sender_id: zhangParent.user_id._id,
      receiver_id: wangTeacher.user_id._id,
      match_id: savedWangZhangMatch._id,
      content: '谢谢李老师的反馈！我们会按照您的建议，在家多帮助小明练习数学应用。请问小明在课堂上的表现如何？',
      status: 'read',
      created_at: new Date('2026-03-30T10:30:00')
    });

    // 添加示例消息：王老师 -> 张三爸爸
    const message3 = new Message({
      sender_id: wangTeacher.user_id._id,
      receiver_id: zhangParent.user_id._id,
      match_id: savedWangZhangMatch._id,
      content: '小明在课堂上表现很积极，经常主动回答问题，而且作业完成质量也很好。他是个很有潜力的学生，只要继续保持，数学成绩会越来越好的。',
      status: 'read',
      created_at: new Date('2026-03-30T11:00:00')
    });

    // 添加示例消息：李老师 -> 李四妈妈
    const message4 = new Message({
      sender_id: liTeacher.user_id._id,
      receiver_id: liParent.user_id._id,
      match_id: savedLiLiMatch._id,
      content: '您好，李家长！李四最近在语文学习上进步很大，尤其是在阅读理解方面。建议在家多鼓励他阅读一些课外书籍，提高阅读能力。',
      status: 'read',
      created_at: new Date('2026-03-30T14:00:00')
    });

    // 保存消息
    await message1.save();
    await message2.save();
    await message3.save();
    await message4.save();

    console.log('添加示例消息成功');
    console.log('老师和学生匹配完成！');

  } catch (error) {
    console.error('匹配老师和学生失败:', error);
  } finally {
    mongoose.disconnect();
  }
}

// 执行匹配操作
matchTeachersAndStudents();
