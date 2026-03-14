const ExamLog = require('../models/ExamLog');

// @desc    Log exam activity
// @route   POST /api/v1/logs
// @access  Private/Student
exports.logActivity = async (req, res) => {
    try {
        const { examId, activity, details } = req.body;
        const log = await ExamLog.create({
            student: req.user.id,
            exam: examId,
            activity,
            details
        });
        res.status(201).json({ success: true, data: log });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all exam logs
// @route   GET /api/v1/logs
// @access  Private/Admin/Staff
exports.getLogs = async (req, res) => {
    try {
        const logs = await ExamLog.find()
            .populate('student', 'email')
            .populate('exam', 'name')
            .sort('-timestamp');
        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get logs for an exam
// @route   GET /api/v1/logs/:examId
// @access  Private/Admin/Staff
exports.getExamLogs = async (req, res) => {
    try {
        const logs = await ExamLog.find({ exam: req.params.examId })
            .populate('student', 'email')
            .sort('-timestamp');
        res.status(200).json({ success: true, data: logs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
