const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true },
    mobile: { type: String, default: '' },
    email: { type: String, default: '' },
    role: {
        type: String,
        enum: ['Batsman', 'Bowler', 'All Rounder', 'Wicketkeeper'],
        required: true
    },
    basePrice: { type: Number, default: 50000 },
    soldPrice: { type: Number, default: 0 },
    team: { type: String, ref: 'Team', default: null },
    image: { type: String, default: '' },
    paymentScreenshot: { type: String, default: '' },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    auctionStatus: {
        type: String,
        enum: ['unsold', 'sold'],
        default: 'unsold'
    },
    stats: {
        matches: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        catches: { type: Number, default: 0 },
        strikeRate: { type: Number, default: 0 },
        economy: { type: Number, default: 0 },
        battingAvg: { type: Number, default: 0 }
    },
    isManualEntry: { type: Boolean, default: false },
    isIconPlayer: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Player', playerSchema);
