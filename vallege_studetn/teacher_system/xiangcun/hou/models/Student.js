const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  grade: {
    type: String,
    default: '未设置'
  },
  age: String,
  school: String,
  address: String,
  learning_needs: String,
  psychological_status: String,
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Student', studentSchema);
