const express = require('express');
const { getSubjects, createSubject, deleteSubject } = require('../controllers/subjects');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/', getSubjects);
router.post('/', authorize('admin', 'staff'), createSubject);
router.delete('/:id', authorize('admin', 'staff'), deleteSubject);

module.exports = router;
