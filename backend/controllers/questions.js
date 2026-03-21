const Question = require('../models/Question');

// @desc    Get all questions
// @route   GET /api/v1/questions
// @access  Private/Admin
exports.getQuestions = async (req, res) => {
    try {
        let query;
        if (req.query.subject) {
            query = Question.find({ subject: req.query.subject });
        } else {
            query = Question.find();
        }
        const questions = await query;
        res.status(200).json({ success: true, count: questions.length, data: questions });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create question
// @route   POST /api/v1/questions
// @access  Private/Admin
exports.createQuestion = async (req, res) => {
    try {
        const question = await Question.create(req.body);
        res.status(201).json({ success: true, data: question });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Bulk create questions
// @route   POST /api/v1/questions/bulk
// @access  Private/Admin
exports.bulkCreateQuestions = async (req, res) => {
    try {
        const questions = await Question.insertMany(req.body.questions);
        res.status(201).json({ success: true, count: questions.length, data: questions });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Update question
// @route   PUT /api/v1/questions/:id
// @access  Private/Admin
exports.updateQuestion = async (req, res) => {
    try {
        let question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }

        question = await Question.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });

        res.status(200).json({ success: true, data: question });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete question
// @route   DELETE /api/v1/questions/:id
// @access  Private/Admin
exports.deleteQuestion = async (req, res) => {
    try {
        const question = await Question.findByIdAndDelete(req.params.id);
        if (!question) {
            return res.status(404).json({ success: false, error: 'Question not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
