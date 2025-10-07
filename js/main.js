// Global variables
let game, graphics, bonusSystem, shop, audioManager;

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking welcome status...');
    
    // Check if user should see welcome screen
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    const urlParams = new URLSearchParams(window.location.search);
    const skipWelcome = urlParams.get('skip') === 'true';
    
    if (!hasSeenWelcome && !skipWelcome) {
        // First time user - redirect to welcome
        console.log('First time user, redirecting to welcome...');
        window.location.href = 'welcome.html';
        return;
    }
    
    // Mark that user has seen welcome (for future visits)
    localStorage.setItem('hasSeenWelcome', 'true');
    
    console.log('Initializing game...');
    initializeGame();
});

function initializeGame() {
    try {
        // Create graphics FIRST
        graphics = new Graphics2D();
        window.graphics = graphics;
        
        // Then create game (it will use graphics in updateDisplay)
        game = new Game2048();
        
        bonusSystem = new BonusSystem(game);
        window.bonusSystem = bonusSystem;
        
        // Initialize audio
        if (typeof AudioManager !== 'undefined') {
            audioManager = new AudioManager();
            window.audioManager = audioManager;
        }
        
        setupEventListeners();
        
        // Force immediate render of the board after everything is ready
        if (game && graphics) {
            console.log('Forcing initial board render...');
            game.updateDisplay();
            
            // Double-check render
            setTimeout(() => {
                const gameBoard = document.getElementById('game-board');
                if (gameBoard && gameBoard.children.length === 0) {
                    console.log('Board is empty, forcing render again...');
                    game.updateDisplay();
                }
            }, 100);
        }
        
        console.log('Game initialized successfully');
    } catch (error) {
        console.error('Error initializing game:', error);
    }
}

function initializeAudio() {
    try {
        if (!audioManager) {
            audioManager = new AudioManager();
            window.audioManager = audioManager; // Make globally accessible
            audioManager.resumeAudioContext();
        }
    } catch (error) {
        console.warn('Audio initialization failed, continuing without audio:', error);
        // Create dummy audio manager
        window.audioManager = {
            playSound: () => {},
            updateMusicForGameState: () => {},
            resumeAudioContext: () => {}
        };
    }
}

function setupEventListeners() {
    // Keyboard controls
    document.addEventListener('keydown', handleKeyPress);
    
    // Touch controls for mobile
    setupTouchControls();
    
    // Game controls
    const newGameBtn = document.getElementById('new-game-btn');
    if (newGameBtn) {
        newGameBtn.addEventListener('click', () => {
            startNewGame();
        });
    }
    
    // New game bonus button
    const newGameBonusBtn = document.getElementById('new-game-bonus');
    if (newGameBonusBtn) {
        newGameBonusBtn.addEventListener('click', () => {
            startNewGame();
        });
    }
    
    // Shop button (desktop)
    const shopBtn = document.getElementById('shop-btn');
    if (shopBtn) {
        shopBtn.addEventListener('click', () => {
            window.location.href = 'shop.html';
        });
    }
    
    // Setup modal controls
    setupModalControls();
    
    // Navigation handled by toolbar-nav.js
    
    // Profile tabs
    setupProfileTabs();
    
    // Window resize
    window.addEventListener('resize', () => {
        if (graphics) {
            graphics.resize();
        }
    });
    
    // Prevent scrolling on touch move only
    const gameBoard = document.getElementById('game-board');
    if (gameBoard) {
        gameBoard.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }
}

