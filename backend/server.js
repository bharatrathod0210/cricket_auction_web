const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://rpl-sihor.vercel.app',
        'https://rpl-sihor-backend.vercel.app',
        /\.vercel\.app$/
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Dashboard stats route
const Team = require('./models/Team');
const Player = require('./models/Player');
const PlayerRegistration = require('./models/PlayerRegistration');
const Payment = require('./models/Payment');
const Auction = require('./models/Auction');
const Match = require('./models/Match');

app.get('/api/dashboard/stats', async (req, res) => {
    try {
        const [
            totalTeams,
            totalPlayers,
            pendingRegistrations,
            soldPlayers,
            unsoldPlayers,
            upcomingMatches,
            liveMatches,
            pendingPayments,
            approvedPayments,
            auction
        ] = await Promise.all([
            Team.countDocuments(),
            Player.countDocuments({ approvalStatus: 'approved' }),
            PlayerRegistration.countDocuments({ registrationStatus: 'pending' }),
            Player.countDocuments({ auctionStatus: 'sold' }),
            Player.countDocuments({ auctionStatus: 'unsold' }),
            Match.countDocuments({ status: 'upcoming' }),
            Match.countDocuments({ status: 'live' }),
            Payment.countDocuments({ status: 'pending' }),
            Payment.countDocuments({ status: 'approved' }),
            Auction.findOne().sort({ createdAt: -1 })
        ]);
        res.json({
            success: true,
            stats: {
                totalTeams, totalPlayers, pendingRegistrations, soldPlayers, unsoldPlayers,
                upcomingMatches, liveMatches, pendingPayments,
                revenue: approvedPayments * 100,
                auctionStatus: auction ? auction.status : 'none'
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// API Routes
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/teams', require('./routes/teamRoutes'));
app.use('/api/players', require('./routes/playerRoutes'));
app.use('/api/auction', require('./routes/auctionRoutes'));
app.use('/api/matches', require('./routes/matchRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/live-scoring', require('./routes/liveScoringRoutes'));
app.use('/api/tournament', require('./routes/tournamentRoutes'));

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'RPL API is running 🏏' }));

// Cloudinary configuration check (for debugging)
app.get('/api/cloudinary-status', (req, res) => {
    const hasCloudName = !!process.env.CLOUDINARY_CLOUD_NAME;
    const hasApiKey = !!process.env.CLOUDINARY_API_KEY;
    const hasApiSecret = !!process.env.CLOUDINARY_API_SECRET;
    
    const isConfigured = hasCloudName && hasApiKey && hasApiSecret;
    
    res.json({
        success: true,
        cloudinary: {
            configured: isConfigured,
            cloudName: hasCloudName ? '✅ Set' : '❌ Missing',
            apiKey: hasApiKey ? '✅ Set' : '❌ Missing',
            apiSecret: hasApiSecret ? '✅ Set' : '❌ Missing',
            message: isConfigured 
                ? 'Cloudinary is configured' 
                : 'Cloudinary credentials are missing. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to environment variables.'
        }
    });
});

// Debug route to check players
app.get('/api/debug/players', async (req, res) => {
    try {
        const allPlayers = await Player.find().select('name approvalStatus auctionStatus');
        const approvedUnsold = await Player.find({ approvalStatus: 'approved', auctionStatus: 'unsold' }).select('name');
        res.json({
            success: true,
            total: allPlayers.length,
            allPlayers,
            approvedUnsold: approvedUnsold.length,
            approvedUnsoldList: approvedUnsold
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve React Frontend in Production (not needed for Vercel - separate deployments)
// Root route for backend
app.get('/', (req, res) => {
    res.json({ success: true, message: 'RPL API is running 🏏', version: '1.0.0' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error('=== Global Error Handler ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    
    // Handle multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ 
            success: false, 
            message: 'File size too large. Maximum 5MB allowed per file.' 
        });
    }
    
    if (err.message && err.message.includes('Invalid file type')) {
        return res.status(400).json({ 
            success: false, 
            message: err.message 
        });
    }
    
    if (err.message && err.message.includes('Only image files')) {
        return res.status(400).json({ 
            success: false, 
            message: 'Only image files are allowed (JPG, PNG, GIF, WEBP)' 
        });
    }
    
    // Handle Cloudinary errors
    if (err.message && (err.message.includes('Cloudinary') || err.message.includes('signature'))) {
        return res.status(500).json({ 
            success: false, 
            message: 'File upload service error. Please contact administrator.' 
        });
    }
    
    // Handle multer field errors
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).json({ 
            success: false, 
            message: 'Unexpected file field. Please check your form.' 
        });
    }
    
    // Generic error response
    res.status(err.status || 500).json({ 
        success: false, 
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { 
            stack: err.stack,
            errorType: err.name 
        })
    });
});

// Export for Vercel
module.exports = app;
