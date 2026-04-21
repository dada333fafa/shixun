const mongoose = require('mongoose');

// 用户模式 - 包含所有角色
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'parent', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 50
  },
  phone: {
    type: String,
    trim: true
  },
  email: {
    type: String,
    lowercase: true,
    trim: true
  },
  avatar: {
    type: String
  }
}, {
  timestamps: true // 自动添加 createdAt 和 updatedAt
});

module.exports = mongoose.model('User', userSchema);