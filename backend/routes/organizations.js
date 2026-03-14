const express = require('express');
const {
    registerOrganization,
    getOrganizations,
    approveOrganization,
    rejectOrganization,
    deleteOrganization,
    getMyOrganization,
    getOrgUsers,
    registerOrgUser,
    deleteOrgUser
} = require('../controllers/organizations');

const { protect, authorize } = require('../middleware/auth');
const router = express.Router();

// Public: self-registration
router.post('/', registerOrganization);

// Admin routes
router.get('/', protect, authorize('admin'), getOrganizations);
router.put('/:id/approve', protect, authorize('admin'), approveOrganization);
router.put('/:id/reject', protect, authorize('admin'), rejectOrganization);
router.delete('/:id', protect, authorize('admin'), deleteOrganization);

// Org Admin routes
router.get('/me', protect, authorize('org_admin'), getMyOrganization);
router.get('/me/users', protect, authorize('org_admin'), getOrgUsers);
router.post('/me/users', protect, authorize('org_admin'), registerOrgUser);
router.delete('/me/users/:id', protect, authorize('org_admin'), deleteOrgUser);

module.exports = router;
