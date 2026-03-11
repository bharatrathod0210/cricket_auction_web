const express = require('express');
const router = express.Router();
const { getMatches, getMatch, createMatch, updateMatch, deleteMatch } = require('../controllers/matchController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getMatches);
router.get('/:id', getMatch);
router.post('/', protect, createMatch);
router.put('/:id', protect, updateMatch);
router.delete('/:id', protect, deleteMatch);

module.exports = router;
