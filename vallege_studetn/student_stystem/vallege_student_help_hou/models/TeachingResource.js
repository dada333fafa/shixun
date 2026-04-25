const mongoose = require('mongoose');

const teachingResourceSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  resourceType: {
    type: String,
    enum: ['courseware', 'lesson_plan', 'exercise', 'video', 'other'],
    required: true
  },
  filePath: {
    type: String
  },
  fileName: {
    type: String
  },
  hasPassword: {
    type: Boolean,
    default: false
  },
  downloadPassword: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('TeachingResource', teachingResourceSchema);