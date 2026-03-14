const express = require('express');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  sendExamLinks,
  addQuestionToExam
} = require('../controllers/exams');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getExams)
  .post(authorize('admin', 'org_admin'), createExam);

router
  .route('/:id')
  .get(getExam)
  .put(authorize('admin', 'org_admin'), updateExam)
  .delete(authorize('admin', 'org_admin'), deleteExam);

router.post('/:id/questions', authorize('admin', 'org_admin', 'staff'), addQuestionToExam);
router.post('/:id/send-links', authorize('admin', 'org_admin'), sendExamLinks);

module.exports = router;
