const express = require('express');
const router = express.Router();
const { getPayments, updatePayment, getRevenue } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getPayments);
router.get('/revenue', protect, getRevenue);
router.put('/:id', protect, updatePayment);

module.exports = router;
