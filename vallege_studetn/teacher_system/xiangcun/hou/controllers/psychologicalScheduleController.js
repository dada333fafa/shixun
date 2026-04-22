const PsychologicalSchedule = require('../models/PsychologicalSchedule');
const Message = require('../models/Message');
const Student = require('../models/Student');

// @route   POST /api/v1/psychological-schedules
// @desc    安排心理咨询
// @access  Private (Teacher)
exports.scheduleCounseling = async (req, res) => {
  try {
    const {
      studentId,
      counselorId,
      counselorName,
      counselorTitle,
      counselorContact,
      counselorPhone,
      counselorEmail,
      counselorSpecialties,
      counselorBio,
      scheduleTime,
      method,
      notes,
      studentCondition,
      studentDescription
    } = req.body;

    if (!studentId || !counselorId || !scheduleTime) {
      return res.status(400).json({
        status: 'error',
        message: '请填写必填字段'
      });
    }

    const schedule = new PsychologicalSchedule({
      studentId,
      teacherId: req.user.id,
      counselorId,
      counselorName,
      counselorTitle,
      counselorContact,
      counselorPhone,
      counselorEmail,
      counselorSpecialties,
      counselorBio,
      scheduleTime,
      method,
      notes,
      studentCondition,
      studentDescription,
      status: 'pending'
    });

    await schedule.save();

    // 发送消息给学生
    const messageContent = `老师为您安排了心理咨询：\n\n` +
      `心理师：${counselorName} (${counselorTitle})\n` +
      `时间：${scheduleTime}\n` +
      `方式：${method === 'video' ? '视频咨询' : method === 'voice' ? '语音咨询' : '文字咨询'}\n` +
      `心理状态：${studentCondition}\n` +
      `需求描述：${studentDescription}\n` +
      `联系方式：${counselorContact}\n` +
      `${counselorPhone ? '电话：' + counselorPhone + '\n' : ''}` +
      `${counselorEmail ? '邮箱：' + counselorEmail + '\n' : ''}` +
      `备注：${notes || '无'}\n\n` +
      `请点击"接受"确认咨询安排。`;

    const message = new Message({
      senderId: req.user.id,
      receiverId: studentId,
      content: messageContent,
      type: 'text'
    });
    await message.save();

    res.json({
      status: 'success',
      message: '咨询安排成功',
      data: { schedule }
    });
  } catch (error) {
    console.error('安排咨询错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// @route   GET /api/v1/psychological-schedules/student/:studentId
// @desc    获取学生的咨询安排
// @access  Private
exports.getStudentSchedules = async (req, res) => {
  try {
    const { studentId } = req.params;

    const schedules = await PsychologicalSchedule.find({ studentId })
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { schedules }
    });
  } catch (error) {
    console.error('获取咨询安排错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// @route   PUT /api/v1/psychological-schedules/:id/accept
// @desc    接受咨询安排
// @access  Private
exports.acceptSchedule = async (req, res) => {
  try {
    const schedule = await PsychologicalSchedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        status: 'error',
        message: '咨询安排不存在'
      });
    }

    schedule.status = 'completed';
    await schedule.save();

    res.json({
      status: 'success',
      message: '已接受咨询安排',
      data: { schedule }
    });
  } catch (error) {
    console.error('接受咨询安排错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};

// @route   GET /api/v1/psychological-schedules
// @desc    获取教师安排的咨询列表
// @access  Private (Teacher)
exports.getTeacherSchedules = async (req, res) => {
  try {
    const schedules = await PsychologicalSchedule.find({ teacherId: req.user.id })
      .populate('studentId', 'name grade')
      .sort({ createdAt: -1 });

    res.json({
      status: 'success',
      data: { schedules }
    });
  } catch (error) {
    console.error('获取咨询列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '服务器错误',
      error: error.message
    });
  }
};
