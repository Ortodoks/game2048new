// Full server with MongoDB support
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB setup
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/2048-game';
let mongoClient;
let db;

// Telegram Bot setup
const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-domain.com';
let bot;

if (BOT_TOKEN) {
    bot = new TelegramBot(BOT_TOKEN, { polling: true });
    console.log('🤖 Telegram bot initialized');
} else {
    console.warn('⚠️ BOT_TOKEN not found, bot features disabled');
}

// Admin IDs
const ADMIN_IDS = [5414042665];

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from parent directory
const parentDir = path.join(__dirname, '..');
app.use(express.static(parentDir));
console.log('📁 Serving files from:', parentDir);

// Connect to MongoDB
async function connectDB() {
    try {
        mongoClient = new MongoClient(MONGODB_URI);
        await mongoClient.connect();
        db = mongoClient.db();
        console.log('✅ Connected to MongoDB');
        
        // Create indexes
        await db.collection('users').createIndex({ telegram_id: 1 }, { unique: true });
        await db.collection('scores').createIndex({ telegram_id: 1 });
        await db.collection('scores').createIndex({ score: -1 });
        await db.collection('game_sessions').createIndex({ telegram_id: 1 });
        await db.collection('achievements').createIndex({ telegram_id: 1 });
        
        console.log('✅ Database indexes created');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        console.log('⚠️ Server will run without database');
    }
}

// Helper function to check if DB is connected
function isDBConnected() {
    return mongoClient && db;
}

// ============================================
// API ROUTES
// ============================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        database: isDBConnected() ? 'connected' : 'disconnected',
        mode: isDBConnected() ? 'database' : 'localStorage'
    });
});

// ============================================
// USER MANAGEMENT
// ============================================

