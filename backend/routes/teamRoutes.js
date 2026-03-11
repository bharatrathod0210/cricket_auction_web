const express = require('express');
const router = express.Router();
const { getTeams, getTeam, createTeam, updateTeam, deleteTeam } = require('../controllers/teamController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/', getTeams);
router.get('/:id', getTeam);
router.post('/', protect, (req, res, next) => { req.uploadFolder = 'teams'; next(); }, upload.single('logo'), createTeam);
router.put('/:id', protect, (req, res, next) => { req.uploadFolder = 'teams'; next(); }, upload.single('logo'), updateTeam);
router.delete('/:id', protect, deleteTeam);

module.exports = router;
