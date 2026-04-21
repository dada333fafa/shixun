const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  recommendedTeacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  reason: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AiRecommendation', aiRecommendationSchema);