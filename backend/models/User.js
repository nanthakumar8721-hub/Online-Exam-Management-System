const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  employeeId: {
    type: String,
    sparse: true,
    unique: true
  },
  registerNumber: {
    type: String,
    sparse: true,
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['student', 'admin', 'staff', 'org_admin'],
    default: 'student'
  },
  organization: {
    type: mongoose.Schema.ObjectId,
    ref: 'Organization'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isApproved: {
    type: Boolean,
    default: true
  },
  passwordChangeOtp: {
    type: String,
    select: false
  },
  passwordChangeOtpExpire: Date,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Sign JWT and return
UserSchema.methods.getSignedJwtToken = function () {
  return jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate and hash password change OTP
UserSchema.methods.getPasswordChangeOtp = function () {
  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP and set to passwordChangeOtp field
  this.passwordChangeOtp = crypto.createHash('sha256').update(otp).digest('hex');

  // Set expire (10 minutes)
  this.passwordChangeOtpExpire = Date.now() + 10 * 60 * 1000;

  return otp;
};

module.exports = mongoose.model('User', UserSchema);
