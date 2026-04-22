const mongoose = require('mongoose');

const psychologicalScheduleSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  counselorId: {
    type: Number,
    required: true
  },
  counselorName: {
    type: String,
    required: true
  },
  counselorTitle: {
    type: String,
    required: true
  },
  counselorContact: {
    type: String,
    required: true
  },
  counselorPhone: {
    type: String,
    default: ''
  },
  counselorEmail: {
    type: String,
    default: ''
  },
  counselorSpecialties: {
    type: [String],
    default: []
  },
  counselorBio: {
    type: String,
    default: ''
  },
  scheduleTime: {
    type: String,
    required: true
  },
  method: {
    type: String,
    enum: ['video', 'voice', 'text'],
    default: 'video'
  },
  notes: {
    type: String,
    default: ''
  },
  studentCondition: {
    type: String,
    default: ''
  },
  studentDescription: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PsychologicalSchedule', psychologicalScheduleSchema);
