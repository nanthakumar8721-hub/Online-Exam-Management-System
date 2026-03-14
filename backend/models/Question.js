const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true
  },
  questionText: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false }
  }],
  marks: { type: Number, default: 1 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
