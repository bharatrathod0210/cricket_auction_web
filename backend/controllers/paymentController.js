const Payment = require('../models/Payment');
const PlayerRegistration = require('../models/PlayerRegistration');

// @desc Get all payments (admin)
const getPayments = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) filter.status = status;
        const payments = await Payment.find(filter)
            .populate('registration', 'fullName mobile email role')
            .sort({ createdAt: -1 });
        res.json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update payment status (admin)
const updatePayment = async (req, res) => {
    try {
        const { status, adminNotes } = req.body;
        const payment = await Payment.findByIdAndUpdate(
            req.params.id,
            { status, adminNotes: adminNotes || '', updatedAt: Date.now() },
            { new: true }
        );
        if (!payment) return res.status(404).json({ success: false, message: 'Payment not found' });
        res.json({ success: true, payment });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get revenue summary (admin)
const getRevenue = async (req, res) => {
    try {
        const total = await Payment.countDocuments();
        const approved = await Payment.countDocuments({ status: 'approved' });
        const pending = await Payment.countDocuments({ status: 'pending' });
        const rejected = await Payment.countDocuments({ status: 'rejected' });
        const revenue = approved * 100;
        res.json({ success: true, total, approved, pending, rejected, revenue });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getPayments, updatePayment, getRevenue };