function handleKeyPress(event) {
    if (!game || game.gameOver) return;
    
    let moved = false;
    
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
            moved = game.move('up');
            break;
        case 'ArrowDown':
        case 's':
        case 'S':
            moved = game.move('down');
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            moved = game.move('left');
            break;
        case 'ArrowRight':
        case 'd':
        case 'D':
            moved = game.move('right');
            break;
        case 'u':
        case 'U':
            bonusSystem.useUndo();
            break;
        case 'r':
        case 'R':
            bonusSystem.useShuffle();
            break;
        case 'b':
        case 'B':
            bonusSystem.useBomb();
            break;
        case 'm':
        case 'M':
            // Cheat code: add 1000 coins
            if (event.ctrlKey || event.metaKey) {
                game.coins += 1000;
                game.updateDisplay();
                showMessage('💰 +1000 монет!', 'success');
            }
            break;
        case 'g':
        case 'G':
            // Cheat code: force game over (for testing)
            if (event.ctrlKey || event.metaKey) {
                console.log('Force game over triggered');
                game.gameOver = true;
                game.endGame();
            }
            break;
        case 'n':
        case 'N':
            startNewGame();
            break;
        case 'Escape':
            closeAllModals();
            break;
    }
    
    if (moved) {
        event.preventDefault();
        
        // Check achievements after each move
        const highestTile = bonusSystem.getHighestTile();
        bonusSystem.checkAchievements(game.score, highestTile);
        
        // Update music based on game state
        if (audioManager) {
            if (game.score > 10000) {
                audioManager.updateMusicForGameState('winning');
            } else if (checkDangerState()) {
                audioManager.updateMusicForGameState('danger');
            } else {
                audioManager.updateMusicForGameState('playing');
            }
        }
    }
}

function setupTouchControls() {
    const gameContainer = document.getElementById('game-container');
    if (!gameContainer) return;
    
    let startX, startY;
    
    gameContainer.addEventListener('touchstart', (e) => {
        const touch = e.touches[0];
        startX = touch.clientX;
        startY = touch.clientY;
    }, { passive: true });
    
    gameContainer.addEventListener('touchend', (e) => {
        if (!startX || !startY || !game || game.gameOver) return;
        
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        
        const deltaX = endX - startX;
        const deltaY = endY - startY;
        const minSwipeDistance = 50;
        
        if (Math.abs(deltaX) > minSwipeDistance || Math.abs(deltaY) > minSwipeDistance) {
            e.preventDefault();
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // Horizontal swipe
                if (deltaX > 0) {
                    game.move('right');
                } else {
                    game.move('left');
                }
            } else {
                // Vertical swipe
                if (deltaY > 0) {
                    game.move('down');
                } else {
                    game.move('up');
                }
            }
        }
        
        startX = null;
        startY = null;
    }, { passive: false });
}

function setupModalControls() {
    // Game over modal
    const restartBtn = document.getElementById('restart-btn');
    if (restartBtn) {
        restartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Restart button clicked');
            
            // Close modal first
            const modal = document.getElementById('game-over-modal');
            if (modal) {
                modal.classList.remove('active');
                modal.style.display = 'none';
            }
            
            // Start new game
            startNewGame();
            setActiveNavItem('nav-home');
        });
        console.log('Restart button handler attached');
    } else {
        console.error('Restart button not found');
    }
    
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            closeModal('game-over-modal');
        });
    }
    
    // Settings modal
    const settingsBtn = document.getElementById('settings-btn');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('Settings button clicked');
            openModal('settings-modal');
        });
        console.log('Settings button handler added');
    } else {
        console.log('Settings button not found - only available on desktop');
    }
    
    const closeSettingsBtn = document.getElementById('close-settings-btn');
    if (closeSettingsBtn) {
        closeSettingsBtn.addEventListener('click', () => {
            closeModal('settings-modal');
        });
    }
    
    // Shop modal
    const closeShopBtn = document.getElementById('close-shop-btn');
    if (closeShopBtn) {
        closeShopBtn.addEventListener('click', () => {
            closeModal('shop-modal');
        });
    }

    // Tasks modal
    const closeTasksBtn = document.getElementById('close-tasks-btn');
    if (closeTasksBtn) {
        closeTasksBtn.addEventListener('click', () => {
            closeModal('tasks-modal');
        });
    }

    // Leaderboard modal
    const closeLeaderboardBtn = document.getElementById('close-leaderboard-btn');
    if (closeLeaderboardBtn) {
        closeLeaderboardBtn.addEventListener('click', () => {
            closeModal('leaderboard-modal');
        });
    }

    // Profile modal
    const closeProfileBtn = document.getElementById('close-profile-btn');
    if (closeProfileBtn) {
        closeProfileBtn.addEventListener('click', () => {
            closeModal('profile-modal');
        });
    }
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal.id);
            }
        });
    });
}

