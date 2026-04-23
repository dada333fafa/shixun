const TeacherEvaluation = require('../models/TeacherEvaluation');
const TeacherStudentMatch = require('../models/TeacherStudentMatch');

// 添加或更新教师评价
exports.addOrUpdateEvaluation = async (req, res) => {
  try {
    const { studentId, score, comment, subject } = req.body;
    const userId = req.user.id || req.user._id;

    console.log('📝 收到评价请求:', { studentId, score, comment, subject, userId });

    if (!studentId || score === undefined || score === null || !comment) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段（学生ID、分数、评语）'
      });
    }

    // 验证分数范围
    if (score < 0 || score > 100) {
      return res.status(400).json({
        status: 'error',
        message: '分数必须在0-100之间'
      });
    }

    // 通过用户ID查找教师记录
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: userId });
    
    if (!teacher) {
      console.log('❌ 未找到教师记录，userId:', userId);
      return res.status(403).json({
        status: 'error',
        message: '您不是教师用户'
      });
    }

    const teacherId = teacher._id;
    console.log('✅ 找到教师记录，teacherId:', teacherId);

    // 查找是否已有评价记录
    let evaluation = await TeacherEvaluation.findOne({
      student: studentId,
      teacher: teacherId,
      subject: subject || '综合'
    }).sort({ evaluationDate: -1 });

    if (evaluation) {
      // 更新现有评价
      evaluation.score = score;
      evaluation.comment = comment;
      evaluation.subject = subject || '综合';
      evaluation.evaluationDate = new Date();
      await evaluation.save();
      console.log('✅ 更新评价成功');
    } else {
      // 创建新评价
      evaluation = await TeacherEvaluation.create({
        student: studentId,
        teacher: teacherId,
        score,
        comment,
        subject: subject || '综合',
        evaluationDate: new Date()
      });
      console.log('✅ 创建评价成功');
    }

    // 填充学生和教师信息
    evaluation = await TeacherEvaluation.findById(evaluation._id)
      .populate('student')
      .populate('teacher');

    res.status(201).json({
      status: 'success',
      message: '评价保存成功',
      data: evaluation
    });
  } catch (error) {
    console.error('❌ 添加评价错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      status: 'error',
      message: '服务器错误: ' + error.message,
      error: error.message
    });
  }
};

// 获取学生对所有教师的评价列表（用于家长端）
exports.getEvaluationsByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const evaluations = await TeacherEvaluation.find({ student: studentId })
      .populate({
        path: 'teacher',
        populate: {
          path: 'user',
          select: 'name'
        }
      })
      .populate('student')
      .sort({ evaluationDate: -1 });

    // 转换数据格式，将教师姓名提取到顶层
    const formattedEvaluations = evaluations.map(eval => {
      const evalObj = eval.toObject();
      if (evalObj.teacher && evalObj.teacher.user) {
        evalObj.teacher.name = evalObj.teacher.user.name;
      }
      return evalObj;
    });

    res.json({
      status: 'success',
      message: '获取成功',
      data: formattedEvaluations
    });
  } catch (error) {
    console.error('获取评价错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// 获取教师对某个学生的评价
exports.getEvaluationByTeacherAndStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user._id;

    // 通过用户ID查找教师记录
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findOne({ user: userId });
    
    if (!teacher) {
      return res.json({
        status: 'success',
        message: '暂无评价',
        data: null
      });
    }

    const teacherId = teacher._id;

    const evaluation = await TeacherEvaluation.findOne({
      student: studentId,
      teacher: teacherId
    }).sort({ evaluationDate: -1 })
      .populate('student', 'name grade')
      .populate('teacher', 'name');

    if (!evaluation) {
      return res.json({
        status: 'success',
        message: '暂无评价',
        data: null
      });
    }

    res.json({
      status: 'success',
      message: '获取成功',
      data: evaluation
    });
  } catch (error) {
    console.error('获取评价错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
