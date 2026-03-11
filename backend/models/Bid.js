const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    auction: { type: String, ref: 'Auction', required: true },
    player: { type: String, ref: 'Player', required: true },
    team: { type: String, ref: 'Team', required: true },
    amount: { type: Number, required: true },
    status: {
        type: String,
        enum: ['active', 'outbid', 'won'],
        default: 'active'
    },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bid', bidSchema);
