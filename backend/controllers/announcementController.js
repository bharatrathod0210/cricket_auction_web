const Announcement = require('../models/Announcement');
const generateId = require('../utils/generateId');

// @desc Get all active announcements
const getAnnouncements = async (req, res) => {
    try {
        const announcements = await Announcement.find({ isActive: true }).sort({ isPinned: -1, createdAt: -1 });
        res.json({ success: true, announcements });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Create announcement (admin)
const createAnnouncement = async (req, res) => {
    try {
        const { title, content, type, isPinned } = req.body;
        const announcement = await Announcement.create({
            _id: generateId(),
            title, content,
            type: type || 'info',
            isPinned: isPinned || false
        });
        res.status(201).json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Update announcement (admin)
const updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!announcement) return res.status(404).json({ success: false, message: 'Not found' });
        res.json({ success: true, announcement });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Delete announcement (admin)
const deleteAnnouncement = async (req, res) => {
    try {
        await Announcement.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
