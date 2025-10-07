require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 3000;

// Admin IDs
const ADMIN_IDS = [5414042665]; // Your Telegram ID

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('../')); // Serve frontend files

// MongoDB connection (optional)
let db = null;
let mongoClient = null;
let useDatabase = false;

async function connectDB() {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
        console.warn('⚠️ MONGODB_URI not provided.');
        console.warn('⚠️ App will work in localStorage-only mode (client-side storage)');
        console.warn('⚠️ For production with real database:');
        console.warn('⚠️ 1. Create MongoDB database in Render');
        console.warn('⚠️ 2. Copy Internal Connection String');
        console.warn('⚠️ 3. Add as MONGODB_URI environment variable');
        useDatabase = false;
        return; // Continue without database
    }
    
    try {
        mongoClient = new MongoClient(mongoUri);
        await mongoClient.connect();
        db = mongoClient.db('2048-game');
        console.log('✅ Connected to MongoDB');
        
        // Create indexes
        await db.collection('users').createIndex({ telegram_id: 1 }, { unique: true });
        await db.collection('scores').createIndex({ telegram_id: 1 });
        await db.collection('scores').createIndex({ score: -1 });
        
        console.log('✅ Database indexes created');
        useDatabase = true;
    } catch (error) {
        console.error('⚠️ MongoDB connection failed:', error.message);
        console.warn('⚠️ Falling back to localStorage-only mode');
        useDatabase = false;
    }
}

// Telegram Bot (optional - only if token is provided)
let bot = null;
if (process.env.BOT_TOKEN) {
    try {
        bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

        bot.onText(/\/start/, (msg) => {
            const chatId = msg.chat.id;
            const webAppUrl = process.env.WEBAPP_URL || 'https://your-domain.com';
            
            bot.sendMessage(chatId, '🎮 Добро пожаловать в 2048!', {
                reply_markup: {
                    inline_keyboard: [[
                        { text: '🚀 Играть', web_app: { url: webAppUrl } }
                    ]]
                }
            });
        });

        bot.on('message', (msg) => {
            console.log('Received message:', msg.text, 'from', msg.from.username);
        });
        
        console.log('🤖 Telegram bot initialized');
    } catch (error) {
        console.warn('⚠️ Telegram bot initialization failed:', error.message);
        console.warn('⚠️ Bot features will be disabled. App will work without bot.');
    }
} else {
    console.warn('⚠️ BOT_TOKEN not provided. Telegram bot disabled.');
    console.warn('⚠️ App will work in web-only mode.');
}

// API Routes

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: Date.now() });
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

// Create or update user profile
app.post('/api/user/register', async (req, res) => {
    try {
        const { telegram_id, username, first_name, last_name, photo_url } = req.body;
        
        if (!telegram_id) {
            return res.status(400).json({ error: 'telegram_id is required' });
        }
        
        const user = {
            telegram_id,
            username: username || `user_${telegram_id}`,
            first_name: first_name || '',
            last_name: last_name || '',
            photo_url: photo_url || null,
            display_name: username || first_name || `user_${telegram_id}`,
            avatar: first_name ? first_name.charAt(0).toUpperCase() : '👤',
            created_at: new Date(),
            last_active: new Date()
        };
        
        if (useDatabase && db) {
            const result = await db.collection('users').updateOne(
                { telegram_id },
                { 
                    $set: user,
                    $setOnInsert: { created_at: new Date() }
                },
                { upsert: true }
            );
            
            console.log(`✅ User registered in DB: ${user.display_name} (${telegram_id})`);
            
            res.json({ 
                success: true, 
                user,
                isNew: result.upsertedCount > 0,
                storage: 'database'
            });
        } else {
            console.log(`✅ User registered (localStorage): ${user.display_name} (${telegram_id})`);
            res.json({ 
                success: true, 
                user,
                isNew: true,
                storage: 'localStorage'
            });
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user profile
app.get('/api/user/:telegram_id', async (req, res) => {
    try {
        const telegram_id = parseInt(req.params.telegram_id);
        const user = await db.collection('users').findOne({ telegram_id });
        
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        res.json({ success: true, user });
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Upload score
app.post('/api/score', async (req, res) => {
    try {
        const { telegram_id, username, avatar, score, timestamp } = req.body;
        
        if (!telegram_id || score === undefined) {
            return res.status(400).json({ error: 'telegram_id and score are required' });
        }
        
        // Get current best score
        const currentScore = await db.collection('scores').findOne({ telegram_id });
        
        if (!currentScore || score > currentScore.score) {
            // Update score only if it's higher
            await db.collection('scores').updateOne(
                { telegram_id },
                {
                    $set: {
                        username: username || `user_${telegram_id}`,
                        avatar: avatar || '👤',
                        score,
                        timestamp: timestamp || Date.now(),
                        updated_at: new Date()
                    },
                    $setOnInsert: { created_at: new Date() }
                },
                { upsert: true }
            );
            
            // Get new rank
            const rank = await db.collection('scores')
                .countDocuments({ score: { $gt: score } }) + 1;
            
            console.log(`✅ Score updated: ${username} - ${score} points (Rank: ${rank})`);
            
            res.json({ 
                success: true, 
                score,
                rank,
                isNewRecord: !currentScore || score > currentScore.score
            });
        } else {
            // Score is not higher, don't update
            const rank = await db.collection('scores')
                .countDocuments({ score: { $gt: currentScore.score } }) + 1;
            
            res.json({ 
                success: true, 
                score: currentScore.score,
                rank,
                isNewRecord: false
            });
        }
    } catch (error) {
        console.error('Error uploading score:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const offset = parseInt(req.query.offset) || 0;
        
        const leaderboard = await db.collection('scores')
            .find()
            .sort({ score: -1 })
            .skip(offset)
            .limit(limit)
            .toArray();
        
        // Add rank to each entry
        const leaderboardWithRank = leaderboard.map((entry, index) => ({
            ...entry,
            rank: offset + index + 1
        }));
        
        res.json({ 
            success: true, 
            leaderboard: leaderboardWithRank,
            total: await db.collection('scores').countDocuments()
        });
    } catch (error) {
        console.error('Error getting leaderboard:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get user rank
app.get('/api/rank/:telegram_id', async (req, res) => {
    try {
        const telegram_id = parseInt(req.params.telegram_id);
        const userScore = await db.collection('scores').findOne({ telegram_id });
        
        if (!userScore) {
            return res.json({ success: true, rank: null, score: 0 });
        }
        
        const rank = await db.collection('scores')
            .countDocuments({ score: { $gt: userScore.score } }) + 1;
        
        res.json({ 
            success: true, 
            rank,
            score: userScore.score,
            total: await db.collection('scores').countDocuments()
        });
    } catch (error) {
        console.error('Error getting rank:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
    try {
        const totalUsers = await db.collection('users').countDocuments();
        const totalScores = await db.collection('scores').countDocuments();
        const topScore = await db.collection('scores')
            .find()
            .sort({ score: -1 })
            .limit(1)
            .toArray();
        
        const avgScore = await db.collection('scores').aggregate([
            { $group: { _id: null, avg: { $avg: '$score' } } }
        ]).toArray();
        
        res.json({
            success: true,
            stats: {
                total_users: totalUsers,
                total_players: totalScores,
                top_score: topScore[0]?.score || 0,
                average_score: Math.round(avgScore[0]?.avg || 0)
            }
        });
    } catch (error) {
        console.error('Error getting stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start server
async function startServer() {
    await connectDB();
    
    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🤖 Telegram bot is active`);
        console.log(`📊 API available at http://localhost:${PORT}/api`);
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
