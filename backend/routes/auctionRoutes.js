const express = require('express');
const router = express.Router();
const { getAuction, createAuction, startAuction, stopAuction, resetAuction, placeBid, sellPlayer, markUnsold, getBidHistory, movePlayerToNext, reorderQueue } = require('../controllers/auctionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', getAuction);
router.post('/', protect, createAuction);
router.put('/:id/start', protect, startAuction);
router.put('/:id/stop', protect, stopAuction);
router.put('/:id/reset', protect, resetAuction);
router.put('/:id/move-to-next', protect, movePlayerToNext);
router.put('/:id/reorder-queue', protect, reorderQueue);
router.post('/bid', protect, placeBid);
router.post('/sell', protect, sellPlayer);
router.post('/unsold', protect, markUnsold);
router.get('/:auctionId/bids', getBidHistory);

module.exports = router;
