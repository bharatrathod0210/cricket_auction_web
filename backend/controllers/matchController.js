const Match = require('../models/Match');
const generateId = require('../utils/generateId');

// @desc Get all matches
const getMatches = async (req, res) => {
    try {
        const { status } = req.query;
        let filter = {};
        if (status) filter.status = status;
        const matches = await Match.find(filter)
            .populate('team1', 'name logo color shortName')
            .populate('team2', 'name logo color shortName')
            .populate('winner', 'name logo')
            .sort({ date: 1 });
        res.json({ success: true, matches });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get single match
const getMatch = async (req, res) => {
    try {
        const match = await Match.findById(req.params.id)
            .populate('team1', 'name logo color')
            .populate('team2', 'name logo color')
            .populate('winner', 'name logo');
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        res.json({ success: true, match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Create match (admin)
const createMatch = async (req, res) => {
    try {
        const { team1, team2, venue, date, time, matchNumber, team1Name, team2Name } = req.body;
        const match = await Match.create({
            _id: generateId(),
            team1, team2, venue, date, time,
            matchNumber: matchNumber || 1,
            team1Name, team2Name,
            title: `Match ${matchNumber || 1}`
        });
        res.status(201).json({ success: true, match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update match (admin)
const updateMatch = async (req, res) => {
    try {
        const match = await Match.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!match) return res.status(404).json({ success: false, message: 'Match not found' });
        res.json({ success: true, match });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Delete match (admin)
const deleteMatch = async (req, res) => {
    try {
        await Match.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Match deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getMatches, getMatch, createMatch, updateMatch, deleteMatch };
