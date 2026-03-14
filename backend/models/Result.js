const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
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
  obtainedMarks: { type: Number, required: true },
  totalMarks: { type: Number, required: true },
  percentage: Number,
  status: {
    type: String,
    enum: ['pass', 'fail'],
    required: true
  },
  answers: [{
    question: { type: mongoose.Schema.ObjectId, ref: 'Question' },
    selectedOption: String,
    isCorrect: Boolean
  }],
  submittedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Result', ResultSchema);
