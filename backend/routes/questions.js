const express = require('express');
const { getQuestions, createQuestion, updateQuestion, bulkCreateQuestions } = require('../controllers/questions');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'staff'), getQuestions)
  .post(authorize('admin', 'staff'), createQuestion);

router
  .route('/:id')
  .put(authorize('admin', 'staff', 'org_admin'), updateQuestion);

router.post('/bulk', authorize('admin', 'staff'), bulkCreateQuestions);

module.exports = router;
