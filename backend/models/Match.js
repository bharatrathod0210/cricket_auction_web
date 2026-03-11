const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    title: { type: String, default: '' },
    team1: { type: String, ref: 'Team', required: true },
    team2: { type: String, ref: 'Team', required: true },
    team1Name: { type: String, default: '' },
    team2Name: { type: String, default: '' },
    team1Score: { type: String, default: '' },
    team2Score: { type: String, default: '' },
    venue: { type: String, default: 'Rajivnagar Ground' },
    date: { type: Date, required: true },
    time: { type: String, default: '' },
    status: {
        type: String,
        enum: ['upcoming', 'live', 'completed', 'cancelled'],
        default: 'upcoming'
    },
    result: { type: String, default: '' },
    winner: { type: String, ref: 'Team', default: null },
    matchNumber: { type: Number, default: 1 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Match', matchSchema);
