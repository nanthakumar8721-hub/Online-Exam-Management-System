const mongoose = require('mongoose');

const ExamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subject: {
    type: String,
    required: true
  },
  totalQuestions: Number,
  totalMarks: Number,
  duration: { type: Number, required: true }, // in minutes
  scheduledDate: { type: Date, required: true },
  createdBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization'
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming'
  },
  postponedDescription: {
    type: String,
    default: ''
  },
  questions: [{
    type: mongoose.Schema.ObjectId,
    ref: 'Question'
  }],
  settings: {
    randomizeQuestions: { type: Boolean, default: true },
    randomizeOptions: { type: Boolean, default: true },
    preventTabSwitch: { type: Boolean, default: true },
    maxViolations: { type: Number, default: 3 },
    requireCamera: { type: Boolean, default: false }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Exam', ExamSchema);
