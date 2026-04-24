const mongoose = require('mongoose');

const aiStudentProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  grade: {
    type: String,
    required: true,
    index: true
  },
  school: String,
  learning_needs: {
    type: String,
    default: ''
  },
  weak_subjects: String,
  learning_goals: String,
  preferred_teacher_personality: String,
  learning_style: String,
  is_active: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  collection: 'ai_student_profiles'
});

module.exports = mongoose.model('AiStudentProfile', aiStudentProfileSchema);
