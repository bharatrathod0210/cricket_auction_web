const Tournament = require('../models/Tournament');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Match = require('../models/Match');
const MatchScoring = require('../models/MatchScoring');

// Get tournament stats and records
const getTournamentStats = async (req, res) => {
    try {
        let tournament = await Tournament.findOne()
            .populate('playerOfTournament')
            .populate('highestScore.player')
            .populate('mostRuns.player')
            .populate('bestStrikeRate.player')
            .populate('mostSixes.player')
            .populate('mostFours.player')
            .populate('bestBowlingFigures.player')
            .populate('mostWickets.player')
            .populate('bestEconomy.player')
            .populate('mostCatches.player')
            .populate('pointsTable.team');
            
        if (!tournament) {
            // Create default tournament
            tournament = new Tournament();
            await tournament.save();
        }
        
        res.json({ tournament });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Update tournament records after each match
const updateTournamentRecords = async (matchId) => {
    try {
        const scoring = await MatchScoring.findOne({ matchId })
            .populate('firstInnings.currentBatsmen.player')
            .populate('secondInnings.currentBatsmen.player');
            
        if (!scoring) return;
        
        let tournament = await Tournament.findOne();
        if (!tournament) {
            tournament = new Tournament();
        }
        
        // Update basic stats
        tournament.completedMatches++;
        
        // Process both innings
        [scoring.firstInnings, scoring.secondInnings].forEach(innings => {
            if (!innings || !innings.isCompleted) return;
            
            tournament.totalRuns += innings.totalRuns;
            tournament.totalWickets += innings.wickets;
            
            // Check team records
            if (innings.totalRuns > tournament.highestTeamScore.runs) {
                tournament.highestTeamScore = {
                    runs: innings.totalRuns,
                    team: innings.battingTeam,
                    match: matchId
                };
            }
            
            if (innings.totalRuns < tournament.lowestTeamScore.runs) {
                tournament.lowestTeamScore = {
                    runs: innings.totalRuns,
                    team: innings.battingTeam,
                    match: matchId
                };
            }
            
            // Process batsmen stats
            innings.currentBatsmen.forEach(batsman => {
                tournament.totalFours += batsman.fours;
                tournament.totalSixes += batsman.sixes;
                
                // Check individual records
                if (batsman.runs > tournament.highestScore.runs) {
                    tournament.highestScore = {
                        runs: batsman.runs,
                        player: batsman.player._id,
                        match: matchId
                    };
                }
            });
        });
        
        await tournament.save();
        return tournament;
    } catch (error) {
        console.error('Error updating tournament records:', error);
    }
};

// Get player statistics
const getPlayerStats = async (req, res) => {
    try {
        const players = await Player.find({ team: { $ne: null } })
            .populate('team')
            .sort({ 'stats.runs': -1 });
            
        // Calculate additional stats from match scoring
        const playerStats = await Promise.all(players.map(async (player) => {
            const matchScorings = await MatchScoring.find({
                $or: [
                    { 'firstInnings.currentBatsmen.player': player._id },
                    { 'secondInnings.currentBatsmen.player': player._id }
                ]
            });
            
            let totalRuns = 0, totalBalls = 0, totalFours = 0, totalSixes = 0;
            let totalWickets = 0, totalRunsConceded = 0, totalBallsBowled = 0;
            let totalCatches = 0, matchesPlayed = 0;
            
            matchScorings.forEach(scoring => {
                [scoring.firstInnings, scoring.secondInnings].forEach(innings => {
                    if (!innings) return;
                    
                    // Batting stats
                    const batsmanStats = innings.currentBatsmen.find(b => 
                        b.player && b.player.toString() === player._id.toString()
                    );
                    if (batsmanStats) {
                        totalRuns += batsmanStats.runs;
                        totalBalls += batsmanStats.balls;
                        totalFours += batsmanStats.fours;
                        totalSixes += batsmanStats.sixes;
                        matchesPlayed++;
                    }
                    
                    // Bowling stats
                    if (innings.currentBowler.player && 
                        innings.currentBowler.player.toString() === player._id.toString()) {
                        totalWickets += innings.currentBowler.wickets;
                        totalRunsConceded += innings.currentBowler.runs;
                        totalBallsBowled += innings.currentBowler.balls;
                    }
                });
            });
            
            return {
                ...player.toObject(),
                detailedStats: {
                    matches: matchesPlayed,
                    runs: totalRuns,
                    balls: totalBalls,
                    fours: totalFours,
                    sixes: totalSixes,
                    strikeRate: totalBalls > 0 ? (totalRuns / totalBalls * 100).toFixed(2) : 0,
                    average: matchesPlayed > 0 ? (totalRuns / matchesPlayed).toFixed(2) : 0,
                    wickets: totalWickets,
                    runsConceded: totalRunsConceded,
                    ballsBowled: totalBallsBowled,
                    economy: totalBallsBowled > 0 ? (totalRunsConceded / (totalBallsBowled / 6)).toFixed(2) : 0,
                    catches: totalCatches
                }
            };
        }));
        
        res.json({ players: playerStats });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getTournamentStats,
    updateTournamentRecords,
    getPlayerStats
};