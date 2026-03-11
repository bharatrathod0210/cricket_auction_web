const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const generateId = require('../utils/generateId');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc Login admin
const loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;
        const admin = await Admin.findOne({ email });
        if (!admin) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        const isMatch = await admin.comparePassword(password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        res.json({
            success: true,
            token: generateToken(admin._id),
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Create admin (first time setup)
const createAdmin = async (req, res) => {
    try {
        const { name, email, password, upiId } = req.body;
        const exists = await Admin.findOne({ email });
        if (exists) return res.status(400).json({ success: false, message: 'Admin already exists' });
        const admin = await Admin.create({ _id: generateId(), name, email, password, upiId: upiId || '' });
        res.status(201).json({
            success: true,
            message: 'Admin created successfully',
            admin: { id: admin._id, name: admin.name, email: admin.email }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get admin profile
const getAdminProfile = async (req, res) => {
    res.json({ success: true, admin: req.admin });
};

// @desc Update UPI ID
const updateUpiId = async (req, res) => {
    try {
        const { upiId } = req.body;
        const admin = await Admin.findByIdAndUpdate(
            req.admin._id,
            { upiId },
            { new: true }
        ).select('-password');
        res.json({ success: true, message: 'UPI ID updated successfully', admin });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc Get UPI ID (public endpoint for registration page)
const getUpiId = async (req, res) => {
    try {
        const admin = await Admin.findOne().select('upiId');
        res.json({ success: true, upiId: admin?.upiId || '' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { loginAdmin, createAdmin, getAdminProfile, updateUpiId, getUpiId };
