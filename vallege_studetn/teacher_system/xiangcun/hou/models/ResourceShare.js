const mongoose = require('mongoose');

const resourceShareSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TeachingResource',
    required: true
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Student',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ResourceShare', resourceShareSchema);
