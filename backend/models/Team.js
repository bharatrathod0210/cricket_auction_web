const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    name: { type: String, required: true, unique: true },
    shortName: { type: String, default: '' },
    logo: { type: String, default: '' },
    captain: { type: String, ref: 'Player', default: null },
    captainName: { type: String, default: '' },
    purse: { type: Number, default: 5000000 },
    purseSpent: { type: Number, default: 0 },
    color: { type: String, default: '#ffffff' },
    description: { type: String, default: '' },
    players: [{ type: String, ref: 'Player' }],
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

teamSchema.virtual('purseRemaining').get(function () {
    return this.purse - this.purseSpent;
});

module.exports = mongoose.model('Team', teamSchema);
