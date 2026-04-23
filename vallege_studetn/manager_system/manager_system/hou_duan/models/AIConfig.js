const mongoose = require('mongoose');

const aiConfigSchema = new mongoose.Schema({
  subjectWeight: {
    type: Number,
    default: 80,
    min: 0,
    max: 100
  },
  gradeWeight: {
    type: Number,
    default: 70,
    min: 0,
    max: 100
  },
  experienceWeight: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  ratingWeight: {
    type: Number,
    default: 50,
    min: 0,
    max: 100
  },
  maxRecommendations: {
    type: Number,
    default: 5,
    min: 1,
    max: 10
  },
  minMatchScore: {
    type: Number,
    default: 60,
    min: 0,
    max: 100
  },
  algorithmType: {
    type: String,
    enum: ['collaborative', 'content-based', 'hybrid'],
    default: 'hybrid'
  },
  algorithmParams: {
    type: Object,
    default: {
      similarity_threshold: 0.7,
      top_k: 10,
      alpha: 0.6,
      beta: 0.4
    }
  },
  modelName: {
    type: String,
    default: 'ai-recommender-v1.0'
  },
  modelEndpoint: {
    type: String,
    default: 'http://localhost:8000/api/v1/recommend'
  },
  apiKey: String,
  timeout: {
    type: Number,
    default: 30
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AIConfig', aiConfigSchema);
