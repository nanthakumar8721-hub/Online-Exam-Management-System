const express = require('express');
const { getQuestions, createQuestion, bulkCreateQuestions } = require('../controllers/questions');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(authorize('admin', 'staff'), getQuestions)
  .post(authorize('admin', 'staff'), createQuestion);

router.post('/bulk', authorize('admin', 'staff'), bulkCreateQuestions);

module.exports = router;
