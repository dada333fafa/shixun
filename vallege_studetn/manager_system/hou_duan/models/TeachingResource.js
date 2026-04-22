const mongoose = require('mongoose');

const teachingResourceSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  resourceType: {
    type: String,
    enum: ['courseware', 'lesson_plan', 'exercise', 'video', 'other'],
    required: true
  },
  filePath: String,
  downloadCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeachingResource', teachingResourceSchema);
