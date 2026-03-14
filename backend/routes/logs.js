const express = require('express');
const { logActivity, getLogs, getExamLogs } = require('../controllers/logs');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.post('/', authorize('student'), logActivity);
router.get('/', authorize('admin', 'staff'), getLogs);
router.get('/exam/:examId', authorize('admin', 'staff'), getExamLogs);

module.exports = router;
