const express = require('express');
const router = express.Router();
const { loginAdmin, createAdmin, getAdminProfile, updateUpiId, getUpiId } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.post('/setup', createAdmin); // one-time setup
router.get('/profile', protect, getAdminProfile);
router.put('/upi', protect, updateUpiId);
router.get('/upi', getUpiId); // public endpoint

module.exports = router;
