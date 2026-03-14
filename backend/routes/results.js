const express = require('express');
const { submitExam, getMyResults, getAllResults } = require('../controllers/results');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/submit', authorize('student'), submitExam);
router.get('/myresults', authorize('student'), getMyResults);
router.get('/', authorize('admin', 'staff'), getAllResults);

module.exports = router;
