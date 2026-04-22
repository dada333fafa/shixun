const mongoose = require('mongoose');

const teacherStudentMatchSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'active', 'completed'],
    default: 'pending'
  },
  requestFrom: {
    type: String,
    enum: ['teacher', 'student'],
    required: true
  },
  requestMessage: String,
  parentApproval: {
    type: Boolean,
    default: false
  },
  matchedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('TeacherStudentMatch', teacherStudentMatchSchema);