// Register user
app.post('/api/user/register', async (req, res) => {
    const { telegram_id, username, first_name, last_name, photo_url } = req.body;

    if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id is required' });
    }

    if (!isDBConnected()) {
        console.log(`✅ User registered (client-side): ${username || first_name} (${telegram_id})`);
        return res.json({
            success: true,
            message: 'User data saved on client side',
            storage: 'localStorage'
        });
    }

    try {
        const user = {
            telegram_id: parseInt(telegram_id),
            username: username || `user_${telegram_id}`,
            first_name: first_name || '',
            last_name: last_name || '',
            photo_url: photo_url || null,
            display_name: username || first_name || `User ${telegram_id}`,
            avatar: first_name ? first_name.charAt(0).toUpperCase() : '👤',
            created_at: new Date(),
            last_active: new Date()
        };

        await db.collection('users').updateOne(
            { telegram_id: user.telegram_id },
            { $set: user, $setOnInsert: { created_at: new Date() } },
            { upsert: true }
        );

        console.log(`✅ User registered: ${user.display_name} (${telegram_id})`);

        res.json({
            success: true,
            user,
            message: 'User registered successfully'
        });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user profile
app.get('/api/user/:telegram_id', async (req, res) => {
    const telegram_id = parseInt(req.params.telegram_id);

    if (!isDBConnected()) {
        return res.json({
            success: false,
            message: 'Database not connected',
            storage: 'localStorage'
        });
    }

    try {
        const user = await db.collection('users').findOne({ telegram_id });

        if (user) {
            res.json({ success: true, user });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update user profile
app.put('/api/user/:telegram_id', async (req, res) => {
    const telegram_id = parseInt(req.params.telegram_id);
    const updates = req.body;

    if (!isDBConnected()) {
        return res.json({
            success: true,
            message: 'Updates saved on client side',
            storage: 'localStorage'
        });
    }

    try {
        delete updates._id;
        delete updates.telegram_id;
        updates.last_active = new Date();

        const result = await db.collection('users').updateOne(
            { telegram_id },
            { $set: updates }
        );

        if (result.matchedCount > 0) {
            res.json({ success: true, message: 'User updated' });
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user photo from Telegram
app.get('/api/user/photo/:telegram_id', async (req, res) => {
    try {
        const telegram_id = req.params.telegram_id;

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

// ============================================
// SCORES & LEADERBOARD
// ============================================

// Upload score
app.post('/api/score', async (req, res) => {
    const { telegram_id, username, avatar, score, timestamp } = req.body;

    if (!telegram_id || !score) {
        return res.status(400).json({ error: 'telegram_id and score are required' });
    }

    if (!isDBConnected()) {
        console.log(`✅ Score received: ${username} - ${score} points (saved on client)`);
        return res.json({
            success: true,
            message: 'Score saved on client side',
            storage: 'localStorage'
        });
    }

    try {
        const scoreData = {
            telegram_id: parseInt(telegram_id),
            username: username || `user_${telegram_id}`,
            avatar: avatar || '👤',
            score: parseInt(score),
            timestamp: timestamp || Date.now(),
            created_at: new Date(),
            updated_at: new Date()
        };

        // Update or insert score (keep only best score)
        const existing = await db.collection('scores').findOne({ telegram_id: scoreData.telegram_id });

        if (existing && existing.score >= scoreData.score) {
            // Don't update if new score is not better
            return res.json({
                success: true,
                message: 'Score not updated (not a new record)',
                best_score: existing.score
            });
        }

        await db.collection('scores').updateOne(
            { telegram_id: scoreData.telegram_id },
            { $set: scoreData },
            { upsert: true }
        );

        // Update user's last active
        await db.collection('users').updateOne(
            { telegram_id: scoreData.telegram_id },
            { $set: { last_active: new Date() } }
        );

        console.log(`✅ Score uploaded: ${username} - ${score} points`);

        res.json({
            success: true,
            message: 'Score uploaded successfully',
            score: scoreData.score
        });
    } catch (error) {
        console.error('Error uploading score:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    const limit = parseInt(req.query.limit) || 100;
    const offset = parseInt(req.query.offset) || 0;

    if (!isDBConnected()) {
        return res.json({
            success: true,
            leaderboard: [],
            message: 'Using client-side leaderboard',
            storage: 'localStorage'
        });
    }

    try {
        const leaderboard = await db.collection('scores')
            .find()
            .sort({ score: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();

        res.json({
            success: true,
            leaderboard,
            count: leaderboard.length
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user rank
app.get('/api/rank/:telegram_id', async (req, res) => {
    const telegram_id = parseInt(req.params.telegram_id);

    if (!isDBConnected()) {
        return res.json({
            success: false,
            message: 'Database not connected',
            storage: 'localStorage'
        });
    }

    try {
        const userScore = await db.collection('scores').findOne({ telegram_id });

        if (!userScore) {
            return res.json({ success: false, message: 'User has no score' });
        }

        const rank = await db.collection('scores').countDocuments({
            score: { $gt: userScore.score }
        });

        res.json({
            success: true,
            rank: rank + 1,
            score: userScore.score
        });
    } catch (error) {
        console.error('Error getting rank:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    if (!isDBConnected()) {
        return res.json({
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
    }

    try {
        const totalUsers = await db.collection('users').countDocuments();
        const totalPlayers = await db.collection('scores').countDocuments();
        const topScore = await db.collection('scores').findOne({}, { sort: { score: -1 } });
        const avgResult = await db.collection('scores').aggregate([
            { $group: { _id: null, avg: { $avg: '$score' } } }
        ]).toArray();

        res.json({
            success: true,
            stats: {
                total_users: totalUsers,
                total_players: totalPlayers,
                top_score: topScore ? topScore.score : 0,
                average_score: avgResult.length > 0 ? Math.round(avgResult[0].avg) : 0
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================
// GAME SESSIONS
// ============================================

// Save game session
app.post('/api/game-session', async (req, res) => {
    const { telegram_id, score, moves, duration, won, highestTile } = req.body;

    if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id is required' });
    }

    if (!isDBConnected()) {
        return res.json({
            success: true,
            message: 'Session saved on client side',
            storage: 'localStorage'
        });
    }

    try {
        const session = {
            telegram_id: parseInt(telegram_id),
            score: score || 0,
            moves: moves || 0,
            duration: duration || 0,
            won: won || false,
            highestTile: highestTile || 0,
            created_at: new Date()
        };

        await db.collection('game_sessions').insertOne(session);

        res.json({
            success: true,
            message: 'Game session saved'
        });
    } catch (error) {
        console.error('Error saving game session:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user's game sessions
app.get('/api/game-sessions/:telegram_id', async (req, res) => {
    const telegram_id = parseInt(req.params.telegram_id);
    const limit = parseInt(req.query.limit) || 10;

    if (!isDBConnected()) {
        return res.json({
            success: true,
            sessions: [],
            storage: 'localStorage'
        });
    }

    try {
        const sessions = await db.collection('game_sessions')
            .find({ telegram_id })
            .sort({ created_at: -1 })
            .limit(limit)
            .toArray();

        res.json({
            success: true,
            sessions
        });
    } catch (error) {
        console.error('Error getting game sessions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================
// ACHIEVEMENTS
// ============================================

// Unlock achievement
app.post('/api/achievements', async (req, res) => {
    const { telegram_id, achievement_id } = req.body;

    if (!telegram_id || !achievement_id) {
        return res.status(400).json({ error: 'telegram_id and achievement_id are required' });
    }

    if (!isDBConnected()) {
        return res.json({
            success: true,
            message: 'Achievement saved on client side',
            storage: 'localStorage'
        });
    }

    try {
        const achievement = {
            telegram_id: parseInt(telegram_id),
            achievement_id,
            unlocked_at: new Date()
        };

        await db.collection('achievements').updateOne(
            { telegram_id: achievement.telegram_id, achievement_id },
            { $set: achievement },
            { upsert: true }
        );

        res.json({
            success: true,
            message: 'Achievement unlocked'
        });
    } catch (error) {
        console.error('Error unlocking achievement:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user achievements
app.get('/api/achievements/:telegram_id', async (req, res) => {
    const telegram_id = parseInt(req.params.telegram_id);

    if (!isDBConnected()) {
        return res.json({
            success: true,
            achievements: [],
            storage: 'localStorage'
        });
    }

    try {
        const achievements = await db.collection('achievements')
            .find({ telegram_id })
            .toArray();

        res.json({
            success: true,
            achievements
        });
    } catch (error) {
        console.error('Error getting achievements:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================
// USER SETTINGS
// ============================================

// Save user settings
app.post('/api/user-settings', async (req, res) => {
    const { telegram_id, settings } = req.body;

    if (!telegram_id) {
        return res.status(400).json({ error: 'telegram_id is required' });
    }

    if (!isDBConnected()) {
        return res.json({
            success: true,
            message: 'Settings saved on client side',
            storage: 'localStorage'
        });
    }

    try {
        const settingsData = {
            telegram_id: parseInt(telegram_id),
            ...settings,
            updated_at: new Date()
        };

        await db.collection('user_settings').updateOne(
            { telegram_id: settingsData.telegram_id },
            { $set: settingsData },
            { upsert: true }
        );

        res.json({
            success: true,
            message: 'Settings saved'
        });
    } catch (error) {
        console.error('Error saving settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user settings
app.get('/api/user-settings/:telegram_id', async (req, res) => {
    const telegram_id = parseInt(req.params.telegram_id);

    if (!isDBConnected()) {
        return res.json({
            success: false,
            message: 'Database not connected',
            storage: 'localStorage'
        });
    }

    try {
        const settings = await db.collection('user_settings').findOne({ telegram_id });

        if (settings) {
            res.json({ success: true, settings });
        } else {
            res.json({ success: false, message: 'Settings not found' });
        }
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all users (admin only)
app.get('/api/admin/users', async (req, res) => {
    const admin_id = parseInt(req.query.admin_id);

    if (!ADMIN_IDS.includes(admin_id)) {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (!isDBConnected()) {
        return res.json({
            success: true,
            users: [],
            storage: 'localStorage'
        });
    }

    try {
        const users = await db.collection('users').find().toArray();
        res.json({ success: true, users });
    } catch (error) {
        console.error('Error getting users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ============================================
// TELEGRAM BOT HANDLERS
// ============================================

if (bot) {
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name;

        bot.sendMessage(chatId, `🎮 Привет, ${firstName}!\n\nДобро пожаловать в игру 2048!\n\nНажми на кнопку ниже, чтобы начать играть! 👇`, {
            reply_markup: {
                inline_keyboard: [[
                    { text: '🎮 Играть', web_app: { url: WEBAPP_URL } }
                ]]
            }
        });
    });

    bot.on('message', (msg) => {
        if (msg.text && !msg.text.startsWith('/')) {
            const chatId = msg.chat.id;
            bot.sendMessage(chatId, '🎮 Нажми на кнопку ниже, чтобы начать играть!', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🎮 Играть', web_app: { url: WEBAPP_URL } }
                    ]]
                }
            });
        }
    });
}

// ============================================
// SERVE FRONTEND
// ============================================

// Serve index.html for root
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// ============================================
// START SERVER
// ============================================

async function startServer() {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        if (bot) {
            console.log(`🤖 Telegram bot is active`);
        }
        console.log(`📊 API available at http://localhost:${PORT}/api`);
        console.log(`💾 Database: ${isDBConnected() ? 'MongoDB connected' : 'localStorage mode'}`);
        console.log(`🎮 Game ready to play!`);
    });
}

startServer().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n👋 Shutting down gracefully...');
    if (mongoClient) {
        await mongoClient.close();
    }
    if (bot) {
        bot.stopPolling();
    }
    process.exit(0);
});
