const mongoose = require('mongoose');

// Individual ball details
const ballSchema = new mongoose.Schema({
    ballNumber: { type: Number, required: true }, // 1-6 for each over
    batsman: { type: String, ref: 'Player', required: true },
    bowler: { type: String, ref: 'Player', required: true },
    runs: { type: Number, default: 0 },
    extras: {
        wide: { type: Number, default: 0 },
        noBall: { type: Number, default: 0 },
        bye: { type: Number, default: 0 },
        legBye: { type: Number, default: 0 }
    },
    isWicket: { type: Boolean, default: false },
    wicketType: {
        type: String,
        enum: ['bowled', 'caught', 'lbw', 'stumped', 'runout', 'hitwicket'],
        default: null
    },
    fielder: { type: String, ref: 'Player', default: null }, // for catches/runouts
    timestamp: { type: Date, default: Date.now }
});

// Over details
const overSchema = new mongoose.Schema({
    overNumber: { type: Number, required: true },
    bowler: { type: String, ref: 'Player', required: true },
    balls: [ballSchema],
    runsScored: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    maidenOver: { type: Boolean, default: false }
});

// Innings details
const inningsSchema = new mongoose.Schema({
    battingTeam: { type: String, ref: 'Team', required: true },
    bowlingTeam: { type: String, ref: 'Team', required: true },
    totalRuns: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    overs: { type: Number, default: 0 },
    balls: { type: Number, default: 0 },
    extras: {
        wide: { type: Number, default: 0 },
        noBall: { type: Number, default: 0 },
        bye: { type: Number, default: 0 },
        legBye: { type: Number, default: 0 }
    },
    currentBatsmen: [{
        player: { type: String, ref: 'Player' },
        runs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        fours: { type: Number, default: 0 },
        sixes: { type: Number, default: 0 },
        strikeRate: { type: Number, default: 0 },
        isOnStrike: { type: Boolean, default: false }
    }],
    currentBowler: {
        player: { type: String, ref: 'Player' },
        overs: { type: Number, default: 0 },
        balls: { type: Number, default: 0 },
        runs: { type: Number, default: 0 },
        wickets: { type: Number, default: 0 },
        economy: { type: Number, default: 0 }
    },
    overs: [overSchema],
    isCompleted: { type: Boolean, default: false }
});

// Main match scoring schema
const matchScoringSchema = new mongoose.Schema({
    matchId: { type: String, ref: 'Match', required: true, unique: true },
    tossWinner: { type: String, ref: 'Team' },
    tossDecision: { type: String, enum: ['bat', 'bowl'] },
    
    // Match format
    totalOvers: { type: Number, default: 20 },
    
    // Innings
    firstInnings: inningsSchema,
    secondInnings: inningsSchema,
    
    // Current match state
    currentInnings: { type: Number, default: 1 }, // 1 or 2
    isLive: { type: Boolean, default: false },
    
    // Match result
    winner: { type: String, ref: 'Team' },
    winMargin: { type: String }, // "by 5 wickets", "by 20 runs"
    manOfTheMatch: { type: String, ref: 'Player' },
    
    // Commentary
    commentary: [{
        over: { type: Number },
        ball: { type: Number },
        text: { type: String },
        timestamp: { type: Date, default: Date.now }
    }],
    
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('MatchScoring', matchScoringSchema);