class LeaderboardManager {
    constructor() {
        this.leaderboard = this.loadLeaderboard();
        this.currentUser = this.getCurrentUser();
        
        // Автоматически добавляем текущего пользователя в рейтинг
        this.ensureUserInLeaderboard();
    }
    
    ensureUserInLeaderboard() {
        if (!this.currentUser) return;
        
        // Сначала удаляем все дубликаты текущего пользователя
        this.leaderboard = this.leaderboard.filter(user => 
            !(user.id === this.currentUser.id || 
              user.telegramId === this.currentUser.telegramId ||
              (user.telegramId && this.currentUser.id && user.telegramId.toString() === this.currentUser.id.toString()))
        );
        
        // Добавляем текущего пользователя один раз
        this.leaderboard.push({ ...this.currentUser });
        this.leaderboard.sort((a, b) => b.bestScore - a.bestScore);
        this.saveLeaderboard();
        console.log('User ensured in leaderboard (duplicates removed):', this.currentUser.name);
    }

    getCurrentUser() {
        // Проверяем UserManager с приоритетом
        if (window.userManager?.settings && window.userManager.settings.userId) {
            const settings = window.userManager.settings;
            const user = {
                id: settings.userId || settings.telegramId,
                telegramId: settings.telegramId,
                name: settings.playerName || 'Игрок',
                avatar: '👤',
                bestScore: settings.bestScore || 0,
                gamesPlayed: settings.gamesPlayed || 0,
                joinDate: settings.createdAt || new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('Using UserManager data:', user);
            return user;
        }
        
        // Fallback: Telegram пользователь
        if (window.telegramIntegration?.user) {
            const tgUser = window.telegramIntegration.user;
            const user = {
                id: tgUser.id,
                telegramId: tgUser.id,
                name: tgUser.first_name || tgUser.username || 'Игрок',
                avatar: '👤',
                bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
                gamesPlayed: parseInt(localStorage.getItem('gamesPlayed')) || 0,
                joinDate: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('Using Telegram user:', user);
            return user;
        }
        
        // Проверяем сохраненный профиль из telegram_user
        const telegramProfile = localStorage.getItem('telegram_user');
        if (telegramProfile) {
            const tgData = JSON.parse(telegramProfile);
            const user = {
                id: tgData.telegramId,
                telegramId: tgData.telegramId,
                name: tgData.firstName || tgData.username || 'Игрок',
                avatar: '👤',
                bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
                gamesPlayed: parseInt(localStorage.getItem('gamesPlayed')) || 0,
                joinDate: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(user));
            console.log('Using saved Telegram profile:', user);
            return user;
        }
        
        // Проверяем сохраненного пользователя
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            const user = JSON.parse(savedUser);
            // Обновляем bestScore из localStorage
            user.bestScore = parseInt(localStorage.getItem('bestScore')) || 0;
            user.gamesPlayed = parseInt(localStorage.getItem('gamesPlayed')) || 0;
            return user;
        }
        
        // Создаем нового пользователя только если нет Telegram
        const newUser = {
            id: this.generateUserId(),
            name: 'Игрок',
            avatar: '👤',
            bestScore: parseInt(localStorage.getItem('bestScore')) || 0,
            gamesPlayed: 0,
            joinDate: new Date().toISOString()
        };
        
        localStorage.setItem('currentUser', JSON.stringify(newUser));
        console.log('Created new local user:', newUser);
        return newUser;
    }

    generateUserId() {
        return 'user_' + Math.random().toString(36).substr(2, 9);
    }

    loadLeaderboard() {
        const saved = localStorage.getItem('leaderboard');
        if (saved) {
            const leaderboard = JSON.parse(saved);
            // Удаляем дубликаты по telegramId
            const uniqueUsers = [];
            const seenIds = new Set();
            
            leaderboard.forEach(user => {
                const userId = user.telegramId || user.id;
                if (!seenIds.has(userId)) {
                    seenIds.add(userId);
                    uniqueUsers.push(user);
                }
            });
            
            return uniqueUsers;
        }
        return [];
    }


    saveLeaderboard(leaderboard = this.leaderboard) {
        localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    }

    // Единая функция обновления рейтинга на всех страницах
    updateRankingEverywhere() {
        const position = this.getUserPosition();
        
        // Обновляем все элементы с id="user-ranking"
        const rankingElements = document.querySelectorAll('#user-ranking');
        rankingElements.forEach(element => {
            element.textContent = position;
        });
        
        return position;
    }


    updateUserScore(newScore) {
        // Обновляем текущего пользователя
        this.currentUser.bestScore = Math.max(this.currentUser.bestScore || 0, newScore || 0);
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

        // Ищем пользователя в лидерборде (по ID или telegramId)
        const existingIndex = this.leaderboard.findIndex(user => 
            user.id === this.currentUser.id || 
            user.telegramId === this.currentUser.telegramId ||
            (user.telegramId && this.currentUser.id && user.telegramId.toString() === this.currentUser.id.toString())
        );
        
        if (existingIndex !== -1) {
            // Обновляем существующего
            this.leaderboard[existingIndex] = { ...this.currentUser };
        } else {
            // Добавляем нового
            this.leaderboard.push({ ...this.currentUser });
        }

        // Сортируем и сохраняем
        this.leaderboard.sort((a, b) => b.bestScore - a.bestScore);
        this.saveLeaderboard();
        
        // Обновляем рейтинг везде
        setTimeout(() => this.updateRankingEverywhere(), 50);
    }

    getUserPosition() {
        if (!this.currentUser) return 1;
        
        // Убеждаемся что пользователь в лидерборде
        this.updateUserScore(this.currentUser.bestScore);
        
        // Находим позицию (по ID или telegramId)
        const position = this.leaderboard.findIndex(user => 
            user.id === this.currentUser.id || 
            user.telegramId === this.currentUser.telegramId ||
            (user.telegramId && this.currentUser.id && user.telegramId.toString() === this.currentUser.id.toString())
        );
        return position !== -1 ? position + 1 : 1;
    }

    setLeaderAvatar(elementId, player) {
        const avatarElement = document.getElementById(elementId);
        if (!avatarElement) return;

        // Приоритет: загруженное фото > Telegram фото > эмодзи
        let imageUrl = null;
        
        // 1. Проверяем загруженное пользователем фото
        if (player.avatarImage) {
            imageUrl = player.avatarImage;
        } else if (player.id === this.currentUser.id) {
            // Для текущего пользователя проверяем localStorage
            const userImage = localStorage.getItem('userAvatarImage');
            if (userImage) {
                imageUrl = userImage;
            } else {
                // 2. Проверяем Telegram фото
                const telegramUser = localStorage.getItem('telegram_user');
                if (telegramUser) {
                    try {
                        const tgUser = JSON.parse(telegramUser);
                        if (tgUser.photoUrl && tgUser.photoUrl.includes('t.me')) {
                            imageUrl = tgUser.photoUrl;
                        }
                    } catch (e) {
                        console.error('Error parsing telegram user:', e);
                    }
                }
            }
        }

        // Если есть изображение, показываем его
        if (imageUrl) {
            const img = document.createElement('img');
            img.src = imageUrl;
            img.style.width = '100%';
            img.style.height = '100%';
            img.style.borderRadius = '50%';
            img.style.objectFit = 'cover';
            
            // Handle load error - fallback to emoji
            img.onerror = () => {
                avatarElement.innerHTML = '';
                avatarElement.textContent = player.avatar || '👤';
            };
            
            // Handle successful load
            img.onload = () => {
                console.log('Leaderboard avatar image loaded successfully for player:', player.name);
            };
            
            // Clear existing content and add image
            avatarElement.innerHTML = '';
            avatarElement.appendChild(img);
        } else {
            // 3. Используем эмодзи аватар
            avatarElement.innerHTML = '';
            avatarElement.textContent = player.avatar || '👤';
        }
    }

    getTopPlayers(limit = 10) {
        return this.leaderboard.slice(0, limit);
    }

    renderLeaderboard() {
        // Обновляем счет текущего пользователя
        const currentScore = parseInt(localStorage.getItem('bestScore')) || 0;
        this.updateUserScore(currentScore);

        // Рендерим обе вкладки
        this.renderTop10();
        this.renderAllPlayers();

        // Скрываем блок позиции пользователя - теперь он в профиле
        const yourPosition = document.getElementById('your-position');
        if (yourPosition) {
            yourPosition.style.display = 'none';
        }

        // Инициализируем обработчики табов
        this.initLeaderboardTabs();
    }

    renderTop10() {
        const leaderboardList = document.getElementById('leaderboard-top10-list');
        if (!leaderboardList) return;

        const topPlayers = this.getTopPlayers(10);
        leaderboardList.innerHTML = '';

        if (topPlayers.length === 0) {
            leaderboardList.innerHTML = '<p style="text-align: center; color: #8E8E93; padding: 40px;">Пока нет игроков в рейтинге</p>';
            return;
        }

        topPlayers.forEach((player, index) => {
            const rank = index + 1;
            const isCurrentUser = player.id === this.currentUser.id;
            
            const safePlayer = {
                name: player.name || 'Игрок',
                avatar: player.avatar || '👤',
                bestScore: player.bestScore || 0,
                gamesPlayed: player.gamesPlayed || 0
            };
            
            const leaderItem = document.createElement('div');
            leaderItem.className = `leader-item ${rank <= 3 ? `rank-${rank}` : ''} ${isCurrentUser ? 'current-user' : ''}`;
            
            leaderItem.innerHTML = `
                <div class="leader-medal"></div>
                <div class="leader-rank">${rank}</div>
                <div class="leader-avatar" id="leader-avatar-top10-${index}"></div>
                <div class="leader-info">
                    <h3>${safePlayer.name}${isCurrentUser ? ' (Вы)' : ''}</h3>
                    <p>${safePlayer.bestScore.toLocaleString()} XP</p>
                </div>
            `;
            
            leaderboardList.appendChild(leaderItem);
            this.setLeaderAvatar(`leader-avatar-top10-${index}`, player);
        });
    }

    renderAllPlayers() {
        const leaderboardList = document.getElementById('leaderboard-all-list');
        if (!leaderboardList) return;

        const allPlayers = this.leaderboard;
        leaderboardList.innerHTML = '';

        if (allPlayers.length === 0) {
            leaderboardList.innerHTML = '<p style="text-align: center; color: #8E8E93; padding: 40px;">Пока нет игроков в рейтинге</p>';
            return;
        }

        allPlayers.forEach((player, index) => {
            const rank = index + 1;
            const isCurrentUser = player.id === this.currentUser.id;
            
            const safePlayer = {
                name: player.name || 'Игрок',
                avatar: player.avatar || '👤',
                bestScore: player.bestScore || 0,
                gamesPlayed: player.gamesPlayed || 0
            };
            
            const leaderItem = document.createElement('div');
            leaderItem.className = `leader-item ${rank <= 3 ? `rank-${rank}` : ''} ${isCurrentUser ? 'current-user' : ''}`;
            
            leaderItem.innerHTML = `
                <div class="leader-medal"></div>
                <div class="leader-rank">${rank}</div>
                <div class="leader-avatar" id="leader-avatar-all-${index}"></div>
                <div class="leader-info">
                    <h3>${safePlayer.name}${isCurrentUser ? ' (Вы)' : ''}</h3>
                    <p>${safePlayer.bestScore.toLocaleString()} XP</p>
                </div>
            `;
            
            leaderboardList.appendChild(leaderItem);
            this.setLeaderAvatar(`leader-avatar-all-${index}`, player);
        });
    }

    initLeaderboardTabs() {
        const tabButtons = document.querySelectorAll('[data-leaderboard-tab]');
        if (tabButtons.length === 0) return;

        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.leaderboardTab;
                this.switchLeaderboardTab(tabName);
            });
        });
    }

    switchLeaderboardTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('[data-leaderboard-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.leaderboardTab === tabName);
        });

        // Update tab content
        document.querySelectorAll('#leaderboard-top10-tab, #leaderboard-all-tab').forEach(content => {
            const isActive = content.id === `leaderboard-${tabName}-tab`;
            content.classList.toggle('active', isActive);
        });
    }

    updateUserProfile(name, avatar, avatarImage = null) {
        this.currentUser.name = name;
        this.currentUser.avatar = avatar;
        
        // Сохраняем изображение если передано
        if (avatarImage) {
            this.currentUser.avatarImage = avatarImage;
        }
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Обновляем в лидерборде
        const existingIndex = this.leaderboard.findIndex(user => 
            user.id === this.currentUser.id || 
            user.telegramId === this.currentUser.telegramId ||
            (user.telegramId && this.currentUser.id && user.telegramId.toString() === this.currentUser.id.toString())
        );
        
        if (existingIndex !== -1) {
            this.leaderboard[existingIndex].name = name;
            this.leaderboard[existingIndex].avatar = avatar;
            if (avatarImage) {
                this.leaderboard[existingIndex].avatarImage = avatarImage;
            }
            this.saveLeaderboard();
        }
    }
}

// Глобальная переменная для лидерборда
window.leaderboardManager = new LeaderboardManager();
