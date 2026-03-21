const express = require('express');
const {
  getExams,
  getExam,
  createExam,
  updateExam,
  deleteExam,
  sendExamLinks,
  addQuestionToExam,
  addMultipleQuestionsToExam,
  removeQuestionFromExam
} = require('../controllers/exams');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router
  .route('/')
  .get(getExams)
  .post(authorize('admin', 'org_admin', 'staff'), createExam);

router
  .route('/:id')
  .get(getExam)
  .put(authorize('admin', 'org_admin', 'staff'), updateExam)
  .delete(authorize('admin', 'org_admin', 'staff'), deleteExam);

router.post('/:id/questions', authorize('admin', 'org_admin', 'staff'), addQuestionToExam);
router.post('/:id/questions/bulk', authorize('admin', 'org_admin', 'staff'), addMultipleQuestionsToExam);
router.delete('/:id/questions/:questionId', authorize('admin', 'org_admin', 'staff'), removeQuestionFromExam);
router.post('/:id/send-links', authorize('admin', 'org_admin'), sendExamLinks);

module.exports = router;