function startNewGame() {
    console.log('startNewGame() called');
    
    if (game) {
        console.log('Game object exists, calling newGame()');
        game.newGame();
        console.log('Game reset completed');
    } else {
        console.error('Game object not found!');
    }
    
    if (bonusSystem) {
        bonusSystem.reset();
        console.log('Bonuses reset');
    }
    
    // Close all modals
    closeAllModals();
    
    if (audioManager) {
        audioManager.playSound('click');
        audioManager.updateMusicForGameState('playing');
    }
    
    showMessage('Новая игра начата!', 'success');
    console.log('startNewGame() completed');
}

function updateProfileStats() {
    // Update profile statistics
    const gamesPlayedEl = document.getElementById('profile-games-played');
    const bestScoreEl = document.getElementById('profile-best-score');
    
    if (gamesPlayedEl && window.userManager) {
        gamesPlayedEl.textContent = window.userManager.getGamesPlayed();
    }
    
    if (bestScoreEl && window.userManager) {
        bestScoreEl.textContent = window.userManager.getBestScore().toLocaleString();
    }
    
    // Update settings toggles
    if (window.userManager && window.userManager.isInitialized) {
        const soundToggle = document.getElementById('profile-sound-toggle');
        const volumeSlider = document.getElementById('profile-volume-slider');
        const volumeValue = document.getElementById('profile-volume-value');
        const vibrationToggle = document.getElementById('vibration-toggle');
        const animationsToggle = document.getElementById('animations-toggle');
        
        if (soundToggle) {
            soundToggle.checked = window.userManager.getSetting('soundEnabled');
        }
        if (volumeSlider && volumeValue) {
            const volume = window.userManager.getSetting('volume');
            volumeSlider.value = volume;
            volumeValue.textContent = volume + '%';
        }
        if (vibrationToggle) {
            vibrationToggle.checked = window.userManager.getSetting('vibrationEnabled');
        }
        if (animationsToggle) {
            animationsToggle.checked = window.userManager.getSetting('animationsEnabled');
        }
    }
}

function setupProfileTabs() {
    // Profile tab switching
    document.querySelectorAll('.profile-tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabName = btn.dataset.tab;
            
            // Update active tab button
            document.querySelectorAll('.profile-tab-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            // Update active tab content
            document.querySelectorAll('.profile-tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tabName + '-tab').classList.add('active');
        });
    });

    // Quick settings button
    const openProfileSettingsBtn = document.getElementById('open-profile-settings');
    if (openProfileSettingsBtn) {
        openProfileSettingsBtn.addEventListener('click', () => {
            // Open profile page with settings tab in new tab
            window.open('profile.html?tab=settings', '_blank');
        });
    }

    // Profile settings handlers
    const profileSoundToggle = document.getElementById('profile-sound-toggle');
    const profileVolumeSlider = document.getElementById('profile-volume-slider');
    const profileVolumeValue = document.getElementById('profile-volume-value');
    const vibrationToggle = document.getElementById('vibration-toggle');
    const animationsToggle = document.getElementById('animations-toggle');

    if (profileSoundToggle) {
        profileSoundToggle.addEventListener('change', async () => {
            const enabled = profileSoundToggle.checked;
            if (window.userManager) {
                await window.userManager.setSoundEnabled(enabled);
            }
            if (audioManager) {
                if (enabled) {
                    audioManager.enableSound();
                } else {
                    audioManager.disableSound();
                }
            }
        });
    }

    if (profileVolumeSlider && profileVolumeValue) {
        profileVolumeSlider.addEventListener('input', async () => {
            const volume = profileVolumeSlider.value;
            profileVolumeValue.textContent = volume + '%';
            
            if (window.userManager) {
                await window.userManager.setVolume(volume);
            }
            if (audioManager) {
                audioManager.setVolume(volume / 100);
            }
        });
    }

    if (vibrationToggle) {
        vibrationToggle.addEventListener('change', async () => {
            const enabled = vibrationToggle.checked;
            if (window.userManager) {
                await window.userManager.setVibrationEnabled(enabled);
            }
            if (window.vibrationManager) {
                window.vibrationManager.setEnabled(enabled);
                // Test vibration when enabled
                if (enabled) {
                    window.vibrationManager.test();
                }
            }
        });
    }

    if (animationsToggle) {
        animationsToggle.addEventListener('change', async () => {
            const enabled = animationsToggle.checked;
            if (window.userManager) {
                await window.userManager.setAnimationsEnabled(enabled);
            }
        });
    }
}

