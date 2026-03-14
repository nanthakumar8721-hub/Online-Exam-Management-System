const Subject = require('../models/Subject');

// @desc    Get all subjects
// @route   GET /api/v1/subjects
// @access  Private
exports.getSubjects = async (req, res) => {
    try {
        const subjects = await Subject.find();
        res.status(200).json({ success: true, data: subjects });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Create subject
// @route   POST /api/v1/subjects
// @access  Private/Admin
exports.createSubject = async (req, res) => {
    try {
        const subject = await Subject.create(req.body);
        res.status(201).json({ success: true, data: subject });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
// @desc    Delete subject
// @route   DELETE /api/v1/subjects/:id
// @access  Private/Admin
exports.deleteSubject = async (req, res) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) {
            return res.status(404).json({ success: false, error: 'Subject not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
