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

// Health check
app.get('/api/health', (req, res) => res.json({ success: true, message: 'RPL API is running 🏏' }));

// Debug route to check players
app.get('/api/debug/players', async (req, res) => {
    try {
        const allPlayers = await Player.find().select('name approvalStatus auctionStatus');
        const approvedUpcoming = await Player.find({ approvalStatus: 'approved', auctionStatus: 'upcoming' }).select('name');
        res.json({
            success: true,
            total: allPlayers.length,
            allPlayers,
            approvedUpcoming: approvedUpcoming.length,
            approvedUpcomingList: approvedUpcoming
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Serve React Frontend in Production
if (process.env.NODE_ENV === 'production') {
    // Serve static files from React build
    app.use(express.static(path.join(__dirname, '../frontend/dist')));
    
    // Handle React routing, return all requests to React app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.json({ success: true, message: 'RPL API is running in development mode 🏏' });
    });
}

// 404 handler for API routes only (in development)
app.use('/api/*', (req, res) => res.status(404).json({ success: false, message: 'API route not found' }));

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🏏 RPL Server running on :${PORT}`);
});

module.exports = app;
