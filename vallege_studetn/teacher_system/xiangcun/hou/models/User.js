const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['teacher', 'student', 'parent', 'admin'],
    required: true
  },
  name: {
    type: String,
    required: true
  },
  phone: String,
  email: String,
  gender: String,
  birth_date: Date,
  QQ: String,
  WeChat: String,
  address: String,
  avatar: String
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
