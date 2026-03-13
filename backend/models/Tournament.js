const mongoose = require('mongoose');

// Tournament statistics and awards
const tournamentSchema = new mongoose.Schema({
    name: { type: String, default: 'RPL 2026' },
    season: { type: String, default: '2026' },
    
    // Tournament status
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'completed'],
        default: 'upcoming'
    },
    
    // Tournament stats
    totalMatches: { type: Number, default: 0 },
    completedMatches: { type: Number, default: 0 },
    totalRuns: { type: Number, default: 0 },
    totalWickets: { type: Number, default: 0 },
    totalSixes: { type: Number, default: 0 },
    totalFours: { type: Number, default: 0 },
    
    // Awards and records
    playerOfTournament: { type: String, ref: 'Player' },
    
    // Batting records
    highestScore: {
        runs: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' },
        match: { type: String, ref: 'Match' }
    },
    
    mostRuns: {
        runs: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' }
    },
    
    bestStrikeRate: {
        strikeRate: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' },
        minBalls: { type: Number, default: 30 } // minimum balls faced
    },
    
    mostSixes: {
        sixes: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' }
    },
    
    mostFours: {
        fours: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' }
    },
    
    // Bowling records
    bestBowlingFigures: {
        wickets: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' },
        match: { type: String, ref: 'Match' }
    },
    
    mostWickets: {
        wickets: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' }
    },
    
    bestEconomy: {
        economy: { type: Number, default: 999 },
        player: { type: String, ref: 'Player' },
        minOvers: { type: Number, default: 10 } // minimum overs bowled
    },
    
    // Fielding records
    mostCatches: {
        catches: { type: Number, default: 0 },
        player: { type: String, ref: 'Player' }
    },
    
    // Team records
    highestTeamScore: {
        runs: { type: Number, default: 0 },
        team: { type: String, ref: 'Team' },
        match: { type: String, ref: 'Match' }
    },
    
    lowestTeamScore: {
        runs: { type: Number, default: 999 },
        team: { type: String, ref: 'Team' },
        match: { type: String, ref: 'Match' }
    },
    
    // Points table
    pointsTable: [{
        team: { type: String, ref: 'Team' },
        matches: { type: Number, default: 0 },
        wins: { type: Number, default: 0 },
        losses: { type: Number, default: 0 },
        points: { type: Number, default: 0 },
        netRunRate: { type: Number, default: 0 },
        runsFor: { type: Number, default: 0 },
        runsAgainst: { type: Number, default: 0 },
        oversFor: { type: Number, default: 0 },
        oversAgainst: { type: Number, default: 0 }
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Tournament', tournamentSchema);