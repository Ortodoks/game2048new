class ProfilePage {
    constructor() {
        this.isInitialized = false;
        this.init();
    }

    async init() {
        console.log('Initializing ProfilePage...');
        
        try {
            console.log('Setting up profile tabs...');
            this.setupTabs();
            
            console.log('Setting up close button...');
            this.setupCloseButton();
            
            console.log('Adding admin panel tab...');
            this.addAdminTab();
            
            console.log('Updating user card layout...');
            this.updateUserCardLayout();
            
            
            console.log('Loading profile data...');
            await this.loadProfileData();
            
            console.log('Setting up settings...');
            this.setupSettings();
            
            console.log('Handling URL parameters...');
            this.handleUrlParameters();
            
            console.log('Setting up auto-refresh...');
            this.setupAutoRefresh();
            
            this.isInitialized = true;
            console.log('Profile page initialized successfully');
        } catch (error) {
            console.error('Profile page initialization failed:', error);
            console.error('Error details:', error.message, error.stack);
            
            // Try to continue with basic functionality silently
            try {
                this.setupTabs();
                this.loadDefaultData();
                this.isInitialized = true;
                console.log('Profile initialized with basic functionality');
            } catch (fallbackError) {
                console.error('Fallback initialization also failed:', fallbackError);
            }
        }
    }

    setupAutoRefresh() {
        // Refresh data every 2 seconds to keep it in sync
        setInterval(() => {
            if (this.isInitialized && !document.hidden) {
                this.loadProfileData();
            }
        }, 2000);
        
        // Also refresh when page becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.isInitialized) {
                this.loadProfileData();
            }
        });
    }

    setupTabs() {
        console.log('Setting up profile tabs...');
        
        // Tab switching
        const tabButtons = document.querySelectorAll('.profile-tab-btn');
        console.log('Found tab buttons:', tabButtons.length);
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                console.log('Tab clicked:', tabName);
                
                // Update active tab button
                document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab content
                document.querySelectorAll('.profile-tab-content').forEach(content => {
                    content.classList.remove('active');
                });
                
                const targetTab = document.getElementById(tabName + '-tab');
                if (targetTab) {
                    targetTab.classList.add('active');
                    console.log('Activated tab:', tabName + '-tab');
                } else {
                    console.error('Tab not found:', tabName + '-tab');
                }
            });
        });
    }

    setupCloseButton() {
        const closeBtn = document.getElementById('close-profile');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                // Check if we're in an iframe
                if (window.parent !== window) {
                    // We're in an iframe, tell parent to close modal
                    window.parent.postMessage('closeProfile', '*');
                } else {
                    // We're on a standalone page, redirect to index
                    window.location.href = 'index.html';
                }
            });
            console.log('Close button handler added');
        }
    }

    updateUserCardLayout() {
        // Update user card to remove mini stats and fix level badges
        const userCard = document.querySelector('.user-card');
        if (userCard) {
            // Remove mini stats if they exist
            const miniStats = userCard.querySelector('.user-stats-mini');
            if (miniStats) {
                miniStats.remove();
            }
            
            // Update user level structure
            const userLevel = userCard.querySelector('.user-level');
            if (userLevel) {
                userLevel.innerHTML = `
                    <span class="level-badge">Новичок</span>
                    <span class="level-badge level-number">Уровень 1</span>
                `;
            }
            
            console.log('User card layout updated');
        }
    }

    addAdminTab() {
        // Add admin tab button
        const tabsContainer = document.querySelector('.profile-tabs');
        if (tabsContainer) {
            const adminTabBtn = document.createElement('button');
            adminTabBtn.className = 'profile-tab-btn';
            adminTabBtn.setAttribute('data-tab', 'admin');
            adminTabBtn.innerHTML = '🔧 Админ панель';
            tabsContainer.appendChild(adminTabBtn);
            
            // Add admin tab content
            const settingsTab = document.getElementById('settings-tab');
            if (settingsTab) {
                const adminTabContent = document.createElement('div');
                adminTabContent.id = 'admin-tab';
                adminTabContent.className = 'profile-tab-content';
                adminTabContent.innerHTML = `
                    <div class="admin-panel">
                        <div class="admin-section">
                            <h3>🔧 Панель администратора</h3>
                            <p style="opacity: 0.8; margin-bottom: 20px;">Функции для управления игрой и отладки</p>
                            
                            <div class="admin-actions">
                                <button class="admin-btn" id="clear-storage">
                                    <span>🗑️</span>
                                    <span>Очистить localStorage</span>
                                </button>
                                
                                <button class="admin-btn" id="add-coins">
                                    <span>💰</span>
                                    <span>Добавить 1000 монет</span>
                                </button>
                                
                                <button class="admin-btn" id="reset-stats">
                                    <span>📊</span>
                                    <span>Сбросить статистику</span>
                                </button>
                            </div>
                            
                            <div class="admin-info">
                                <h4>📊 Системная информация</h4>
                                <div class="info-grid">
                                    <div class="info-item">
                                        <span class="info-label">Браузер:</span>
                                        <span class="info-value">${navigator.userAgent.split(' ')[0]}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="info-label">Размер экрана:</span>
                                        <span class="info-value">${window.innerWidth}x${window.innerHeight}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                // Insert after settings tab
                settingsTab.parentNode.insertBefore(adminTabContent, settingsTab.nextSibling);
                
                // Add admin styles
                this.addAdminStyles();
                
                // Setup admin handlers
                this.setupAdminHandlers();
            }
            
            console.log('Admin tab added successfully');
        }
    }

    addAdminStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .back-button {
                display: none !important;
            }
            
            .admin-panel {
                padding: 20px 0;
            }
            
            .admin-section h3 {
                color: #ff6b6b;
                margin-bottom: 10px;
                font-size: 1.5rem;
            }
            
            .admin-actions {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 12px;
                margin-bottom: 30px;
            }
            
            .admin-btn {
                background: rgba(255, 107, 107, 0.1);
                border: 1px solid rgba(255, 107, 107, 0.3);
                color: #ff6b6b;
                padding: 12px 16px;
                border-radius: 12px;
                display: flex;
                align-items: center;
                gap: 8px;
                cursor: pointer;
                transition: all 0.3s ease;
                font-size: 0.9rem;
            }
            
            .admin-btn:hover {
                background: rgba(255, 107, 107, 0.2);
                transform: translateY(-2px);
            }
            
            .level-badge {
                background: rgba(120, 219, 255, 0.2);
                color: #78dbff;
                padding: 4px 12px;
                border-radius: 12px;
                font-size: 0.8rem;
                font-weight: 600;
                border: 1px solid rgba(120, 219, 255, 0.3);
            }
            
            .level-badge.level-number {
                background: rgba(255, 119, 198, 0.2);
                color: #ff77c6;
                border: 1px solid rgba(255, 119, 198, 0.3);
            }
            
            .admin-info {
                background: rgba(255, 255, 255, 0.05);
                border-radius: 12px;
                padding: 16px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .admin-info h4 {
                color: #78dbff;
                margin-bottom: 12px;
                font-size: 1.1rem;
            }
            
            .info-grid {
                display: grid;
                gap: 8px;
            }
            
            .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .info-item:last-child {
                border-bottom: none;
            }
            
            .info-label {
                opacity: 0.8;
                font-size: 0.9rem;
            }
            
            .info-value {
                color: #78dbff;
                font-weight: 600;
                font-size: 0.9rem;
            }
        `;
        document.head.appendChild(style);
    }

    setupAdminHandlers() {
        // Clear localStorage
        const clearStorageBtn = document.getElementById('clear-storage');
        if (clearStorageBtn) {
            clearStorageBtn.addEventListener('click', () => {
                if (confirm('Вы уверены, что хотите очистить все данные?')) {
                    localStorage.clear();
                    alert('localStorage очищен! Перезагрузите страницу.');
                }
            });
        }
        
        // Add coins
        const addCoinsBtn = document.getElementById('add-coins');
        if (addCoinsBtn) {
            addCoinsBtn.addEventListener('click', () => {
                const currentCoins = parseInt(localStorage.getItem('coins') || '0');
                const newCoins = currentCoins + 1000;
                localStorage.setItem('coins', newCoins);
                alert(`Добавлено 1000 монет! Всего: ${newCoins}`);
                this.loadProfileData(); // Refresh display
            });
        }
        
        // Reset stats
        const resetStatsBtn = document.getElementById('reset-stats');
        if (resetStatsBtn) {
            resetStatsBtn.addEventListener('click', () => {
                if (confirm('Сбросить всю статистику?')) {
                    localStorage.removeItem('gamesPlayed');
                    localStorage.removeItem('bestScore');
                    localStorage.removeItem('gameState');
                    alert('Статистика сброшена!');
                    this.loadProfileData(); // Refresh display
                }
            });
        }
        
        // Debug info
        const debugInfoBtn = document.getElementById('debug-info');
        if (debugInfoBtn) {
            debugInfoBtn.addEventListener('click', () => {
                const debugInfo = {
                    localStorage: { ...localStorage },
                    userAgent: navigator.userAgent,
                    screen: `${window.innerWidth}x${window.innerHeight}`,
                    timestamp: new Date().toISOString()
                };
                console.log('Debug Info:', debugInfo);
                alert('Отладочная информация выведена в консоль (F12)');
            });
        }
    }

    setupSettings() {
        console.log('Setting up settings handlers...');
        
        try {
            // Sound settings
            const soundToggle = document.getElementById('profile-sound-toggle');
            const volumeSlider = document.getElementById('profile-volume-slider');
            const volumeValue = document.getElementById('profile-volume-value');
            const vibrationToggle = document.getElementById('vibration-toggle');
            const animationsToggle = document.getElementById('animations-toggle');
            const testVibrationBtn = document.getElementById('test-vibration');

            if (soundToggle) {
                soundToggle.addEventListener('change', () => {
                    const enabled = soundToggle.checked;
                    console.log('Sound toggle changed:', enabled);
                    localStorage.setItem('soundEnabled', enabled);
                    
                    // Apply sound settings to document
                    if (enabled) {
                        document.body.classList.remove('no-sound');
                    } else {
                        document.body.classList.add('no-sound');
                    }
                });
            }

            if (volumeSlider && volumeValue) {
                volumeSlider.addEventListener('input', () => {
                    const volume = parseInt(volumeSlider.value);
                    volumeValue.textContent = volume + '%';
                    localStorage.setItem('volume', volume);
                    
                    // Apply volume settings to document
                    document.body.style.setProperty('--volume', volume + '%');
                });
            }

            if (vibrationToggle) {
                vibrationToggle.addEventListener('change', () => {
                    const enabled = vibrationToggle.checked;
                    console.log('Vibration toggle changed:', enabled);
                    localStorage.setItem('vibrationEnabled', enabled);
                    
                    // Apply vibration settings to document
                    if (enabled) {
                        document.body.classList.remove('no-vibration');
                    } else {
                        document.body.classList.add('no-vibration');
                    }
                });
            }

            if (animationsToggle) {
                animationsToggle.addEventListener('change', () => {
                    const enabled = animationsToggle.checked;
                    console.log('Animations toggle changed:', enabled);
                    localStorage.setItem('animationsEnabled', enabled);
                    
                    // Apply animation settings to document
                    if (enabled) {
                        document.body.classList.remove('no-animations');
                    } else {
                        document.body.classList.add('no-animations');
                    }
                });
            }

            if (testVibrationBtn) {
                testVibrationBtn.addEventListener('click', () => {
                    if (navigator.vibrate) {
                        navigator.vibrate(200);
                    }
                });
            }
            console.log('Settings handlers set up successfully');
        } catch (error) {
            console.error('Error setting up settings:', error);
        }
    }

    async loadProfile() {
            console.log('Loading profile data...');
            
            // Load real data from localStorage only
            const gameState = JSON.parse(localStorage.getItem('gameState') || '{}');
            const coins = parseInt(localStorage.getItem('coins') || '1000');
            const bestScore = parseInt(localStorage.getItem('bestScore') || '0');
            const gamesPlayed = parseInt(localStorage.getItem('gamesPlayed') || '0');
            
            // Load user profile from leaderboard
            let currentUser = null;
            if (window.leaderboardManager) {
                currentUser = window.leaderboardManager.currentUser;
            }
            
            console.log('Loaded data from localStorage:', {
                coins,
                bestScore,
                gamesPlayed,
                gameState
            });

            // Update user card with real data
            this.updateElement('user-name', this.generateUserName());
            this.updateElement('user-id', this.generateUserId());
            
            // Update mini stats in user card
            this.updateElement('mini-games', gamesPlayed);
            this.updateElement('mini-coins', coins.toLocaleString());

            // Update stats display with real data
            this.updateElement('profile-games-played', gamesPlayed);
            this.updateElement('profile-best-score', bestScore.toLocaleString());
            this.updateElement('profile-coins', coins.toLocaleString());
            
            // Load additional statistics
            const totalMoves = parseInt(localStorage.getItem('totalMoves') || '0');
            const totalMerges = parseInt(localStorage.getItem('totalMerges') || '0');
            const totalPlayTime = parseInt(localStorage.getItem('totalPlayTime') || '0');
            const wins = parseInt(localStorage.getItem('wins') || '0');
            const highestTile = parseInt(localStorage.getItem('highestTile') || '0');
            
            this.updateElement('profile-total-moves', totalMoves.toLocaleString());
            this.updateElement('profile-total-merges', totalMerges.toLocaleString());
            this.updateElement('profile-play-time', this.formatTime(totalPlayTime));
            this.updateElement('profile-wins', wins.toLocaleString());
            this.updateElement('profile-highest-tile', highestTile || 'Нет');

            // Update settings toggles with defaults
            this.updateToggle('profile-sound-toggle', true);
            this.updateSlider('profile-volume-slider', 'profile-volume-value', 50);
            this.updateToggle('vibration-toggle', true);
            this.updateToggle('animations-toggle', true);

            console.log('Profile data loaded successfully');
        } catch (error) {
            console.error('Error loading profile data:', error);
            this.loadDefaultData();
        }
    }

    loadDefaultData() {
        console.log('Loading default data...');
        
        // Show default values
        this.updateElement('profile-games-played', '0');
        this.updateElement('profile-best-score', '0');
        this.updateElement('profile-coins', '1,000');
        this.updateElement('profile-total-moves', '0');
        this.updateElement('profile-total-merges', '0');
        this.updateElement('profile-play-time', '0с');
        this.updateElement('profile-wins', '0');
        this.updateElement('profile-highest-tile', '0');

        // Default settings
        this.updateToggle('profile-sound-toggle', true);
        this.updateSlider('profile-volume-slider', 'profile-volume-value', 50);
        this.updateToggle('vibration-toggle', true);
        this.updateToggle('animations-toggle', true);

    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateToggle(id, checked) {
        const element = document.getElementById(id);
        if (element) {
            element.checked = checked;
        }
    }

    updateSlider(sliderId, valueId, value) {
        const slider = document.getElementById(sliderId);
        const valueEl = document.getElementById(valueId);
        
        if (slider) slider.value = value;
        if (valueEl) valueEl.textContent = value + '%';
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        if (hours > 0) {
            return `${hours}ч ${minutes}м ${secs}с`;
        } else if (minutes > 0) {
            return `${minutes}м ${secs}с`;
        } else {
            return `${secs}с`;
        }
    }

    generateUserName() {
        // Get or create user name from localStorage
        let userName = localStorage.getItem('userName');
        if (!userName) {
            const adjectives = ['Крутой', 'Быстрый', 'Умный', 'Ловкий', 'Мощный', 'Хитрый', 'Смелый', 'Дерзкий'];
            const nouns = ['Игрок', 'Мастер', 'Чемпион', 'Герой', 'Боец', 'Стратег', 'Гений', 'Легенда'];
            const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            userName = `${adj} ${noun}`;
            localStorage.setItem('userName', userName);
        }
        return userName;
    }

    generateUserId() {
        // Get or create user ID from localStorage
        let userId = localStorage.getItem('userId');
        if (!userId) {
            userId = '#' + Math.floor(Math.random() * 900000 + 100000);
            localStorage.setItem('userId', userId);
        }
        return userId;
    }

    async exportData() {
        try {
            const data = await window.userManager.exportData();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = `2048_profile_${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Данные экспортированы успешно!', 'success');
        } catch (error) {
            console.error('Export failed:', error);
            this.showMessage('Ошибка при экспорте данных', 'error');
        }
    }

    async importData(event) {
        const file = event.target.files[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            await window.userManager.importData(data);
            await this.loadProfileData();
            
            this.showMessage('Данные импортированы успешно!', 'success');
        } catch (error) {
            console.error('Import failed:', error);
            this.showMessage('Ошибка при импорте данных', 'error');
        }
    }

    async resetProgress() {
        const confirmed = confirm(
            'Вы уверены, что хотите сбросить весь прогресс?\n\n' +
            'Это действие удалит:\n' +
            '• Всю статистику игр\n' +
            '• Все достижения\n' +
            '• Монеты и покупки\n' +
            '• Настройки\n\n' +
            'Это действие нельзя отменить!'
        );
        
        if (confirmed) {
            try {
                await window.userManager.resetProgress();
                this.showMessage('Прогресс сброшен. Перезагрузка страницы...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'index.html';
                }, 2000);
            } catch (error) {
                console.error('Reset failed:', error);
                this.showMessage('Ошибка при сбросе прогресса', 'error');
            }
        }
    }

    handleUrlParameters() {
        // Check for URL parameters to auto-switch tabs
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        
        if (tab) {
            // Find and click the corresponding tab
            const tabButton = document.querySelector(`[data-tab="${tab}"]`);
            if (tabButton) {
                tabButton.click();
                console.log(`Auto-switched to ${tab} tab`);
            }
        }
    }

    showMessage(message, type = 'info') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `profile-message ${type}`;
        messageEl.textContent = message;
        
        // Style the message
        Object.assign(messageEl.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: '600',
            zIndex: '10000',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease'
        });
        
        // Set background color based on type
        switch (type) {
            case 'success':
                messageEl.style.background = 'linear-gradient(135deg, #4ecdc4, #44a08d)';
                break;
            case 'error':
                messageEl.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a52)';
                break;
            default:
                messageEl.style.background = 'linear-gradient(135deg, #78dbff, #667eea)';
        }
        
        document.body.appendChild(messageEl);
        
        // Animate in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (messageEl.parentNode) {
                    messageEl.parentNode.removeChild(messageEl);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize profile page when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded, initializing profile page...');
    
    // Ensure database is initialized
    if (!window.gameDB) {
        console.log('Initializing GameDatabase...');
        window.gameDB = new GameDatabase();
        // Wait a bit for database to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    // Initialize profile page
    window.profilePage = new ProfilePage();
    
    // Navigation is handled by toolbar-nav.js
});
