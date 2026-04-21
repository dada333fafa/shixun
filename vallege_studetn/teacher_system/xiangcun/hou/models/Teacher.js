const mongoose = require('mongoose');

const teacherSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  subject: {
    type: String,
    default: '未设置'
  },
  education: String,
  experience: String,
  specialties: String,
  availability: String,
  introduction: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Teacher', teacherSchema);
