const mongoose = require('mongoose');

const aiRecommendationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  teacherId: {
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
  reason: String
}, {
  timestamps: true
});

module.exports = mongoose.model('AIRecommendation', aiRecommendationSchema);
