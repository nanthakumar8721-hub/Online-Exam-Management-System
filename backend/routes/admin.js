const express = require('express');
const { getUsers, approveUser, deleteUser } = require('../controllers/admin');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here are protected and restricted to Admin
router.use(protect);
router.use(authorize('admin'));

router.route('/users').get(getUsers);
router.route('/users/:id/approve').put(approveUser);
router.route('/users/:id').delete(deleteUser);

module.exports = router;
