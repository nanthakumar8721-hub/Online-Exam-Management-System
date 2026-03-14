const Exam = require('../models/Exam');
const Question = require('../models/Question');
const Subject = require('../models/Subject');
const User = require('../models/User');
const emailService = require('../utils/emailService');

// @desc    Get all exams
// @route   GET /api/v1/exams
// @access  Private
exports.getExams = async (req, res, next) => {
  try {
    let queryObj = {};

    // Filter by organization if user belongs to one
    if (req.user.organization) {
      queryObj.organization = req.user.organization;
    }

    // If student, only show upcoming, ongoing, or completed. 
    // In a real scenario we'd check if they are assigned.
    // For now we just get the organization exams.

    const exams = await Exam.find(queryObj).sort({ scheduledDate: 1 }).populate('questions');
    res.status(200).json({ success: true, count: exams.length, data: exams });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Get single exam
// @route   GET /api/v1/exams/:id
// @access  Private
exports.getExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id)
      .populate('questions');

    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Create new exam
// @route   POST /api/v1/exams
// @access  Private/Admin/OrgAdmin
exports.createExam = async (req, res, next) => {
  try {
    // Add user and org to req.body
    req.body.createdBy = req.user.id;
    if (req.user.organization) {
      req.body.organization = req.user.organization;
    }

    const exam = await Exam.create(req.body);
    res.status(201).json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Send Exam Links to Students
// @route   POST /api/v1/exams/:id/send-links
// @access  Private/Admin/Staff
exports.sendExamLinks = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Get all students
    const students = await User.find({ role: 'student' });

    // In a real app, you might have specific students assigned to an exam.
    // For now, we'll send it to all registered students.
    const examLink = `${process.env.FRONTEND_URL}/exam/${exam._id}`;

    for (const student of students) {
      try {
        await emailService.sendExamLink(student.email, exam.name, examLink);
      } catch (err) {
        console.error(`Link failed for ${student.email}:`, err.message);
      }
    }

    res.status(200).json({ success: true, message: `Links sent to ${students.length} students` });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update exam
// @route   PUT /api/v1/exams/:id
// @access  Private/Admin
exports.updateExam = async (req, res, next) => {
  try {
    let exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    exam = await Exam.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: exam });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Delete exam
// @route   DELETE /api/v1/exams/:id
// @access  Private/Admin
exports.deleteExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);

    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    await exam.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
// @desc    Add question to exam
// @route   POST /api/v1/exams/:id/questions
// @access  Private/Admin/Staff
exports.addQuestionToExam = async (req, res, next) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) {
      return res.status(404).json({ success: false, error: 'Exam not found' });
    }

    // Create question
    const question = await Question.create({
      ...req.body,
      subject: exam.subject // Ensure subject matches exam
    });

    // Add question to exam
    exam.questions.push(question._id);
    await exam.save();

    res.status(201).json({ success: true, data: question });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
