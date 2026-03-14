const mongoose = require('mongoose');

const ExamLogSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  exam: {
    type: mongoose.Schema.ObjectId,
    ref: 'Exam',
    required: true
  },
  activity: {
    type: String,
    required: true // e.g., 'tab-switch', 'exam-start', 'exam-submit'
  },
  details: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ExamLog', ExamLogSchema);
