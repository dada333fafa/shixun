const mongoose = require('mongoose');

const aiTeacherProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true,
    index: true
  },
  education: String,
  experience: String,
  rating: {
    type: Number,
    default: 4.0,
    min: 0,
    max: 5,
    index: true
  },
  introduction: {
    type: String,
    default: ''
  },
  teaching_style: String,
  specialties: String,
  available_grades: String,
  max_students: {
    type: Number,
    default: 10
  },
  is_active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'ai_teacher_profiles'
});

module.exports = mongoose.model('AiTeacherProfile', aiTeacherProfileSchema);
