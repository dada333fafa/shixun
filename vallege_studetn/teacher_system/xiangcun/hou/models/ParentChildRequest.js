const mongoose = require('mongoose');

const parentChildRequestSchema = new mongoose.Schema({
  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Parent',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ParentChildRequest', parentChildRequestSchema);