function openModal(modalId) {
    console.log('openModal called with:', modalId);
    const modal = document.getElementById(modalId);
    if (modal) {
        console.log('Modal found, adding active class');
        modal.classList.add('active');
        modal.style.display = 'flex'; // Force display
        console.log('Modal classes:', modal.className);
    } else {
        console.error('Modal not found:', modalId);
    }
    
    if (audioManager) {
        audioManager.playSound('click');
    }
    if (window.vibrationManager) {
        window.vibrationManager.onButtonClick();
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
    }
    
    // Reset navigation to home when closing modals
    setActiveNavItem('nav-home');
    
    if (audioManager) {
        audioManager.playSound('click');
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.classList.remove('active');
    });
    
    // Cancel bomb mode if active
    if (bonusSystem && bonusSystem.bombMode) {
        bonusSystem.cancelBombMode();
    }
    
    // Check if board is nearly full
    let emptyCells = 0;
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            if (game.board[i][j] === 0) {
                emptyCells++;
            }
        }
    }
    
    return emptyCells <= 2;
}

function showLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'flex';
    document.getElementById('game-container').style.display = 'none';
}
function hideLoadingScreen() {
    document.getElementById('loading-screen').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';
    
    // Add entrance animation
    if (typeof gsap !== 'undefined') {
        gsap.fromTo('#game-container', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 1, ease: "power2.out" }
        );
    } else {
        // Fallback without animation
        document.getElementById('game-container').style.opacity = '1';
    }
}

function showErrorMessage(message) {
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
        <div style="
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(231, 76, 60, 0.95);
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            z-index: 2000;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        ">
            <h2>Ошибка</h2>
            <p>${message}</p>
            <button onclick="location.reload()" style="
                margin-top: 15px;
                padding: 10px 20px;
                background: white;
                color: #e74c3c;
                border: none;
                border-radius: 8px;
                cursor: pointer;
                font-weight: bold;
            ">Обновить страницу</button>
        </div>
    `;
    document.body.appendChild(errorDiv);
}

function showMessage(text, type = 'info', duration = 2000) {
    const existingMessage = document.getElementById('global-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    const colors = {
        success: 'rgba(46, 204, 113, 0.9)',
        error: 'rgba(231, 76, 60, 0.9)',
        info: 'rgba(52, 152, 219, 0.9)',
        warning: 'rgba(243, 156, 18, 0.9)'
    };
    
    const message = document.createElement('div');
    message.id = 'global-message';
    message.textContent = text;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${colors[type]};
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1500;
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.2);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    `;
    
    document.body.appendChild(message);
    
    // Animate in
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(message, 
            { y: -50, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.3 }
        );
        
        // Auto-hide
        setTimeout(() => {
            gsap.to(message, {
                y: -50,
                opacity: 0,
                duration: 0.3,
                onComplete: () => {
                    if (message.parentNode) {
                        message.parentNode.removeChild(message);
                    }
                }
            });
        }, duration);
    } else {
        // Fallback without animation
        message.style.opacity = '1';
        setTimeout(() => {
            message.style.opacity = '0';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, duration);
    }
}

// Performance monitoring
function monitorPerformance() {
    let frameCount = 0;
    let lastTime = performance.now();
    
    function checkFPS() {
        frameCount++;
        const currentTime = performance.now();
        
        if (currentTime - lastTime >= 1000) {
            const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
            
            if (fps < 30) {
                console.warn('Low FPS detected:', fps);
                // Could implement quality reduction here
            }
            
            frameCount = 0;
            lastTime = currentTime;
        }
        
        requestAnimationFrame(checkFPS);
    }
    
    checkFPS();
}

// Start performance monitoring
monitorPerformance();

// Service Worker registration for offline support
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// iOS Navigation removed - handled by toolbar-nav.js
// This prevents conflicts between multiple navigation handlers

// Export for debugging
window.gameDebug = {
    game: () => game,
    graphics: () => graphics,
    bonusSystem: () => bonusSystem,
    shop: () => shop,
    audioManager: () => audioManager
};
