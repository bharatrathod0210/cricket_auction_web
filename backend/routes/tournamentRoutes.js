const express = require('express');
const router = express.Router();
const { 
    getTournamentStats, 
    getPlayerStats 
} = require('../controllers/tournamentController');

// Public routes
router.get('/stats', getTournamentStats);
router.get('/players', getPlayerStats);

module.exports = router;