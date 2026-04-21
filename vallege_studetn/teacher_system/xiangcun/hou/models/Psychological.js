const mongoose = require('mongoose');

const psychologicalSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assessmentDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  emotionalState: {
    type: String,
    enum: ['excellent', 'good', 'normal', 'poor', 'critical'],
    default: 'normal'
  },
  anxietyLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  depressionLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  counselorNotes: String,
  recommendation: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Psychological', psychologicalSchema);
