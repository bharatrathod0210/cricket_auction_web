const express = require('express');
const router = express.Router();
const {
    getPlayers, getPlayer, registerPlayer, getRegistrations,
    approveRegistration, rejectRegistration, addPlayer, updatePlayer,
    deletePlayer, getLeaderboard, toggleIconPlayer, resetPlayersForAuction, resetSinglePlayer
} = require('../controllers/playerController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Public
router.get('/', getPlayers);
router.get('/leaderboard', getLeaderboard);
router.post('/register', 
    upload.fields([
        { name: 'playerPhoto', maxCount: 1 },
        { name: 'paymentScreenshot', maxCount: 1 }
    ]), registerPlayer
);

// Admin - must be before /:id route
router.get('/admin/registrations', protect, getRegistrations);
router.put('/admin/registrations/:id/approve', protect, approveRegistration);
router.put('/admin/registrations/:id/reject', protect, rejectRegistration);
router.put('/admin/reset-for-auction', protect, resetPlayersForAuction);
router.post('/admin/add', protect, (req, res, next) => { req.uploadFolder = 'players'; next(); }, upload.single('image'), addPlayer);
router.put('/admin/:id', protect, (req, res, next) => { req.uploadFolder = 'players'; next(); }, upload.single('image'), updatePlayer);
router.put('/admin/:id/toggle-icon', protect, toggleIconPlayer);
router.put('/admin/:id/reset', protect, resetSinglePlayer);
router.delete('/admin/:id', protect, deletePlayer);

// Public - /:id must be last
router.get('/:id', getPlayer);

module.exports = router;
