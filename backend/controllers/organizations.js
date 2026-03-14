const Organization = require('../models/Organization');
const User = require('../models/User');
const emailService = require('../utils/emailService');
const crypto = require('crypto');

// @desc    Register a new organization (public)
// @route   POST /api/v1/organizations
// @access  Public
exports.registerOrganization = async (req, res) => {
    try {
        const { name, email, phone, address, website, description, type } = req.body;

        const existing = await Organization.findOne({ $or: [{ email }, { name }] });
        if (existing) {
            return res.status(400).json({ success: false, error: 'An organization with this name or email already exists' });
        }

        const org = await Organization.create({ name, email, phone, address, website, description, type });

        res.status(201).json({ success: true, data: org });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all organizations
// @route   GET /api/v1/organizations
// @access  Private/Admin
exports.getOrganizations = async (req, res) => {
    try {
        const orgs = await Organization.find().populate('adminUser', 'name email').sort('-createdAt');
        res.status(200).json({ success: true, count: orgs.length, data: orgs });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Approve an organization and create org_admin account
// @route   PUT /api/v1/organizations/:id/approve
// @access  Private/Admin
exports.approveOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
        if (org.isApproved) return res.status(400).json({ success: false, error: 'Organization already approved' });

        // Create an org_admin user for this organization
        const password = crypto.randomBytes(10).toString('hex');
        const adminUser = await User.create({
            name: `${org.name} Admin`,
            email: org.email,
            password,
            role: 'org_admin',
            organization: org._id,
            isApproved: true,
            isVerified: true
        });

        // Update org
        org.isApproved = true;
        org.isRejected = false;
        org.adminUser = adminUser._id;
        await org.save();

        // Send credentials
        try {
            await emailService.sendCredentials(org.email, password, `${org.name} Admin`);
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message);
        }

        res.status(200).json({ success: true, data: org });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Reject an organization
// @route   PUT /api/v1/organizations/:id/reject
// @access  Private/Admin
exports.rejectOrganization = async (req, res) => {
    try {
        const org = await Organization.findByIdAndUpdate(req.params.id, {
            isRejected: true,
            isApproved: false,
            rejectionReason: req.body.reason || 'Not meeting requirements'
        }, { new: true });

        if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

        res.status(200).json({ success: true, data: org });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete an organization
// @route   DELETE /api/v1/organizations/:id
// @access  Private/Admin
exports.deleteOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.params.id);
        if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });

        // Remove associated admin user if exists
        if (org.adminUser) {
            await User.findByIdAndDelete(org.adminUser);
        }

        await org.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get own organization details
// @route   GET /api/v1/organizations/me
// @access  Private/OrgAdmin
exports.getMyOrganization = async (req, res) => {
    try {
        const org = await Organization.findById(req.user.organization).populate('adminUser', 'name email');
        if (!org) return res.status(404).json({ success: false, error: 'Organization not found' });
        res.status(200).json({ success: true, data: org });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Get all users of org
// @route   GET /api/v1/organizations/me/users
// @access  Private/OrgAdmin
exports.getOrgUsers = async (req, res) => {
    try {
        const users = await User.find({ organization: req.user.organization, role: { $in: ['staff', 'student'] } }).sort('-createdAt');
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Register a staff or student into the org
// @route   POST /api/v1/organizations/me/users
// @access  Private/OrgAdmin
exports.registerOrgUser = async (req, res) => {
    try {
        const { name, email, role, employeeId, registerNumber } = req.body;

        if (!['staff', 'student'].includes(role)) {
            return res.status(400).json({ success: false, error: 'Role must be staff or student' });
        }

        const password = crypto.randomBytes(8).toString('hex');

        const userFields = {
            name,
            email,
            role,
            password,
            organization: req.user.organization,
            isApproved: true,
            isVerified: true
        };

        if (role === 'staff') userFields.employeeId = employeeId;
        if (role === 'student') userFields.registerNumber = registerNumber;

        const user = await User.create(userFields);

        // Update org counts
        const countField = role === 'staff' ? 'staffCount' : 'studentCount';
        await Organization.findByIdAndUpdate(req.user.organization, { $inc: { [countField]: 1 } });

        let emailSent = false;
        try {
            await emailService.sendCredentials(email, password, name);
            emailSent = true;
        } catch (emailErr) {
            console.error('Email failed:', emailErr.message);
        }

        res.status(201).json({ success: true, data: { ...user.toObject(), emailSent } });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};

// @desc    Delete a user from the org
// @route   DELETE /api/v1/organizations/me/users/:id
// @access  Private/OrgAdmin
exports.deleteOrgUser = async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.params.id, organization: req.user.organization });
        if (!user) return res.status(404).json({ success: false, error: 'User not found in your organization' });

        const countField = user.role === 'staff' ? 'staffCount' : 'studentCount';
        await Organization.findByIdAndUpdate(req.user.organization, { $inc: { [countField]: -1 } });

        await user.deleteOne();
        res.status(200).json({ success: true, data: {} });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
};
