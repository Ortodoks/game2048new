class UserManager {
    constructor() {
        this.currentUser = null;
        this.settings = null;
        this.isInitialized = false;
    }

    async init() {
        try {
            // Wait for database to be ready
            while (!window.gameDB || !window.gameDB.isReady) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Load or create user
            await this.loadCurrentUser();
            this.isInitialized = true;
            
            console.log('UserManager initialized with user:', this.currentUser.playerName);
            return true;
        } catch (error) {
            console.error('UserManager initialization failed:', error);
            return false;
        }
    }

    async loadCurrentUser() {
        // Try to load existing user
        this.settings = await window.gameDB.getUserSettings();
        
        if (!this.settings.userId) {
            // Create new user with Telegram data if available
            this.settings = { ...window.gameDB.defaultSettings };
            
            // Получаем данные из Telegram
            if (window.telegramIntegration?.user) {
                const tgUser = window.telegramIntegration.user;
                this.settings.userId = tgUser.id;
                this.settings.telegramId = tgUser.id;
                this.settings.playerName = tgUser.first_name || tgUser.username || 'Игрок';
                console.log('Created new user from Telegram:', {
                    id: tgUser.id,
                    name: this.settings.playerName
                });
            } else {
                // Проверяем telegram_user из localStorage
                const telegramUser = localStorage.getItem('telegram_user');
                if (telegramUser) {
                    try {
                        const tgData = JSON.parse(telegramUser);
                        this.settings.userId = tgData.telegramId;
                        this.settings.telegramId = tgData.telegramId;
                        this.settings.playerName = tgData.firstName || tgData.username || 'Игрок';
                        console.log('Created new user from saved Telegram data:', {
                            id: tgData.telegramId,
                            name: this.settings.playerName
                        });
                    } catch (error) {
                        console.error('Error parsing telegram_user:', error);
                    }
                }
            }
            
            // Если нет Telegram данных, генерируем случайный ID
            if (!this.settings.userId) {
                this.settings.userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                console.log('Created new user with generated ID:', this.settings.userId);
            }
            
            // Загружаем существующую статистику из localStorage
            this.settings.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
            this.settings.coins = parseInt(localStorage.getItem('coins')) || 1000;
            this.settings.gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
            this.settings.statistics.highestTile = parseInt(localStorage.getItem('highestTile')) || 0;
            this.settings.statistics.winCount = parseInt(localStorage.getItem('wins')) || 0;
            
            await this.saveSettings();
            console.log('New user registered in database:', this.settings);
        }
        
        this.currentUser = this.settings;
        return this.currentUser;
    }

    async saveSettings() {
        if (!this.settings) return false;
        
        try {
            await window.gameDB.saveUserSettings(this.settings);
            return true;
        } catch (error) {
            console.error('Failed to save user settings:', error);
            return false;
        }
    }

    // Sound settings
    async setSoundEnabled(enabled) {
        this.settings.soundEnabled = enabled;
        await this.saveSettings();
        
        // Update audio manager
        if (window.audioManager) {
            if (enabled) {
                window.audioManager.enableSound();
            } else {
                window.audioManager.disableSound();
            }
        }
    }

    async setVolume(volume) {
        this.settings.volume = Math.max(0, Math.min(100, volume));
        await this.saveSettings();
        
        // Update audio manager
        if (window.audioManager) {
            window.audioManager.setVolume(this.settings.volume / 100);
        }
    }

    // Game settings
    async setAnimationsEnabled(enabled) {
        this.settings.animationsEnabled = enabled;
        await this.saveSettings();
        
        // Apply to document
        document.body.classList.toggle('no-animations', !enabled);
    }

    async setVibrationEnabled(enabled) {
        this.settings.vibrationEnabled = enabled;
        await this.saveSettings();
    }

    async setTheme(theme) {
        this.settings.theme = theme;
        await this.saveSettings();
        
        // Apply theme
        document.body.className = document.body.className.replace(/theme-\w+/g, '');
        document.body.classList.add(`theme-${theme}`);
    }

    // Player info
    async setPlayerName(name) {
        this.settings.playerName = name.trim() || 'Игрок';
        await this.saveSettings();
    }

    // Game progress
    async updateGameStats(gameData) {
        const stats = {
            score: gameData.score || 0,
            moves: gameData.moves || 0,
            merges: gameData.merges || 0,
            duration: gameData.duration || 0,
            won: gameData.won || false,
            highestTile: gameData.highestTile || 0
        };

        // Update local settings
        this.settings.gamesPlayed++;
        this.settings.totalScore += stats.score;
        this.settings.bestScore = Math.max(this.settings.bestScore, stats.score);
        this.settings.lastPlayed = new Date().toISOString();

        // Update statistics
        this.settings.statistics.totalMoves += stats.moves;
        this.settings.statistics.totalMerges += stats.merges;
        this.settings.statistics.highestTile = Math.max(this.settings.statistics.highestTile, stats.highestTile);
        this.settings.statistics.playTime += stats.duration;
        
        if (stats.won) {
            this.settings.statistics.winCount++;
        }

        // Save to database
        await this.saveSettings();
        await window.gameDB.saveGameSession({
            userId: this.settings.userId,
            ...stats
        });

        // Check for achievements
        await this.checkAchievements();
    }

    async checkAchievements() {
        const achievements = [
            {
                id: 'first_game',
                condition: () => this.settings.gamesPlayed >= 1,
                reward: 50
            },
            {
                id: 'reach_512',
                condition: () => this.settings.statistics.highestTile >= 512,
                reward: 100
            },
            {
                id: 'reach_1024',
                condition: () => this.settings.statistics.highestTile >= 1024,
                reward: 200
            },
            {
                id: 'reach_2048',
                condition: () => this.settings.statistics.highestTile >= 2048,
                reward: 500
            },
            {
                id: 'win_10_games',
                condition: () => this.settings.statistics.winCount >= 10,
                reward: 300
            },
            {
                id: 'play_100_games',
                condition: () => this.settings.gamesPlayed >= 100,
                reward: 1000
            }
        ];

        for (const achievement of achievements) {
            if (achievement.condition() && !this.settings.achievements.includes(achievement.id)) {
                await this.unlockAchievement(achievement.id, achievement.reward);
            }
        }
    }

    async unlockAchievement(achievementId, reward = 0) {
        const unlocked = await window.gameDB.unlockAchievement(this.settings.userId, achievementId);
        
        if (unlocked) {
            this.settings.achievements.push(achievementId);
            this.settings.coins += reward;
            await this.saveSettings();
            
            // Show achievement notification
            if (window.showMessage) {
                window.showMessage(`🏅 Достижение разблокировано! +${reward} монет`, 'success');
            }
            
            console.log(`Achievement unlocked: ${achievementId}, reward: ${reward}`);
        }
    }

    // Coins and purchases
    async addCoins(amount) {
        this.settings.coins += amount;
        await this.saveSettings();
    }

    async spendCoins(amount) {
        if (this.settings.coins >= amount) {
            this.settings.coins -= amount;
            await this.saveSettings();
            return true;
        }
        return false;
    }

    async purchaseSkin(skinId, cost) {
        if (await this.spendCoins(cost)) {
            if (!this.settings.purchasedSkins.includes(skinId)) {
                this.settings.purchasedSkins.push(skinId);
                await this.saveSettings();
            }
            return true;
        }
        return false;
    }

    async setActiveSkin(skinId) {
        if (this.settings.purchasedSkins.includes(skinId)) {
            this.settings.activeSkin = skinId;
            await this.saveSettings();
            return true;
        }
        return false;
    }

    // Bonuses
    async addBonus(type, amount) {
        if (this.settings.bonusesOwned[type] !== undefined) {
            this.settings.bonusesOwned[type] += amount;
            await this.saveSettings();
        }
    }

    async useBonus(type) {
        if (this.settings.bonusesOwned[type] > 0) {
            this.settings.bonusesOwned[type]--;
            await this.saveSettings();
            return true;
        }
        return false;
    }

    // Data management
    async exportData() {
        return await window.gameDB.exportUserData(this.settings.userId);
    }

    async importData(data) {
        await window.gameDB.importUserData(data);
        await this.loadCurrentUser();
    }

    async resetProgress() {
        const confirmed = confirm('Вы уверены, что хотите сбросить весь прогресс? Это действие нельзя отменить.');
        
        if (confirmed) {
            await window.gameDB.clearUserData(this.settings.userId);
            this.settings = { ...window.gameDB.defaultSettings };
            await this.saveSettings();
            
            // Reload page to apply changes
            window.location.reload();
        }
    }

    // Getters
    getSetting(key) {
        return this.settings ? this.settings[key] : null;
    }

    getStatistics() {
        return this.settings ? this.settings.statistics : {};
    }

    getAchievements() {
        return this.settings ? this.settings.achievements : [];
    }

    getBonusCount(type) {
        return this.settings ? (this.settings.bonusesOwned[type] || 0) : 0;
    }

    getCoins() {
        return this.settings ? this.settings.coins : 0;
    }

    getBestScore() {
        return this.settings ? this.settings.bestScore : 0;
    }

    getGamesPlayed() {
        return this.settings ? this.settings.gamesPlayed : 0;
    }
}

// Initialize user manager
window.userManager = new UserManager();
