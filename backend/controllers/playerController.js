const Player = require('../models/Player');
const PlayerRegistration = require('../models/PlayerRegistration');
const Payment = require('../models/Payment');
const Team = require('../models/Team');
const generateId = require('../utils/generateId');

// @desc Get all approved players
const getPlayers = async (req, res) => {
    try {
        const { role, team, auctionStatus, search } = req.query;
        let filter = { approvalStatus: 'approved' };
        if (role) filter.role = role;
        if (team) filter.team = team;
        if (auctionStatus) filter.auctionStatus = auctionStatus;
        if (search) filter.name = { $regex: search, $options: 'i' };
        const players = await Player.find(filter).populate('team', 'name logo color');
        res.json({ success: true, players });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get single player
const getPlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id).populate('team', 'name logo color');
        if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
        res.json({ success: true, player });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Register player (public)
const registerPlayer = async (req, res) => {
    try {
        const { fullName, mobile, role } = req.body;
        
        // Quick validation
        if (!fullName || !mobile || !role) {
            return res.status(400).json({ 
                success: false, 
                message: 'All fields are required (fullName, mobile, role)' 
            });
        }

        // Check payment screenshot
        if (!req.files || !req.files.paymentScreenshot || req.files.paymentScreenshot.length === 0) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment screenshot is required' 
            });
        }

        // Get file paths quickly
        const playerPhoto = req.files?.playerPhoto?.[0]?.path || req.files?.playerPhoto?.[0]?.filename || '';
        const paymentScreenshot = req.files?.paymentScreenshot?.[0]?.path || req.files?.paymentScreenshot?.[0]?.filename || '';

        if (!paymentScreenshot) {
            return res.status(400).json({ 
                success: false, 
                message: 'Payment screenshot upload failed. Please try again.' 
            });
        }

        // Generate IDs
        const regId = generateId();
        const paymentId = generateId();
        
        // Create both records in parallel for speed
        const [registration] = await Promise.all([
            PlayerRegistration.create({
                _id: regId,
                fullName,
                mobile,
                email: '',
                role,
                basePrice: 50000,
                playerPhoto,
                paymentScreenshot,
            }),
            Payment.create({
                _id: paymentId,
                registration: regId,
                playerName: fullName,
                amount: 100,
                screenshot: paymentScreenshot,
            })
        ]);

        // Send quick response
        res.status(201).json({ 
            success: true, 
            message: 'Registration submitted successfully!', 
            registration: {
                id: registration._id,
                fullName: registration.fullName,
                role: registration.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        
        // Quick error response
        let errorMessage = 'Registration failed. Please try again.';
        
        if (error.name === 'ValidationError') {
            errorMessage = 'Invalid data provided.';
        } else if (error.code === 11000) {
            errorMessage = 'Mobile number already registered.';
        }
        
        res.status(500).json({ 
            success: false, 
            message: errorMessage
        });
    }
};

// @desc Get all registrations (admin)
const getRegistrations = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) filter.registrationStatus = status;
        const registrations = await PlayerRegistration.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, registrations });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Approve registration (admin)
const approveRegistration = async (req, res) => {
    try {
        const reg = await PlayerRegistration.findById(req.params.id);
        if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
        reg.registrationStatus = 'approved';
        reg.paymentStatus = 'approved';
        await reg.save();

        // Create player entry
        const player = await Player.create({
            _id: generateId(),
            name: reg.fullName,
            mobile: reg.mobile,
            email: reg.email || '',
            role: reg.role,
            basePrice: reg.basePrice,
            image: reg.playerPhoto,
            paymentScreenshot: reg.paymentScreenshot,
            approvalStatus: 'approved',
            auctionStatus: 'unsold'
        });

        await Payment.findOneAndUpdate({ registration: reg._id }, { status: 'approved' });

        res.json({ success: true, message: 'Player approved and added', player });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Reject registration (admin)
const rejectRegistration = async (req, res) => {
    try {
        const reg = await PlayerRegistration.findByIdAndUpdate(
            req.params.id,
            { registrationStatus: 'rejected', paymentStatus: 'rejected' },
            { new: true }
        );
        await Payment.findOneAndUpdate({ registration: req.params.id }, { status: 'rejected' });
        res.json({ success: true, message: 'Registration rejected', registration: reg });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Admin: add player manually
const addPlayer = async (req, res) => {
    try {
        const { name, mobile, email, role, basePrice } = req.body;
        const image = req.file ? req.file.path : ''; // Cloudinary URL
        const player = await Player.create({
            _id: generateId(),
            name,
            mobile: mobile || '',
            email: email || '',
            role,
            basePrice: Number(basePrice),
            image,
            approvalStatus: 'approved',
            auctionStatus: 'unsold',
            isManualEntry: true
        });
        res.status(201).json({ success: true, player });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update player (admin)
const updatePlayer = async (req, res) => {
    try {
        const updateData = { ...req.body, updatedAt: Date.now() };
        if (req.file) updateData.image = req.file.path; // Cloudinary URL
        const player = await Player.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
        res.json({ success: true, player });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Delete player (admin)
const deletePlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
        if (player.team) {
            await Team.findByIdAndUpdate(player.team, {
                $pull: { players: player._id },
                $inc: { purseSpent: -player.soldPrice }
            });
        }
        await Player.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Player deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get leaderboard - top scorers and wicket takers
const getLeaderboard = async (req, res) => {
    try {
        const topScorers = await Player.find({ approvalStatus: 'approved' })
            .sort({ 'stats.runs': -1 }).limit(10).populate('team', 'name logo');
        const topWicketTakers = await Player.find({ approvalStatus: 'approved' })
            .sort({ 'stats.wickets': -1 }).limit(10).populate('team', 'name logo');
        res.json({ success: true, topScorers, topWicketTakers });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Toggle icon player status (admin)
const toggleIconPlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
        player.isIconPlayer = !player.isIconPlayer;
        player.updatedAt = Date.now();
        await player.save();
        res.json({ success: true, message: `Player ${player.isIconPlayer ? 'marked' : 'unmarked'} as icon player`, player });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Reset all players to unsold status (admin)
const resetPlayersForAuction = async (req, res) => {
    try {
        const result = await Player.updateMany(
            { approvalStatus: 'approved' },
            { 
                auctionStatus: 'unsold',
                team: null,
                soldPrice: 0
            }
        );
        
        // Also reset team purse spent
        await Team.updateMany({}, { purseSpent: 0, players: [] });
        
        res.json({ success: true, message: `${result.modifiedCount} players reset to upcoming status`, count: result.modifiedCount });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Reset single player (admin)
const resetSinglePlayer = async (req, res) => {
    try {
        const player = await Player.findById(req.params.id);
        if (!player) return res.status(404).json({ success: false, message: 'Player not found' });
        
        // If player was sold, refund the amount to team
        if (player.team && player.soldPrice > 0) {
            await Team.findByIdAndUpdate(player.team, {
                $inc: { purseSpent: -player.soldPrice },
                $pull: { players: player._id }
            });
        }
        
        // Reset player to unsold status
        player.auctionStatus = 'unsold';
        player.team = null;
        player.soldPrice = 0;
        player.updatedAt = Date.now();
        await player.save();
        
        res.json({ success: true, message: `${player.name} reset to unsold status`, player });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    getPlayers, getPlayer, registerPlayer, getRegistrations, approveRegistration,
    rejectRegistration, addPlayer, updatePlayer, deletePlayer, getLeaderboard, toggleIconPlayer, resetPlayersForAuction, resetSinglePlayer
};
