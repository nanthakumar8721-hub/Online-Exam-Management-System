const mongoose = require('mongoose');

const OrganizationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Organization name is required'],
        trim: true,
        unique: true
    },
    email: {
        type: String,
        required: [true, 'Official email is required'],
        unique: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required']
    },
    address: {
        type: String,
        required: [true, 'Address is required']
    },
    website: {
        type: String
    },
    description: {
        type: String
    },
    type: {
        type: String,
        enum: ['school', 'college', 'university', 'corporate', 'training_center', 'other'],
        default: 'college'
    },
    adminUser: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    isApproved: {
        type: Boolean,
        default: false
    },
    isRejected: {
        type: Boolean,
        default: false
    },
    rejectionReason: {
        type: String
    },
    staffCount: {
        type: Number,
        default: 0
    },
    studentCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Organization', OrganizationSchema);
