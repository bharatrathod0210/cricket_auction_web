const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Player = require('../models/Player');
const Team = require('../models/Team');
const generateId = require('../utils/generateId');

// @desc Get current auction
const getAuction = async (req, res) => {
    try {
        const auction = await Auction.findOne().sort({ createdAt: -1 })
            .populate('currentPlayer', 'name role basePrice image isIconPlayer')
            .populate('currentBidTeam', 'name logo')
            .populate('playerQueue', 'name role basePrice image isIconPlayer')
            .populate('completedPlayers', 'name role soldPrice team');
        
        res.json({ success: true, auction });
    } catch (error) {
        console.error('Get auction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Create auction (admin)
const createAuction = async (req, res) => {
    try {
        const { name, scheduledDate, timerDuration } = req.body;
        
        // Check if there's already an active auction
        const existingAuction = await Auction.findOne({ status: { $in: ['scheduled', 'live'] } });
        if (existingAuction) {
            return res.status(400).json({ 
                success: false, 
                message: 'An auction is already active. Please complete or stop it first.' 
            });
        }
        
        // Get upcoming and unsold players
        const players = await Player.find({ 
            approvalStatus: 'approved', 
            auctionStatus: 'unsold'
        }).select('_id name');
        
        console.log(`Creating auction with ${players.length} players:`, players.map(p => p.name));
        
        const auction = await Auction.create({
            _id: generateId(),
            name: name || 'RPL Auction 2026',
            scheduledDate: scheduledDate || null,
            timerDuration: timerDuration || 30,
            playerQueue: players.map(p => p._id)
        });
        res.status(201).json({ success: true, auction });
    } catch (error) {
        console.error('Create auction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Start auction (admin)
const startAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        
        // Refresh player queue with all approved upcoming and unsold players
        const players = await Player.find({ 
            approvalStatus: 'approved', 
            auctionStatus: 'unsold'
        }).select('_id name role basePrice');
        
        console.log(`Found ${players.length} players for auction:`, players.map(p => p.name));
        
        if (players.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'No players available for auction. Please approve players or reset player status.' 
            });
        }
        
        auction.playerQueue = players.map(p => p._id);
        auction.status = 'live';
        auction.currentPlayer = auction.playerQueue[0];
        
        const firstPlayer = players[0];
        auction.currentBasePrice = firstPlayer.basePrice;
        auction.currentBid = firstPlayer.basePrice;
        auction.currentBidTeam = null;
        auction.updatedAt = Date.now();
        
        await auction.save();
        
        // Populate and return
        const populatedAuction = await Auction.findById(auction._id)
            .populate('currentPlayer', 'name role basePrice image isIconPlayer')
            .populate('currentBidTeam', 'name logo')
            .populate('playerQueue', 'name role basePrice image isIconPlayer');
        
        res.json({ success: true, auction: populatedAuction });
    } catch (error) {
        console.error('Start auction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Place bid (admin on behalf of team)
const placeBid = async (req, res) => {
    try {
        const { auctionId, teamId, amount } = req.body;
        const auction = await Auction.findById(auctionId);
        if (!auction || auction.status !== 'live') {
            return res.status(400).json({ success: false, message: 'Auction not live' });
        }
        if (amount <= auction.currentBid) {
            return res.status(400).json({ success: false, message: 'Bid must be higher than current bid' });
        }
        const team = await Team.findById(teamId);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        const remaining = team.purse - team.purseSpent;
        if (amount > remaining) {
            return res.status(400).json({ success: false, message: 'Insufficient purse' });
        }

        // Mark previous bids as outbid
        await Bid.updateMany({ auction: auctionId, player: auction.currentPlayer, status: 'active' }, { status: 'outbid' });

        const bid = await Bid.create({
            _id: generateId(),
            auction: auctionId,
            player: auction.currentPlayer,
            team: teamId,
            amount
        });

        auction.currentBid = amount;
        auction.currentBidTeam = teamId;
        await auction.save();

        res.json({ success: true, bid, currentBid: auction.currentBid });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Sell player (admin)
const sellPlayer = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

        const player = await Player.findById(auction.currentPlayer);
        const team = await Team.findById(auction.currentBidTeam);

        if (!player || !team) {
            return res.status(400).json({ success: false, message: 'Player or Team not found' });
        }

        // Update player
        player.team = team._id;
        player.soldPrice = auction.currentBid;
        player.auctionStatus = 'sold';
        await player.save();

        // Update team
        team.players.push(player._id);
        team.purseSpent += auction.currentBid;
        await team.save();

        // Update winning bid
        await Bid.updateMany(
            { auction: auctionId, player: player._id, status: 'active' },
            { status: 'won' }
        );

        // Log
        auction.logs.push({
            action: 'SOLD',
            playerName: player.name,
            teamName: team.name,
            amount: auction.currentBid
        });

        // Move to next player
        auction.completedPlayers.push(player._id);
        auction.playerQueue = auction.playerQueue.filter(p => p.toString() !== player._id.toString());

        if (auction.playerQueue.length > 0) {
            auction.currentPlayer = auction.playerQueue[0];
            const nextPlayer = await Player.findById(auction.playerQueue[0]);
            auction.currentBasePrice = nextPlayer ? nextPlayer.basePrice : 0;
            auction.currentBid = nextPlayer ? nextPlayer.basePrice : 0;
            auction.currentBidTeam = null;
        } else {
            auction.status = 'completed';
            auction.currentPlayer = null;
        }

        await auction.save();
        res.json({ success: true, message: `${player.name} sold to ${team.name} for ₹${auction.currentBid}`, auction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Mark unsold (admin)
const markUnsold = async (req, res) => {
    try {
        const { auctionId } = req.body;
        const auction = await Auction.findById(auctionId);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });

        const player = await Player.findById(auction.currentPlayer);
        if (player) {
            player.auctionStatus = 'unsold';
            await player.save();
            auction.logs.push({ action: 'UNSOLD', playerName: player.name, teamName: '', amount: 0 });
        }

        auction.completedPlayers.push(auction.currentPlayer);
        auction.playerQueue = auction.playerQueue.filter(p => p.toString() !== auction.currentPlayer.toString());

        if (auction.playerQueue.length > 0) {
            auction.currentPlayer = auction.playerQueue[0];
            const nextPlayer = await Player.findById(auction.playerQueue[0]);
            auction.currentBasePrice = nextPlayer ? nextPlayer.basePrice : 0;
            auction.currentBid = nextPlayer ? nextPlayer.basePrice : 0;
            auction.currentBidTeam = null;
        } else {
            auction.status = 'completed';
            auction.currentPlayer = null;
        }

        await auction.save();
        res.json({ success: true, message: 'Player marked as unsold', auction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Stop auction (admin)
const stopAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        
        if (auction.status !== 'live') {
            return res.status(400).json({ success: false, message: 'Auction is not live' });
        }

        // Mark current player as unsold if there's one in progress
        if (auction.currentPlayer) {
            const player = await Player.findById(auction.currentPlayer);
            if (player && player.auctionStatus !== 'sold') {
                player.auctionStatus = 'unsold';
                await player.save();
                auction.logs.push({
                    action: 'UNSOLD',
                    playerName: player.name,
                    teamName: '',
                    amount: 0
                });
            }
        }

        // Mark all remaining players in queue as unsold
        if (auction.playerQueue && auction.playerQueue.length > 0) {
            await Player.updateMany(
                { _id: { $in: auction.playerQueue }, auctionStatus: { $ne: 'sold' } },
                { auctionStatus: 'unsold' }
            );
        }

        // Update auction status
        auction.status = 'completed';
        auction.currentPlayer = null;
        auction.currentBid = 0;
        auction.currentBidTeam = null;
        auction.playerQueue = [];
        auction.updatedAt = Date.now();
        
        auction.logs.push({
            action: 'STOPPED',
            playerName: 'Auction',
            teamName: 'Admin',
            amount: 0
        });

        await auction.save();

        res.json({ 
            success: true, 
            message: 'Auction stopped successfully. All remaining players marked as unsold.', 
            auction 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Reset auction to restart (admin)
const resetAuction = async (req, res) => {
    try {
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        
        // Get all approved upcoming and unsold players
        const players = await Player.find({ 
            approvalStatus: 'approved', 
            auctionStatus: 'unsold'
        }).select('_id');
        
        console.log(`Resetting auction with ${players.length} players`);
        
        // Reset auction to scheduled state
        auction.status = 'scheduled';
        auction.currentPlayer = null;
        auction.currentBid = 0;
        auction.currentBidTeam = null;
        auction.currentBasePrice = 0;
        auction.playerQueue = players.map(p => p._id);
        auction.completedPlayers = [];
        auction.logs = [];
        auction.updatedAt = Date.now();
        
        await auction.save();
        
        res.json({ 
            success: true, 
            message: `Auction reset successfully with ${players.length} players ready (upcoming + unsold).`, 
            auction 
        });
    } catch (error) {
        console.error('Reset auction error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get bid history
const getBidHistory = async (req, res) => {
    try {
        const bids = await Bid.find({ auction: req.params.auctionId })
            .populate('player', 'name role')
            .populate('team', 'name logo')
            .sort({ createdAt: -1 });
        res.json({ success: true, bids });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Move player to next in queue (admin)
const movePlayerToNext = async (req, res) => {
    try {
        const { playerId } = req.body;
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        
        // Find player in queue
        const playerIndex = auction.playerQueue.findIndex(p => p.toString() === playerId);
        if (playerIndex === -1) {
            return res.status(400).json({ success: false, message: 'Player not in queue' });
        }
        
        // If already current player, do nothing
        if (playerIndex === 0) {
            return res.status(400).json({ success: false, message: 'Player is already next' });
        }
        
        // Move player to position 1 (after current player)
        const [player] = auction.playerQueue.splice(playerIndex, 1);
        auction.playerQueue.splice(1, 0, player);
        
        await auction.save();
        
        const populatedAuction = await Auction.findById(auction._id)
            .populate('playerQueue', 'name role basePrice image isIconPlayer');
        
        res.json({ success: true, message: 'Player moved to next position', auction: populatedAuction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Reorder player queue (admin)
const reorderQueue = async (req, res) => {
    try {
        const { playerQueue } = req.body; // Array of player IDs in new order
        const auction = await Auction.findById(req.params.id);
        if (!auction) return res.status(404).json({ success: false, message: 'Auction not found' });
        
        auction.playerQueue = playerQueue;
        await auction.save();
        
        const populatedAuction = await Auction.findById(auction._id)
            .populate('playerQueue', 'name role basePrice image isIconPlayer');
        
        res.json({ success: true, message: 'Queue reordered', auction: populatedAuction });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAuction, createAuction, startAuction, stopAuction, resetAuction, placeBid, sellPlayer, markUnsold, getBidHistory, movePlayerToNext, reorderQueue };
