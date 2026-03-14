const express = require('express');
const { register, login, getAuthStatus, updateDetails, updatePassword, requestPasswordChangeOtp } = require('../controllers/auth');

const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/status', getAuthStatus);
router.post('/register', register);
router.post('/login', login);
router.post('/request-password-otp', protect, requestPasswordChangeOtp);
router.put('/updatedetails', protect, updateDetails);
router.put('/updatepassword', protect, updatePassword);

module.exports = router;
