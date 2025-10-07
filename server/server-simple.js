// Simple server without MongoDB requirement
// Works with localStorage on client side

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin IDs
const ADMIN_IDS = [5414042665];

// Middleware
app.use(cors());
app.use(express.json());

// Serve frontend files from parent directory
const path = require('path');
const fs = require('fs');

// Always serve from parent directory (works for both Docker and local)
const parentDir = path.join(__dirname, '..');
app.use(express.static(parentDir));
console.log('📁 Serving files from:', parentDir);

console.log('🚀 Starting server in localStorage mode...');
console.log('📝 All data will be stored on client side');

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: Date.now(),
        mode: 'localStorage',
        message: 'Server running without database'
    });
});

// Get user profile photo from Telegram
app.get('/api/user/photo/:telegram_id', async (req, res) => {
    try {
        const telegram_id = req.params.telegram_id;
        const BOT_TOKEN = process.env.BOT_TOKEN;
        
        if (!BOT_TOKEN) {
            return res.json({ success: false, photo_url: null });
        }
        
        const fetch = (await import('node-fetch')).default;
        const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${telegram_id}&limit=1`);
        const data = await response.json();
        
        if (data.ok && data.result.total_count > 0) {
            const fileId = data.result.photos[0][0].file_id;
            const fileResponse = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`);
            const fileData = await fileResponse.json();
            
            if (fileData.ok) {
                const photoUrl = `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileData.result.file_path}`;
                res.json({ success: true, photo_url: photoUrl });
            } else {
                res.json({ success: false, photo_url: null });
            }
        } else {
            res.json({ success: false, photo_url: null });
        }
    } catch (error) {
        console.error('Error getting user photo:', error);
        res.json({ success: false, photo_url: null });
    }
});

// Check if user is admin
app.get('/api/check-admin/:telegram_id', (req, res) => {
    try {
        const telegram_id = parseInt(req.params.telegram_id);
        const isAdmin = ADMIN_IDS.includes(telegram_id);
        
        console.log(`Admin check for ${telegram_id}: ${isAdmin}`);
        
        res.json({ 
            success: true, 
            isAdmin,
            telegram_id 
        });
    } catch (error) {
        console.error('Error checking admin:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// User registration (client-side only)
app.post('/api/user/register', (req, res) => {
    const { telegram_id, username, first_name } = req.body;
    
    console.log(`✅ User registered (client-side): ${username || first_name} (${telegram_id})`);
    
    res.json({ 
        success: true,
        message: 'User data saved on client side',
        storage: 'localStorage'
    });
});

// Score upload (client-side only)
app.post('/api/score', (req, res) => {
    const { telegram_id, username, score } = req.body;
    
    console.log(`✅ Score received: ${username} - ${score} points (saved on client)`);
    
    res.json({ 
        success: true,
        message: 'Score saved on client side',
        storage: 'localStorage'
    });
});

// Leaderboard (returns empty, client uses localStorage)
app.get('/api/leaderboard', (req, res) => {
    res.json({ 
        success: true,
        leaderboard: [],
        message: 'Using client-side leaderboard',
        storage: 'localStorage'
    });
});

// Stats (returns zeros, client calculates)
app.get('/api/stats', (req, res) => {
    res.json({
        success: true,
        stats: {
            total_users: 0,
            total_players: 0,
            top_score: 0,
            average_score: 0
        },
        message: 'Using client-side stats',
        storage: 'localStorage'
    });
});

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
    console.log(`💾 Mode: localStorage (no database required)`);
    console.log(`🎮 Game ready to play!`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n👋 Shutting down...');
    process.exit(0);
});
