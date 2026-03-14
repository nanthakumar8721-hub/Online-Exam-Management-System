const Result = require('../models/Result');
const Exam = require('../models/Exam');
const Question = require('../models/Question');

// @desc    Submit exam and calculate results
// @route   POST /api/v1/results/submit
// @access  Private/Student
exports.submitExam = async (req, res) => {
    try {
        const { examId, userAnswers } = req.body;
        const studentId = req.user.id;

        // Check if already submitted
        const existingResult = await Result.findOne({ student: studentId, exam: examId });
        if (existingResult) {
            return res.status(400).json({ success: false, error: 'Exam already submitted' });
        }

        const exam = await Exam.findById(examId).populate('questions');
        if (!exam) {
            return res.status(404).json({ success: false, error: 'Exam not found' });
        }

        let obtainedMarks = 0;
        let totalMarks = 0;
        const answers = [];

        exam.questions.forEach(question => {
            totalMarks += question.marks;
            const studentAnswer = userAnswers.find(a => a.questionId === question._id.toString());

            let isCorrect = false;
            if (studentAnswer) {
                const correctOption = question.options.find(o => o.isCorrect);
                if (correctOption && studentAnswer.selectedOption === correctOption.text) {
                    isCorrect = true;
                    obtainedMarks += question.marks;
                }
            }

            answers.push({
                question: question._id,
                selectedOption: studentAnswer ? studentAnswer.selectedOption : null,
                isCorrect
            });
        });

        const percentage = (obtainedMarks / totalMarks) * 100;
        const status = percentage >= 40 ? 'pass' : 'fail'; // Default 40% pass mark

        const result = await Result.create({
            student: studentId,
            exam: examId,
            obtainedMarks,
            totalMarks,
            percentage,
            status,
            answers
        });

        res.status(201).json({ success: true, data: result });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get results for a student
// @route   GET /api/v1/results/myresults
// @access  Private/Student
exports.getMyResults = async (req, res) => {
    try {
        const results = await Result.find({ student: req.user.id })
            .populate('exam', 'name scheduledDate')
            .populate('student', 'email');
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all results (Admin/Staff)
// @route   GET /api/v1/results
// @access  Private/Admin/Staff
exports.getAllResults = async (req, res) => {
    try {
        const results = await Result.find()
            .populate('exam', 'name')
            .populate('student', 'email');
        res.status(200).json({ success: true, data: results });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
