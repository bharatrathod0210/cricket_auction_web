const express = require('express');
const router = express.Router();
const { 
    getLiveScoring, 
    startLiveScoring, 
    addBall, 
    updateBatsmen, 
    updateBowler 
} = require('../controllers/liveScoringController');
const { authenticateAdmin } = require('../middleware/authMiddleware');

// Public routes
router.get('/:matchId', getLiveScoring);

// Admin routes
router.post('/:matchId/start', authenticateAdmin, startLiveScoring);
router.post('/:matchId/ball', authenticateAdmin, addBall);
router.put('/:matchId/batsmen', authenticateAdmin, updateBatsmen);
router.put('/:matchId/bowler', authenticateAdmin, updateBowler);

module.exports = router;