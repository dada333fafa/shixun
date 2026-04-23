const mongoose = require('mongoose');

const teacherEvaluationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  score: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  comment: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    default: '综合'
  },
  evaluationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// 创建复合索引，确保一个老师对一个学生在同一科目上只有一个最新评价
teacherEvaluationSchema.index({ student: 1, teacher: 1, subject: 1, evaluationDate: -1 });

module.exports = mongoose.model('TeacherEvaluation', teacherEvaluationSchema);
