const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    _id: { type: String, required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    type: {
        type: String,
        enum: ['info', 'warning', 'success', 'auction', 'match'],
        default: 'info'
    },
    isActive: { type: Boolean, default: true },
    isPinned: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Announcement', announcementSchema);
