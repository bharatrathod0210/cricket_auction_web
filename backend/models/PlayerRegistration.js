const mongoose = require('mongoose');

const playerRegistrationSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    fullName: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, default: '' },
    role: {
        type: String,
        enum: ['Batsman', 'Bowler', 'All Rounder', 'Wicketkeeper'],
        required: true
    },
    basePrice: { type: Number, required: true },
    playerPhoto: { type: String, default: '' },
    paymentScreenshot: { type: String, required: true },
    paymentStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    registrationStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    notes: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('PlayerRegistration', playerRegistrationSchema);
