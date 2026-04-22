const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema({
  teacher: {
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
  fileSize: Number,
  fileName: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Resource', resourceSchema);
