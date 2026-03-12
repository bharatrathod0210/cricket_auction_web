const Team = require('../models/Team');
const Player = require('../models/Player');
const generateId = require('../utils/generateId');

// @desc Get all teams
const getTeams = async (req, res) => {
    try {
        const teams = await Team.find().populate('players', 'name role image');
        res.json({ success: true, teams });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get single team
const getTeam = async (req, res) => {
    try {
        const team = await Team.findById(req.params.id).populate('players');
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Create team (admin)
const createTeam = async (req, res) => {
    try {
        const { name, captainName, purse, color, description } = req.body;
        const logo = req.file ? req.file.path : ''; // Cloudinary URL
        
        // Auto-generate shortName from team name (first letters of each word, max 4 chars)
        const shortName = name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 4);
        
        const team = await Team.create({
            _id: generateId(),
            name,
            shortName,
            captainName: captainName || '',
            purse: purse || 10000000,
            color: color || '#ffffff',
            description: description || '',
            logo
        });
        res.status(201).json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update team (admin)
const updateTeam = async (req, res) => {
    try {
        const { name, captainName, purse, color, description } = req.body;
        
        // Auto-generate shortName from team name if name is being updated
        const shortName = name ? name.split(' ').map(w => w.charAt(0)).join('').toUpperCase().slice(0, 4) : undefined;
        
        const updateData = { name, captainName, purse, color, description, updatedAt: Date.now() };
        if (shortName) updateData.shortName = shortName;
        if (req.file) updateData.logo = req.file.path; // Cloudinary URL
        
        const team = await Team.findByIdAndUpdate(req.params.id, updateData, { new: true });
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        res.json({ success: true, team });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Delete team (admin)
const deleteTeam = async (req, res) => {
    try {
        const team = await Team.findByIdAndDelete(req.params.id);
        if (!team) return res.status(404).json({ success: false, message: 'Team not found' });
        await Player.updateMany({ team: req.params.id }, { team: null, auctionStatus: 'unsold' });
        res.json({ success: true, message: 'Team deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTeams, getTeam, createTeam, updateTeam, deleteTeam };
