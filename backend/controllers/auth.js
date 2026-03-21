const User = require('../models/User');
const crypto = require('crypto');
const emailService = require('../utils/emailService');

// @desc    Register user (Restricted to initial Admin setup)
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { email, password, role, name } = req.body;

    // Check if any users exist
    const userCount = await User.countDocuments();

    if (userCount > 0) {
      return res.status(403).json({
        success: false,
        error: 'Registration is restricted. Please contact your Administrator for onboarding.'
      });
    }

    // Only allow Admin role for the first user
    if (role !== 'admin' && userCount === 0) {
      return res.status(400).json({
        success: false,
        error: 'The first user in the system must be an Administrator.'
      });
    }

    // Create user
    const user = await User.create({
      email,
      name,
      password,
      role: 'admin', // Force admin for first user
      isApproved: true,
      isVerified: true
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Check if any Admin exists
// @route   GET /api/v1/auth/status
// @access  Public
exports.getAuthStatus = async (req, res, next) => {
  try {
    const userCount = await User.countDocuments({ role: 'admin' });
    res.status(200).json({
      success: true,
      hasAdmin: userCount > 0
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Request OTP for password change
// @route   POST /api/v1/auth/request-password-otp
// @access  Private
exports.requestPasswordChangeOtp = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    // Only student and staff need OTP
    if (!['student', 'staff'].includes(user.role)) {
      return res.status(400).json({ success: false, error: 'OTP not required for your role' });
    }

    const otp = user.getPasswordChangeOtp();
    await user.save({ validateBeforeSave: false });

    try {
      await emailService.sendPasswordChangeOtp(user.email, user.name, otp);
      res.status(200).json({ success: true, data: 'OTP sent to email' });
    } catch (err) {
      user.passwordChangeOtp = undefined;
      user.passwordChangeOtpExpire = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ success: false, error: 'Email could not be sent' });
    }
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update user details
// @route   PUT /api/v1/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res, next) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc    Update password
// @route   PUT /api/v1/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('+password +passwordChangeOtp');

    // Check current password
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({ success: false, error: 'Password is incorrect' });
    }

    user.password = req.body.newPassword;
    await user.save();

    try {
      await emailService.sendPasswordChangeSuccess(user.email, user.name);
    } catch (err) {
      console.error('Failed to send success email:', err.message);
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    }
  });
};
