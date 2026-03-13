const MatchScoring = require('../models/MatchScoring');
const Match = require('../models/Match');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Tournament = require('../models/Tournament');

// Get live scoring for a match
const getLiveScoring = async (req, res) => {
    try {
        const { matchId } = req.params;
        
        const scoring = await MatchScoring.findOne({ matchId })
            .populate('firstInnings.battingTeam firstInnings.bowlingTeam')
            .populate('secondInnings.battingTeam secondInnings.bowlingTeam')
            .populate('firstInnings.currentBatsmen.player')
            .populate('secondInnings.currentBatsmen.player')
            .populate('firstInnings.currentBowler.player')
            .populate('secondInnings.currentBowler.player')
            .populate('manOfTheMatch')
            .populate('winner');
            
        if (!scoring) {
            return res.status(404).json({ message: 'Live scoring not found' });
        }
        
        res.json({ scoring });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Start live scoring for a match
const startLiveScoring = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { tossWinner, tossDecision, battingTeam, bowlingTeam } = req.body;
        
        // Check if scoring already exists
        let scoring = await MatchScoring.findOne({ matchId });
        
        if (scoring) {
            scoring.isLive = true;
            await scoring.save();
            return res.json({ message: 'Live scoring resumed', scoring });
        }
        
        // Create new scoring
        scoring = new MatchScoring({
            matchId,
            tossWinner,
            tossDecision,
            isLive: true,
            firstInnings: {
                battingTeam,
                bowlingTeam,
                currentBatsmen: [],
                overs: []
            }
        });
        
        await scoring.save();
        
        // Update match status
        await Match.findByIdAndUpdate(matchId, { status: 'live' });
        
        res.json({ message: 'Live scoring started', scoring });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// Add ball to current over
const addBall = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { 
            batsman, 
            bowler, 
            runs, 
            extras = {}, 
            isWicket = false, 
            wicketType, 
            fielder,
            commentary 
        } = req.body;
        
        const scoring = await MatchScoring.findOne({ matchId });
        if (!scoring || !scoring.isLive) {
            return res.status(404).json({ message: 'Live scoring not found or not active' });
        }
        
        const currentInnings = scoring.currentInnings === 1 ? scoring.firstInnings : scoring.secondInnings;
        
        // Get current over or create new one
        let currentOver = currentInnings.overs[currentInnings.overs.length - 1];
        if (!currentOver || currentOver.balls.length >= 6) {
            currentOver = {
                overNumber: currentInnings.overs.length + 1,
                bowler,
                balls: [],
                runsScored: 0,
                wickets: 0
            };
            currentInnings.overs.push(currentOver);
        }
        
        // Create ball
        const ball = {
            ballNumber: currentOver.balls.length + 1,
            batsman,
            bowler,
            runs,
            extras,
            isWicket,
            wicketType,
            fielder
        };
        
        currentOver.balls.push(ball);
        
        // Update over stats
        const totalRuns = runs + (extras.wide || 0) + (extras.noBall || 0) + (extras.bye || 0) + (extras.legBye || 0);
        currentOver.runsScored += totalRuns;
        if (isWicket) currentOver.wickets++;
        
        // Update innings stats
        currentInnings.totalRuns += totalRuns;
        if (isWicket) currentInnings.wickets++;
        
        // Update balls count (only if not wide or no-ball)
        if (!extras.wide && !extras.noBall) {
            currentInnings.balls++;
            currentInnings.overs = Math.floor(currentInnings.balls / 6);
        }
        
        // Update batsman stats
        const batsmanIndex = currentInnings.currentBatsmen.findIndex(b => b.player.toString() === batsman);
        if (batsmanIndex !== -1) {
            currentInnings.currentBatsmen[batsmanIndex].runs += runs;
            if (!extras.wide && !extras.noBall) {
                currentInnings.currentBatsmen[batsmanIndex].balls++;
            }
            if (runs === 4) currentInnings.currentBatsmen[batsmanIndex].fours++;
            if (runs === 6) currentInnings.currentBatsmen[batsmanIndex].sixes++;
            
            // Calculate strike rate
            const batsman = currentInnings.currentBatsmen[batsmanIndex];
            batsman.strikeRate = batsman.balls > 0 ? (batsman.runs / batsman.balls * 100) : 0;
        }
        
        // Update bowler stats
        if (currentInnings.currentBowler.player.toString() === bowler) {
            currentInnings.currentBowler.runs += totalRuns;
            if (isWicket) currentInnings.currentBowler.wickets++;
            if (!extras.wide && !extras.noBall) {
                currentInnings.currentBowler.balls++;
                currentInnings.currentBowler.overs = currentInnings.currentBowler.balls / 6;
            }
            
            // Calculate economy
            if (currentInnings.currentBowler.overs > 0) {
                currentInnings.currentBowler.economy = currentInnings.currentBowler.runs / currentInnings.currentBowler.overs;
            }
        }
        
        // Add commentary
        if (commentary) {
            scoring.commentary.push({
                over: currentOver.overNumber,
                ball: ball.ballNumber,
                text: commentary
            });
        }
        
        scoring.updatedAt = new Date();
        await scoring.save();
        
        res.json({ message: 'Ball added successfully', scoring });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update batsmen
const updateBatsmen = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { batsmen } = req.body; // Array of batsman objects
        
        const scoring = await MatchScoring.findOne({ matchId });
        if (!scoring) {
            return res.status(404).json({ message: 'Live scoring not found' });
        }
        
        const currentInnings = scoring.currentInnings === 1 ? scoring.firstInnings : scoring.secondInnings;
        currentInnings.currentBatsmen = batsmen;
        
        await scoring.save();
        res.json({ message: 'Batsmen updated successfully', scoring });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update bowler
const updateBowler = async (req, res) => {
    try {
        const { matchId } = req.params;
        const { bowler } = req.body;
        
        const scoring = await MatchScoring.findOne({ matchId });
        if (!scoring) {
            return res.status(404).json({ message: 'Live scoring not found' });
        }
        
        const currentInnings = scoring.currentInnings === 1 ? scoring.firstInnings : scoring.secondInnings;
        currentInnings.currentBowler = {
            player: bowler,
            overs: 0,
            balls: 0,
            runs: 0,
            wickets: 0,
            economy: 0
        };
        
        await scoring.save();
        res.json({ message: 'Bowler updated successfully', scoring });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getLiveScoring,
    startLiveScoring,
    addBall,
    updateBatsmen,
    updateBowler
};