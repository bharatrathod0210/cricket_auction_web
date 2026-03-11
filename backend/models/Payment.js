const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    registration: { type: String, ref: 'PlayerRegistration', required: true },
    playerName: { type: String, required: true },
    amount: { type: Number, default: 100 },
    screenshot: { type: String, required: true },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    adminNotes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Payment', paymentSchema);
