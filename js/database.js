class GameDatabase {
    constructor() {
        this.dbName = 'game2048_db';
        this.version = 2; // Увеличиваем версию для обновления структуры
        this.db = null;
        this.isReady = false;
        
        // Default user settings
        this.defaultSettings = {
            userId: null, // Будет установлен из Telegram ID
            telegramId: null, // Связь с Telegram
            playerName: 'Игрок',
            soundEnabled: true,
            volume: 50,
            animationsEnabled: true,
            vibrationEnabled: true,
            theme: 'dark',
            gamesPlayed: 0,
            totalScore: 0,
            bestScore: 0,
            coins: 1000,
            achievements: [],
            purchasedSkins: ['default'],
            activeSkin: 'default',
            bonusesOwned: {
                undo: 3,
                shuffle: 2,
                bomb: 1,
                life: 0
            },
            statistics: {
                totalMoves: 0,
                totalMerges: 0,
                highestTile: 0,
                playTime: 0,
                winCount: 0
            },
            createdAt: new Date().toISOString(),
            lastPlayed: new Date().toISOString()
        };
        
        this.init();
    }

    generateUserId() {
        // Теперь используем Telegram ID вместо случайного
        return null;
    }

    async init() {
        try {
            // Ждем инициализации Telegram
            while (!window.telegramIntegration || !window.telegramIntegration.isReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            
            // Try IndexedDB first (modern browsers)
            if (window.indexedDB) {
                await this.initIndexedDB();
            } else {
                // Fallback to localStorage
                this.initLocalStorage();
            }
            this.isReady = true;
            console.log('Database initialized successfully');
        } catch (error) {
            console.error('Database initialization failed:', error);
            // Fallback to localStorage
            this.initLocalStorage();
            this.isReady = true;
        }
    }

    async initIndexedDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };
            
                        request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create user settings store
                if (!db.objectStoreNames.contains('userSettings')) {
                    const settingsStore = db.createObjectStore('userSettings', { keyPath: 'telegramId' }); // Используем telegramId как ключ
                    settingsStore.createIndex('lastPlayed', 'lastPlayed', { unique: false });
                }
                
                // Create game sessions store
                if (!db.objectStoreNames.contains('gameSessions')) {
                    const sessionsStore = db.createObjectStore('gameSessions', { keyPath: 'sessionId' });
                    sessionsStore.createIndex('telegramId', 'telegramId', { unique: false }); // Индекс по telegramId
                    sessionsStore.createIndex('date', 'date', { unique: false });
                }
                
                // Create achievements store
                if (!db.objectStoreNames.contains('achievements')) {
                    const achievementsStore = db.createObjectStore('achievements', { keyPath: 'id' });
                    achievementsStore.createIndex('telegramId', 'telegramId', { unique: false }); // Индекс по telegramId
                }
            };
        });
    }

    initLocalStorage() {
        console.log('Using localStorage as database fallback');
        this.db = 'localStorage';
    }

    async saveUserSettings(settings) {
        if (!settings.telegramId) {
            console.error('No Telegram ID provided for saving settings');
            return;
        }
        
        if (!this.isReady) {
            console.warn('Database not ready, using localStorage');
            localStorage.setItem('userSettings', JSON.stringify(settings));
            return;
        }

        try {
            if (this.db === 'localStorage') {
                localStorage.setItem('userSettings', JSON.stringify(settings));
            } else {
                const transaction = this.db.transaction(['userSettings'], 'readwrite');
                const store = transaction.objectStore('userSettings');
                await store.put(settings);
            }
            console.log('User settings saved successfully for Telegram ID:', settings.telegramId);
        } catch (error) {
            console.error('Failed to save user settings:', error);
            // Fallback to localStorage
            localStorage.setItem('userSettings', JSON.stringify(settings));
        }
    }

    async getUserSettings(telegramId = null) {
        // Если не передан telegramId, пытаемся получить его из telegram integration
        if (!telegramId && window.telegramIntegration && window.telegramIntegration.user) {
            telegramId = window.telegramIntegration.user.id;
        }
        
        if (!telegramId) {
            console.warn('No Telegram ID available');
            return this.defaultSettings;
        }
        
        if (!this.isReady) {
            const saved = localStorage.getItem('userSettings');
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.telegramId === telegramId) {
                    return parsed;
                }
            }
            return { ...this.defaultSettings, telegramId: telegramId, userId: telegramId };
        }

        try {
            if (this.db === 'localStorage') {
                const saved = localStorage.getItem('userSettings');
                if (saved) {
                    const parsed = JSON.parse(saved);
                    if (parsed.telegramId === telegramId) {
                        return parsed;
                    }
                }
                return { ...this.defaultSettings, telegramId: telegramId, userId: telegramId };
            } else {
                const transaction = this.db.transaction(['userSettings'], 'readonly');
                const store = transaction.objectStore('userSettings');
                
                const result = await store.get(telegramId);
                if (result) {
                    return result;
                } else {
                    // Создаем нового пользователя с этим Telegram ID
                    const newSettings = { 
                        ...this.defaultSettings, 
                        telegramId: telegramId, 
                        userId: telegramId 
                    };
                    await this.saveUserSettings(newSettings);
                    return newSettings;
                }
            }
        } catch (error) {
            console.error('Failed to get user settings:', error);
            return { ...this.defaultSettings, telegramId: telegramId, userId: telegramId };
        }
    }

    async saveGameSession(sessionData) {
        if (!this.isReady) return;

        const session = {
            sessionId: 'session_' + Date.now(),
            telegramId: sessionData.telegramId || (window.telegramIntegration?.user?.id),
            userId: sessionData.userId || sessionData.telegramId,
            score: sessionData.score,
            moves: sessionData.moves,
            duration: sessionData.duration,
            won: sessionData.won,
            highestTile: sessionData.highestTile,
            date: new Date().toISOString()
        };

        try {
            if (this.db === 'localStorage') {
                const sessions = JSON.parse(localStorage.getItem('gameSessions') || '[]');
                sessions.push(session);
                // Keep only last 50 sessions
                if (sessions.length > 50) {
                    sessions.splice(0, sessions.length - 50);
                }
                localStorage.setItem('gameSessions', JSON.stringify(sessions));
            } else {
                const transaction = this.db.transaction(['gameSessions'], 'readwrite');
                const store = transaction.objectStore('gameSessions');
                await store.add(session);
            }
        } catch (error) {
            console.error('Failed to save game session:', error);
        }
    }

    async getGameSessions(telegramId, limit = 10) {
        if (!telegramId && window.telegramIntegration?.user?.id) {
            telegramId = window.telegramIntegration.user.id;
        }
        
        if (!telegramId) return [];
        
        if (!this.isReady) return [];

        try {
            if (this.db === 'localStorage') {
                const sessions = JSON.parse(localStorage.getItem('gameSessions') || '[]');
                return sessions
                    .filter(session => session.telegramId === telegramId)
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .slice(0, limit);
            } else {
                const transaction = this.db.transaction(['gameSessions'], 'readonly');
                const store = transaction.objectStore('gameSessions');
                const index = store.index('telegramId');
                const sessions = [];
                
                const cursor = await index.openCursor(telegramId);
                while (cursor && sessions.length < limit) {
                    sessions.push(cursor.value);
                    cursor.continue();
                }
                
                return sessions.sort((a, b) => new Date(b.date) - new Date(a.date));
            }
        } catch (error) {
            console.error('Failed to get game sessions:', error);
            return [];
        }
    }

    async updateStatistics(telegramId, stats) {
        if (!telegramId && window.telegramIntegration?.user?.id) {
            telegramId = window.telegramIntegration.user.id;
        }
        
        if (!telegramId) return null;
        
        const settings = await this.getUserSettings(telegramId);
        
        // Update statistics
        settings.statistics.totalMoves += stats.moves || 0;
        settings.statistics.totalMerges += stats.merges || 0;
        settings.statistics.highestTile = Math.max(settings.statistics.highestTile, stats.highestTile || 0);
        settings.statistics.playTime += stats.duration || 0;
        
        if (stats.won) {
            settings.statistics.winCount++;
        }
        
        // Update game counters
        settings.gamesPlayed++;
        settings.totalScore += stats.score || 0;
        settings.bestScore = Math.max(settings.bestScore, stats.score || 0);
        settings.lastPlayed = new Date().toISOString();
        
        await this.saveUserSettings(settings);
        return settings;
    }

    async unlockAchievement(telegramId, achievementId) {
        if (!telegramId && window.telegramIntegration?.user?.id) {
            telegramId = window.telegramIntegration.user.id;
        }
        
        if (!telegramId) return false;
        
        const settings = await this.getUserSettings(telegramId);
        
        if (!settings.achievements.includes(achievementId)) {
            settings.achievements.push(achievementId);
            await this.saveUserSettings(settings);
            
            // Save achievement record
            const achievement = {
                id: `${telegramId}_${achievementId}`,
                telegramId: telegramId,
                achievementId: achievementId,
                unlockedAt: new Date().toISOString()
            };
            
            try {
                if (this.db === 'localStorage') {
                    const achievements = JSON.parse(localStorage.getItem('achievements') || '[]');
                    achievements.push(achievement);
                    localStorage.setItem('achievements', JSON.stringify(achievements));
                } else {
                    const transaction = this.db.transaction(['achievements'], 'readwrite');
                    const store = transaction.objectStore('achievements');
                    await store.add(achievement);
                }
            } catch (error) {
                console.error('Failed to save achievement:', error);
            }
            
            return true;
        }
        
        return false;
    }

    async exportUserData(telegramId) {
        if (!telegramId && window.telegramIntegration?.user?.id) {
            telegramId = window.telegramIntegration.user.id;
        }
        
        if (!telegramId) return null;
        
        const settings = await this.getUserSettings(telegramId);
        const sessions = await this.getGameSessions(telegramId, 100);
        
        return {
            settings,
            sessions,
            exportedAt: new Date().toISOString(),
            version: this.version
        };
    }

    async importUserData(data) {
        if (data.settings) {
            await this.saveUserSettings(data.settings);
        }
        
        if (data.sessions && Array.isArray(data.sessions)) {
            for (const session of data.sessions) {
                await this.saveGameSession(session);
            }
        }
        
        return true;
    }

    async clearUserData(userId) {
        try {
            if (this.db === 'localStorage') {
                localStorage.removeItem('userSettings');
                localStorage.removeItem('gameSessions');
                localStorage.removeItem('achievements');
            } else {
                // Clear from IndexedDB
                const transaction = this.db.transaction(['userSettings', 'gameSessions', 'achievements'], 'readwrite');
                
                await transaction.objectStore('userSettings').delete(userId);
                
                // Clear sessions
                const sessionsStore = transaction.objectStore('gameSessions');
                const sessionsIndex = sessionsStore.index('userId');
                const sessionsCursor = await sessionsIndex.openCursor(userId);
                while (sessionsCursor) {
                    await sessionsCursor.delete();
                    sessionsCursor.continue();
                }
                
                // Clear achievements
                const achievementsStore = transaction.objectStore('achievements');
                const achievementsIndex = achievementsStore.index('userId');
                const achievementsCursor = await achievementsIndex.openCursor(userId);
                while (achievementsCursor) {
                    await achievementsCursor.delete();
                    achievementsCursor.continue();
                }
            }
            
            console.log('User data cleared successfully');
            return true;
        } catch (error) {
            console.error('Failed to clear user data:', error);
            return false;
        }
    }
}

// Initialize database
window.gameDB = new GameDatabase();
