const mongoose = require('mongoose');

const psychologicalStatusSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  assessmentDate: {
    type: Date,
    required: true
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
    max: 10
  },
  depressionLevel: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  counselorNotes: {
    type: String
  },
  recommendation: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PsychologicalStatus', psychologicalStatusSchema);