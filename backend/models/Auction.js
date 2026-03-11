const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, default: 'RPL Auction 2026' },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'paused', 'completed'],
        default: 'scheduled'
    },
    currentPlayer: { type: String, ref: 'Player', default: null },
    currentBasePrice: { type: Number, default: 0 },
    currentBid: { type: Number, default: 0 },
    currentBidTeam: { type: String, ref: 'Team', default: null },
    timerDuration: { type: Number, default: 30 },
    playerQueue: [{ type: String, ref: 'Player' }],
    completedPlayers: [{ type: String, ref: 'Player' }],
    logs: [{
        action: String,
        playerName: String,
        teamName: String,
        amount: Number,
        timestamp: { type: Date, default: Date.now }
    }],
    scheduledDate: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Auction', auctionSchema);
